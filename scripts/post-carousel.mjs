// Replaces the Instagram single-image posts with the new carousels, one
// species every two days, in dex order.
//
//   node scripts/post-carousel.mjs --dry-run     # show the plan, send nothing
//   node scripts/post-carousel.mjs               # live
//   node scripts/post-carousel.mjs --force       # ignore the two-day gap
//
// Each run:
//   1. Does nothing if the last carousel went up less than two days ago, or
//      it's before 9am in Chicago (the workflow runs daily at two UTC hours).
//   2. Posts the next species' carousel (socialCarousel/<name>-1.jpg, -2 ...),
//      fetched by Meta from GitHub Pages, with the usual long caption.
//   3. Only after that succeeds, finds the species' old post(s) -- captions
//      whose first line starts with the species name -- and deletes them.
//      Deleting is skipped, never guessed, when the match is unclear: more than
//      MAX_DELETE posts match, or the API refuses. Anything left is recorded in
//      the queue under `leftover` for deleting by hand.
//
// State lives in social/carousel-queue.json (created on the first run).

import fs from 'node:fs';
import path from 'node:path';
import { pokedex } from '../pokedex.js';
import { renderAll, mergeForms, baseName } from '../social/caption.mjs';
import * as instagram from '../social/platforms/instagram.mjs';
import { oldPostsFor } from '../social/match.mjs';

const QUEUE_PATH = path.resolve('social/carousel-queue.json');
const DIR = 'socialCarousel';
const GAP_HOURS = 47;          // "every two days", with an hour of slack for a late scheduler
const MAX_DELETE = 3;          // more matches than this means the match is unclear: don't delete

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const FORCE = argv.includes('--force');

const ghOutput = (k, v) => process.env.GITHUB_OUTPUT && fs.appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`);
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');

// ---------------------------------------------------------------- queue

/** Species in dex order, grouped like build-carousel.mjs names its files. */
function buildEntries() {
    const groups = new Map();
    for (const [key, e] of Object.entries(pokedex).sort((a, b) => a[1].num - b[1].num)) {
        const base = baseName(e.name);
        if (!groups.has(base)) groups.set(base, []);
        groups.get(base).push(key);
    }
    return [...groups.entries()].map(([name, keys]) => ({
        name,
        keys,
        file: keys.length > 1 ? norm(name) : keys[0],   // socialCarousel/<file>-N.jpg
    }));
}

let queue;
if (fs.existsSync(QUEUE_PATH)) {
    queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
} else {
    queue = {
        note: 'Instagram carousel replacements, one species every two days in dex order. '
            + 'posted = the new carousel; deleted = old posts removed; leftover = old posts to delete by hand.',
        entries: buildEntries(),
    };
}
const save = () => { if (!DRY) fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n'); };

// ---------------------------------------------------------------- due?

const last = queue.entries.filter((e) => e.posted).map((e) => Date.parse(e.posted.at)).sort((a, b) => b - a)[0];
const hoursSince = last ? (Date.now() - last) / 36e5 : Infinity;
if (!FORCE && hoursSince < GAP_HOURS) {
    console.log(`not due: last carousel ${hoursSince.toFixed(1)}h ago (posting every ${GAP_HOURS + 1}h)`);
    ghOutput('posted', 'none');
    process.exit(0);
}

// Post at about 9am Chicago time (the workflow runs at two UTC hours to cover
// daylight saving; the earlier one is 8am in winter and is skipped here).
const POST_HOUR = 9, TZ = 'America/Chicago';
const localHour = Number(new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', hourCycle: 'h23' }).format(new Date()));
if (!FORCE && !DRY && localHour < POST_HOUR) {
    console.log(`not yet: ${localHour}:00 in Chicago, posting from ${POST_HOUR}:00`);
    ghOutput('posted', 'none');
    process.exit(0);
}

const entry = queue.entries.find((e) => !e.posted);
if (!entry) {
    console.log('every species has had its carousel -- nothing left');
    ghOutput('posted', 'none');
    ghOutput('exhausted', 'true');
    process.exit(0);
}

// ---------------------------------------------------------------- post

const slides = fs.existsSync(DIR)
    ? fs.readdirSync(DIR).filter((f) => new RegExp(`^${entry.file}-\\d+\\.jpg$`).test(f))
        .sort((a, b) => parseInt(a.split('-').pop()) - parseInt(b.split('-').pop()))
    : [];
if (!slides.length) {
    console.error(`no slides for ${entry.name} (${DIR}/${entry.file}-N.jpg) -- run node scripts/build-carousel.mjs`);
    process.exit(1);
}
const images = slides.map((f) => `${DIR}/${f}`);
const caption = renderAll(mergeForms(entry.keys.map((k) => pokedex[k]))).long;

console.log(`-- ${entry.name}: ${images.length} slides${DRY ? '  [DRY RUN]' : ''}`);
images.forEach((i) => console.log(`   ${instagram.imageUrl(i)}`));
console.log(caption);


const configured = instagram.isConfigured();
if (!configured) {
    console.log(`\ninstagram not configured (missing ${instagram.missingKeys().join(', ')})`);
    if (!DRY) process.exit(1);
}

const keep = new Set(queue.entries.flatMap((e) => (e.posted?.id ? [e.posted.id] : [])));

if (DRY) {
    if (configured) {
        const media = await instagram.listMedia();
        const old = oldPostsFor(media, entry.name, keep);
        console.log(`\nwould delete ${old.length} old post(s)${old.length > MAX_DELETE ? ' -- too many, would skip and leave them' : ''}:`);
        old.forEach((m) => console.log(`   ${m.timestamp}  ${m.permalink}`));
    }
    console.log('\n[dry run] nothing sent');
    ghOutput('posted', `${entry.name} (dry run)`);
    process.exit(0);
}

const res = await instagram.post({ images, caption });
entry.posted = { at: new Date().toISOString(), id: res.id, url: res.url };
save();
console.log(`posted -> ${res.url}`);
keep.add(res.id);

// ---------------------------------------------------------------- replace

let media = [];
try {
    media = await instagram.listMedia();
} catch (err) {
    console.error(`could not list posts, old ones left in place: ${err.message}`);
}
const old = oldPostsFor(media, entry.name, keep);
entry.deleted = [];
entry.leftover = [];
if (old.length > MAX_DELETE) {
    console.log(`${old.length} posts match "${entry.name}" -- too many to be sure, leaving them all`);
    entry.leftover = old.map((m) => m.permalink);
} else {
    for (const m of old) {
        try {
            await instagram.deleteMedia(m.id);
            entry.deleted.push(m.permalink);
            console.log(`deleted old post ${m.permalink}`);
        } catch (err) {
            entry.leftover.push(m.permalink);
            console.error(`could not delete ${m.permalink}: ${err.message}`);
        }
    }
}
if (!old.length) console.log('no old post found for this species');
save();

ghOutput('posted', entry.name);
ghOutput('leftover', entry.leftover.length ? entry.leftover.join(' ') : '');
