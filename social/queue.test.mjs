import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pokedex } from '../pokedex.js';

const queue = JSON.parse(fs.readFileSync(new URL('./queue.json', import.meta.url), 'utf8'));
const startPoints = JSON.parse(fs.readFileSync(new URL('./start-points.json', import.meta.url), 'utf8'));

const firstUnposted = (platform) => queue.entries.find((e) => !e.posted?.[platform]);

test('each platform resumes at the card after its last hand-posted one', () => {
    for (const platform of ['bluesky', 'tumblr']) {
        const last = startPoints[platform];
        const lastNum = Object.values(pokedex).find((p) => p.name === last)?.num;
        assert.ok(lastNum, `${last} exists in the pokedex`);
        const next = firstUnposted(platform);
        assert.ok(next, `${platform} has something queued`);
        assert.ok(next.num > lastNum,
            `${platform} resumes after ${last} (#${lastNum}), got ${next.name} (#${next.num})`);
    }
});

test('the two platforms are where the user said they are', () => {
    assert.equal(firstUnposted('bluesky').name, 'Kheprini');
    assert.equal(firstUnposted('tumblr').name, 'Marazcal');
});

test('queue is in ascending dex order', () => {
    const nums = queue.entries.map((e) => e.num);
    assert.deepEqual(nums, [...nums].sort((a, b) => a - b));
});

test('cards already posted by hand are marked, not re-queued', () => {
    // Tumblr is furthest behind, so it owes every entry in the queue.
    const tumblrBackfilled = queue.entries.filter((e) => e.posted?.tumblr?.backfilled);
    assert.equal(tumblrBackfilled.length, 0, 'tumblr starts the queue, nothing backfilled');

    // Bluesky is 5 ahead, so exactly the gap cards are marked for it.
    const blueskyBackfilled = queue.entries.filter((e) => e.posted?.bluesky?.backfilled);
    assert.equal(blueskyBackfilled.length, 5);
    assert.deepEqual(blueskyBackfilled.map((e) => e.name),
        ['Marazcal', 'Iguavadon', 'Tortarma-Polar', 'Tortarma-Solar', 'Tortality']);
});

test('every queued entry has a real pokedex record and an image on disk', () => {
    for (const e of queue.entries) {
        assert.ok(pokedex[e.key], `${e.key} in pokedex`);
        assert.ok(fs.existsSync(path.resolve(e.image)), `${e.image} exists`);
    }
});

test('no entry is queued twice', () => {
    const keys = queue.entries.map((e) => e.key);
    assert.equal(new Set(keys).size, keys.length);
});
