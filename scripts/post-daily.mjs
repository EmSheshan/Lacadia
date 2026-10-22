// Posts the next queued Lacadia card to every configured platform.
//
//   npm run post:dry                            # render everything, send nothing
//   npm run post                                # live
//   node scripts/post-daily.mjs --only bluesky  # restrict to one platform
//
// Each platform has its own cursor: it posts ITS next unposted card. Platforms
// sit at different points in the dex (they were posted by hand at different
// rates), so on any given day they are usually posting different cards. One post
// per platform per day.
//
// A platform is active only if its secrets are present; otherwise it is skipped
// cleanly. State is written after each individual success so a partial failure
// resumes instead of double-posting.

import fs from 'node:fs';
import path from 'node:path';
import { pokedex } from '../pokedex.js';
import { renderAll } from '../social/caption.mjs';
import * as bluesky from '../social/platforms/bluesky.mjs';
import * as tumblr from '../social/platforms/tumblr.mjs';

const QUEUE_PATH = path.resolve('social/queue.json');
const IMAGE_SIZE = 1080; // build-social-images.mjs guarantees square 1080

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const onlyIdx = argv.indexOf('--only');
const ONLY = onlyIdx !== -1 ? argv[onlyIdx + 1] : null;

const ALL_PLATFORMS = [bluesky, tumblr];

function ghOutput(key, value) {
    if (process.env.GITHUB_OUTPUT) {
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
    }
}

if (!fs.existsSync(QUEUE_PATH)) {
    console.error(`No queue at ${QUEUE_PATH}. Run: npm run build:queue`);
    process.exit(1);
}
const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
const saveQueue = () =>
    fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');

const platforms = ALL_PLATFORMS
    .filter((p) => !ONLY || p.name === ONLY)
    .filter((p) => {
        if (p.isConfigured()) return true;
        const missing = p.missingKeys?.() ?? [];
        console.log(`skip ${p.name}: not configured${missing.length ? ` (missing ${missing.join(', ')})` : ''}`);
        return false;
    });

if (platforms.length === 0) {
    console.error('\nNo platforms configured. See docs/SOCIAL_SETUP.md for the secret names.');
    process.exit(1);
}
console.log(`platforms: ${platforms.map((p) => p.name).join(', ')}${DRY ? '  [DRY RUN]' : ''}`);

const results = [];
let exhausted = 0;

for (const platform of platforms) {
    // Each platform advances on its own cursor.
    const entry = queue.entries.find((e) => !e.posted?.[platform.name]);

    if (!entry) {
        console.log(`\n-- ${platform.name}: queue exhausted, nothing left to post`);
        exhausted++;
        continue;
    }

    const dex = pokedex[entry.key];
    if (!dex) {
        console.error(`\nFAILED ${platform.name}: queue entry "${entry.key}" has no pokedex record`);
        results.push({ platform: platform.name, ok: false, error: 'missing pokedex record' });
        continue;
    }

    const imagePath = path.resolve(entry.image);
    if (!fs.existsSync(imagePath)) {
        console.error(`\nFAILED ${platform.name}: missing image ${entry.image} -- run npm run build:images`);
        results.push({ platform: platform.name, ok: false, error: 'missing image' });
        continue;
    }

    const caption = renderAll(dex);
    const text = platform.name === 'bluesky' ? caption.short : caption.tumblrBody;
    const imageBytes = fs.readFileSync(imagePath);

    console.log(`\n-- ${platform.name} -> ${entry.name} (#${entry.num}) --`);
    console.log(`image: ${entry.image} (${(imageBytes.length / 1024).toFixed(0)}KB)`);
    console.log(text);
    if (platform.name === 'tumblr') console.log(`[tags] ${caption.tags.join(', ')}`);
    console.log(`[alt] ${caption.alt.slice(0, 100)}${caption.alt.length > 100 ? '...' : ''}`);

    if (DRY) {
        console.log(`[dry run] ${text.length} chars -- not sent`);
        results.push({ platform: platform.name, ok: true, dry: true, card: entry.name });
        continue;
    }

    try {
        const res = platform.name === 'bluesky'
            ? await platform.post({
                text, image: imageBytes, alt: caption.alt,
                mimeType: 'image/jpeg', width: IMAGE_SIZE, height: IMAGE_SIZE,
            })
            : await platform.post({
                imagePath, body: text, alt: caption.alt, tags: caption.tags,
            });

        // Record immediately: a crash after this must not repost.
        entry.posted = entry.posted ?? {};
        entry.posted[platform.name] = { at: new Date().toISOString(), url: res.url };
        saveQueue();

        console.log(`posted -> ${res.url}`);
        results.push({ platform: platform.name, ok: true, url: res.url, card: entry.name });
    } catch (err) {
        console.error(`FAILED ${platform.name}: ${err.message}`);
        results.push({ platform: platform.name, ok: false, error: err.message });
    }
}

console.log('\n--- summary ---');
for (const p of platforms) {
    const left = queue.entries.filter((e) => !e.posted?.[p.name]).length;
    const r = results.find((x) => x.platform === p.name);
    console.log(`${p.name.padEnd(8)} ${r ? (r.ok ? (r.dry ? 'dry-ok ' : 'posted ') : 'FAILED ') : 'idle   '} ${(r?.card ?? '-').padEnd(16)} ${left} left`);
}

ghOutput('exhausted', exhausted === platforms.length ? 'true' : 'false');
ghOutput('cards', results.filter((r) => r.ok).map((r) => r.card).join(', ') || 'none');

const attempted = results.length;
const failed = results.filter((r) => !r.ok);
// Fail only if nothing got through, so one dead platform doesn't mask a working one.
if (attempted > 0 && failed.length === attempted) process.exit(1);
