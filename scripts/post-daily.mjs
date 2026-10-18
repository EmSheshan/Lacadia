// Posts the next queued Lacadia card to every configured platform.
//
//   node scripts/post-daily.mjs --dry-run       # render everything, send nothing
//   node scripts/post-daily.mjs                 # live
//   node scripts/post-daily.mjs --only bluesky  # restrict to one platform
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

function loadQueue() {
    if (!fs.existsSync(QUEUE_PATH)) {
        console.error(`No queue at ${QUEUE_PATH}. Run: node scripts/build-queue.mjs`);
        process.exit(1);
    }
    return JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
}

function saveQueue(queue) {
    fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');
}

const platforms = ALL_PLATFORMS
    .filter((p) => !ONLY || p.name === ONLY)
    .filter((p) => {
        if (p.isConfigured()) return true;
        console.log(`skip ${p.name}: not configured`);
        return false;
    });

if (platforms.length === 0) {
    console.error('No platforms configured. Set the secrets listed in docs/SOCIAL_SETUP.md');
    process.exit(1);
}
console.log(`platforms: ${platforms.map((p) => p.name).join(', ')}${DRY ? '  [DRY RUN]' : ''}`);

const queue = loadQueue();
const active = platforms.map((p) => p.name);

// First entry that still owes a post to at least one active platform.
const entry = queue.entries.find((e) => active.some((n) => !e.posted?.[n]));

if (!entry) {
    console.log('Queue exhausted -- every card has been posted to every active platform.');
    ghOutput('exhausted', 'true');
    process.exit(0);
}
ghOutput('exhausted', 'false');

const dex = pokedex[entry.key];
if (!dex) {
    console.error(`Queue entry "${entry.key}" has no pokedex record.`);
    process.exit(1);
}

const caption = renderAll(dex);
const imagePath = path.resolve(entry.image);
if (!fs.existsSync(imagePath)) {
    console.error(`Missing image ${entry.image}. Run: node scripts/build-social-images.mjs`);
    process.exit(1);
}
const imageBytes = fs.readFileSync(imagePath);

console.log(`\n=== ${entry.name} (#${entry.num}) ===`);
console.log(`image: ${entry.image} (${(imageBytes.length / 1024).toFixed(0)}KB)`);

const results = [];
for (const platform of platforms) {
    if (entry.posted?.[platform.name]) {
        console.log(`\n-- ${platform.name}: already posted ${entry.posted[platform.name].at}`);
        continue;
    }

    const text = platform.name === 'bluesky' ? caption.short : caption.tumblrBody;
    console.log(`\n-- ${platform.name} --`);
    console.log(text);
    if (platform.name === 'tumblr') console.log(`[tags] ${caption.tags.join(', ')}`);
    console.log(`[alt] ${caption.alt.slice(0, 110)}${caption.alt.length > 110 ? '...' : ''}`);

    if (DRY) {
        console.log(`[dry run] ${text.length} chars -- not sent`);
        results.push({ platform: platform.name, ok: true, dry: true });
        continue;
    }

    try {
        const res = platform.name === 'bluesky'
            ? await platform.post({
                text,
                image: imageBytes,
                alt: caption.alt,
                mimeType: 'image/jpeg',
                width: IMAGE_SIZE,
                height: IMAGE_SIZE,
            })
            : await platform.post({
                imagePath,
                body: text,
                alt: caption.alt,
                tags: caption.tags,
            });

        // Record immediately: a crash after this must not repost.
        entry.posted = entry.posted ?? {};
        entry.posted[platform.name] = { at: new Date().toISOString(), url: res.url };
        saveQueue(queue);

        console.log(`posted -> ${res.url}`);
        results.push({ platform: platform.name, ok: true, url: res.url });
    } catch (err) {
        console.error(`FAILED ${platform.name}: ${err.message}`);
        results.push({ platform: platform.name, ok: false, error: err.message });
    }
}

const attempted = results.length;
const failed = results.filter((r) => !r.ok);
console.log(`\n${attempted - failed.length}/${attempted} succeeded`);
ghOutput('pokemon', entry.name);
ghOutput('remaining', String(queue.entries.filter((e) => active.some((n) => !e.posted?.[n])).length));

// Fail the job only if nothing got through, so one dead platform doesn't mask a
// working one -- but total silence still raises a notification.
if (attempted > 0 && failed.length === attempted) process.exit(1);
