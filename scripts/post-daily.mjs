// Posts the next queued Lacadia card to every configured platform.
//
//   npm run post:dry                            # render everything, send nothing
//   npm run post                                # live
//   node scripts/post-daily.mjs --only bluesky  # restrict to one platform
//
// Each platform has its own cursor: it posts ITS next unposted card. Platforms
// sit at different points in the dex (they were hand-posted at different
// rates), so on any given day they are usually posting different cards.
//
// Alternate forms of one species go out as a single multi-image post, captioned
// with the base species name -- the forms share their kind and description
// verbatim, so separate posts would read as duplicates.
//
// A platform is active only if its secrets are present; otherwise it is skipped
// cleanly. State is written after each success so a partial failure resumes
// instead of double-posting.

import fs from 'node:fs';
import path from 'node:path';
import { pokedex } from '../pokedex.js';
import { renderAll, mergeForms, baseName } from '../social/caption.mjs';
import * as bluesky from '../social/platforms/bluesky.mjs';
import * as tumblr from '../social/platforms/tumblr.mjs';
import * as instagram from '../social/platforms/instagram.mjs';

const QUEUE_PATH = path.resolve('social/queue.json');
const IMAGE_SIZE = 1080; // build-social-images.mjs guarantees square 1080
const MAX_PER_POST = 4;  // Bluesky's ceiling, and the most forms this dex has

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const onlyIdx = argv.indexOf('--only');
const ONLY = onlyIdx !== -1 ? argv[onlyIdx + 1] : null;

const ALL_PLATFORMS = [bluesky, tumblr, instagram];

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

/**
 * The cards this platform should post next: normally one, but all of a
 * species' outstanding alternate forms when the next card is one of them.
 */
function nextGroup(platformName) {
    const first = queue.entries.find((e) => !e.posted?.[platformName]);
    if (!first) return [];

    const base = baseName(first.name);
    if (base === first.name) return [first]; // not an alternate form

    return queue.entries
        .filter((e) => baseName(e.name) === base && !e.posted?.[platformName])
        .slice(0, MAX_PER_POST);
}

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
    const group = nextGroup(platform.name);

    if (group.length === 0) {
        console.log(`\n-- ${platform.name}: queue exhausted, nothing left to post`);
        exhausted++;
        continue;
    }

    const dexEntries = group.map((e) => pokedex[e.key]);
    const missingDex = group.filter((e, i) => !dexEntries[i]).map((e) => e.key);
    if (missingDex.length) {
        console.error(`\nFAILED ${platform.name}: no pokedex record for ${missingDex.join(', ')}`);
        results.push({ platform: platform.name, ok: false, error: 'missing pokedex record' });
        continue;
    }

    const imagePaths = group.map((e) => path.resolve(e.image));
    const missingImg = group.filter((e, i) => !fs.existsSync(imagePaths[i])).map((e) => e.image);
    if (missingImg.length) {
        console.error(`\nFAILED ${platform.name}: missing ${missingImg.join(', ')} -- run npm run build:images`);
        results.push({ platform: platform.name, ok: false, error: 'missing image' });
        continue;
    }

    const caption = renderAll(mergeForms(dexEntries));
    const text = {
        bluesky: caption.short,
        tumblr: caption.tumblrBody,
        instagram: caption.long,
    }[platform.name];

    const label = group.length > 1
        ? `${baseName(group[0].name)} (${group.map((e) => e.name.split('-')[1]).join(' + ')})`
        : `${group[0].name} (#${group[0].num})`;

    console.log(`\n-- ${platform.name} -> ${label} --`);
    console.log(`images: ${group.map((e) => e.image).join(', ')}`);
    console.log(text);
    if (platform.name === 'tumblr') console.log(`[tags] ${caption.tags.join(', ')}`);
    console.log(`[alt] ${caption.alt.slice(0, 100)}${caption.alt.length > 100 ? '...' : ''}`);

    if (DRY) {
        console.log(`[dry run] ${text.length} chars, ${group.length} image(s) -- not sent`);
        results.push({ platform: platform.name, ok: true, dry: true, card: label });
        continue;
    }

    try {
        const args = {
            bluesky: () => ({
                text,
                images: imagePaths.map((p) => ({ bytes: fs.readFileSync(p), alt: caption.alt })),
                width: IMAGE_SIZE, height: IMAGE_SIZE,
            }),
            tumblr: () => ({ imagePaths, body: text, alt: caption.alt, tags: caption.tags }),
            // Meta fetches the images itself, so it gets repo-relative paths.
            instagram: () => ({ images: group.map((e) => e.image), caption: text }),
        }[platform.name]();

        const res = await platform.post(args);

        // Record every card in the group: one post covers all of them.
        const stamp = { at: new Date().toISOString(), url: res.url };
        for (const e of group) {
            e.posted = e.posted ?? {};
            e.posted[platform.name] = stamp;
        }
        saveQueue();

        console.log(`posted -> ${res.url}`);
        results.push({ platform: platform.name, ok: true, url: res.url, card: label });
    } catch (err) {
        console.error(`FAILED ${platform.name}: ${err.message}`);
        results.push({ platform: platform.name, ok: false, error: err.message });
    }
}

console.log('\n--- summary ---');
for (const p of platforms) {
    const left = queue.entries.filter((e) => !e.posted?.[p.name]).length;
    const r = results.find((x) => x.platform === p.name);
    console.log(`${p.name.padEnd(10)} ${r ? (r.ok ? (r.dry ? 'dry-ok ' : 'posted ') : 'FAILED ') : 'idle   '} ${(r?.card ?? '-').padEnd(30)} ${left} left`);
}

ghOutput('exhausted', exhausted === platforms.length ? 'true' : 'false');
ghOutput('cards', results.filter((r) => r.ok).map((r) => r.card).join(', ') || 'none');

const attempted = results.length;
const failed = results.filter((r) => !r.ok);
// Fail only if nothing got through, so one dead platform doesn't mask a working one.
if (attempted > 0 && failed.length === attempted) process.exit(1);
