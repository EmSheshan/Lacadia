// Generates social/queue.json: one shared list of cards in dex order, with
// per-platform posted state.
//
// Platforms are at different points in the dex because they were posted by hand
// at different rates. social/start-points.json records where each one got to.
// The queue spans from the furthest-behind platform onward, and cards that a
// further-ahead platform has already had are pre-marked for it, so nothing is
// reposted and nothing is skipped.
//
//   node scripts/build-queue.mjs
//   node scripts/build-queue.mjs --set tumblr=Tortality   # correct one platform
//
// Regenerating preserves posted state recorded by the live job.

import fs from 'node:fs';
import path from 'node:path';
import { pokedex } from '../pokedex.js';

const QUEUE_PATH = path.resolve('social/queue.json');
const START_PATH = path.resolve('social/start-points.json');
const IMAGE_DIR = 'socialImages';
const PLATFORMS = ['bluesky', 'tumblr'];

const startPoints = JSON.parse(fs.readFileSync(START_PATH, 'utf8'));

// --set platform=Name overrides and persists a start point.
for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] !== '--set') continue;
    const [p, name] = (process.argv[i + 1] ?? '').split('=');
    if (!PLATFORMS.includes(p) || !name) {
        console.error(`--set expects one of ${PLATFORMS.join('|')}=<PokemonName>`);
        process.exit(1);
    }
    startPoints[p] = name;
    fs.writeFileSync(START_PATH, JSON.stringify(startPoints, null, 2) + '\n');
    console.log(`start point for ${p} set to ${name}`);
}

const ordered = Object.entries(pokedex)
    .map(([key, e]) => ({ key, num: e.num, name: e.name }))
    .sort((a, b) => a.num - b.num || a.name.localeCompare(b.name));

const indexOfName = (name) => {
    const i = ordered.findIndex((e) => e.name.toLowerCase() === String(name).toLowerCase());
    if (i === -1) {
        console.error(`No pokedex entry named "${name}" (check social/start-points.json)`);
        process.exit(1);
    }
    return i;
};

// Where each platform resumes: the card after its last hand-posted one.
const resumeAt = {};
for (const p of PLATFORMS) resumeAt[p] = indexOfName(startPoints[p]) + 1;

// The queue must reach back far enough to cover the furthest-behind platform.
const queueStart = Math.min(...PLATFORMS.map((p) => resumeAt[p]));

const previous = fs.existsSync(QUEUE_PATH)
    ? JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'))
    : { entries: [] };
const priorPosted = new Map((previous.entries ?? []).map((e) => [e.key, e.posted ?? {}]));

const missing = [];
const entries = ordered.slice(queueStart).map((card, offset) => {
    const absolute = queueStart + offset;
    const image = `${IMAGE_DIR}/${card.key}.jpg`;
    if (!fs.existsSync(path.resolve(image))) missing.push(`${card.name} -> ${image}`);

    // Start from whatever the live job already recorded, so regenerating is safe.
    const posted = { ...(priorPosted.get(card.key) ?? {}) };

    // Then mark anything a platform had already covered by hand.
    for (const p of PLATFORMS) {
        if (absolute < resumeAt[p] && !posted[p]) {
            posted[p] = { backfilled: true, note: 'posted by hand before automation' };
        }
    }
    return { key: card.key, num: card.num, name: card.name, image, posted };
});

if (missing.length) {
    console.error(`Missing images for ${missing.length} entries:`);
    missing.forEach((m) => console.error('  ' + m));
    console.error('Run: npm run build:images');
    process.exit(1);
}

fs.writeFileSync(QUEUE_PATH, JSON.stringify({
    generated: new Date().toISOString().slice(0, 10),
    resumesAfter: Object.fromEntries(PLATFORMS.map((p) => [p, startPoints[p]])),
    note: 'Dex order, shared list, per-platform posted state. Each platform advances independently: one card per platform per day. Reorder by editing entries.',
    entries,
}, null, 2) + '\n');

console.log(`queue: ${entries.length} entries, ${ordered[queueStart].name} -> ${ordered.at(-1).name}\n`);
for (const p of PLATFORMS) {
    const owed = entries.filter((e) => !e.posted[p]);
    const next = owed[0];
    console.log(`${p.padEnd(8)} resumes after ${startPoints[p].padEnd(12)} next: ${(next?.name ?? '-').padEnd(16)} ${owed.length} cards left`);
}
