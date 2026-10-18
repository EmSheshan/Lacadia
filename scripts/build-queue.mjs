// Generates social/queue.json: the posting order, in dex order, starting after
// the last card that was posted by hand.
//
//   node scripts/build-queue.mjs                  # default: resume after Tortality
//   node scripts/build-queue.mjs --after Kheprini # resume after someone else
//
// Regenerating preserves any posted timestamps already recorded.

import fs from 'node:fs';
import path from 'node:path';
import { pokedex } from '../pokedex.js';

const QUEUE_PATH = path.resolve('social/queue.json');
const IMAGE_DIR = 'socialImages';

const afterArg = process.argv.indexOf('--after');
const AFTER = (afterArg !== -1 ? process.argv[afterArg + 1] : 'Tortality').toLowerCase();

const ordered = Object.entries(pokedex)
    .map(([key, e]) => ({ key, num: e.num, name: e.name }))
    .sort((a, b) => a.num - b.num || a.name.localeCompare(b.name));

const cut = ordered.findIndex((e) => e.name.toLowerCase() === AFTER);
if (cut === -1) {
    console.error(`No pokedex entry named "${AFTER}".`);
    process.exit(1);
}

// Carry over state from an existing queue so regenerating is non-destructive.
const previous = fs.existsSync(QUEUE_PATH)
    ? JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'))
    : { entries: [] };
const priorPosted = new Map(previous.entries.map((e) => [e.key, e.posted ?? {}]));

const missing = [];
const entries = ordered.slice(cut + 1).map((e) => {
    const image = `${IMAGE_DIR}/${e.key}.jpg`;
    if (!fs.existsSync(path.resolve(image))) missing.push(`${e.name} -> ${image}`);
    return {
        key: e.key,
        num: e.num,
        name: e.name,
        image,
        posted: priorPosted.get(e.key) ?? {},
    };
});

if (missing.length) {
    console.error(`Missing images for ${missing.length} queued entries:`);
    missing.forEach((m) => console.error('  ' + m));
    console.error('Run: node scripts/build-social-images.mjs');
    process.exit(1);
}

const queue = {
    generated: new Date().toISOString().slice(0, 10),
    resumesAfter: ordered[cut].name,
    note: 'Dex order. Edit or reorder by hand; the daily job takes the first entry with an unposted platform.',
    entries,
};

fs.mkdirSync(path.dirname(QUEUE_PATH), { recursive: true });
fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');

console.log(`resumes after : ${queue.resumesAfter}`);
console.log(`queued        : ${entries.length} cards`);
console.log(`first         : ${entries[0]?.name} (#${entries[0]?.num})`);
console.log(`last          : ${entries.at(-1)?.name} (#${entries.at(-1)?.num})`);
console.log(`runs out      : ${new Date(Date.now() + entries.length * 864e5).toISOString().slice(0, 10)} at 1/day`);
