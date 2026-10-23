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

test('the queue starts where each platform needs it to', () => {
    assert.equal(queue.entries[0].name, 'Marazcal',
        'queue reaches back to the furthest-behind platform');

    const firstForBluesky = queue.entries.find((e) => !e.posted?.bluesky?.backfilled);
    assert.equal(firstForBluesky.name, 'Kheprini',
        'bluesky picks up immediately after the backfilled gap');
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

    // Instagram was hand-posted to the same point as Bluesky, so the same gap.
    const igBackfilled = queue.entries.filter((e) => e.posted?.instagram?.backfilled);
    assert.deepEqual(igBackfilled.map((e) => e.name), blueskyBackfilled.map((e) => e.name));
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

test('TUMBLR_BLOG accepts a name, a host, or either dashboard URL', async () => {
    const { blogHost } = await import('./platforms/tumblr.mjs');

    // what the user would type
    assert.equal(blogHost('emsh'), 'emsh.tumblr.com');
    assert.equal(blogHost('  emsh  '), 'emsh.tumblr.com');
    assert.equal(blogHost('emsh.tumblr.com'), 'emsh.tumblr.com');

    // what the address bar gives you
    assert.equal(blogHost('https://www.tumblr.com/blog/emsh'), 'emsh.tumblr.com');
    assert.equal(blogHost('https://www.tumblr.com/emsh'), 'emsh.tumblr.com');
    assert.equal(blogHost('www.tumblr.com/blog/emsh'), 'emsh.tumblr.com');
    assert.equal(blogHost('https://emsh.tumblr.com/'), 'emsh.tumblr.com');

    // a custom domain must not get .tumblr.com bolted on
    assert.equal(blogHost('art.example.com'), 'art.example.com');

    // nothing usable
    assert.equal(blogHost(''), '');
    assert.equal(blogHost(undefined), '');
});

test('BLUESKY_HANDLE accepts a username, a handle, an @tag or a profile URL', async () => {
    const { normaliseHandle } = await import('./platforms/bluesky.mjs');

    // the obvious thing to type, which the API would otherwise reject
    assert.equal(normaliseHandle('emsh'), 'emsh.bsky.social');
    assert.equal(normaliseHandle('@emsh'), 'emsh.bsky.social');
    assert.equal(normaliseHandle('  emsh  '), 'emsh.bsky.social');

    // the full handle, with and without the @
    assert.equal(normaliseHandle('emsh.bsky.social'), 'emsh.bsky.social');
    assert.equal(normaliseHandle('@emsh.bsky.social'), 'emsh.bsky.social');

    // pasted from the address bar
    assert.equal(normaliseHandle('https://bsky.app/profile/emsh.bsky.social'), 'emsh.bsky.social');
    assert.equal(normaliseHandle('bsky.app/profile/@emsh.bsky.social'), 'emsh.bsky.social');

    // these are valid identifiers already and must not be touched
    assert.equal(normaliseHandle('did:plc:abc123'), 'did:plc:abc123');
    assert.equal(normaliseHandle('me@example.com'), 'me@example.com');
    assert.equal(normaliseHandle('lacadia.art'), 'lacadia.art');

    assert.equal(normaliseHandle(''), '');
    assert.equal(normaliseHandle(undefined), '');
});
