import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pokedex } from '../pokedex.js';
import { longCaption, shortCaption, altText, BLUESKY_LIMIT } from './caption.mjs';

// The user's reference post, pasted verbatim. The generator must reproduce this
// exactly from pokedex data -- if this breaks, the format drifted.
const REFERENCE_TORTALITY = `Tortality, the Totality Pokemon!

"Tortality draws its power from the movement of celestial bodies. They can live up to 1,000 years old.

It is theorized that the world is on the back of a giant Tortality, which itself is part of a column of increasingly larger Tortality that continues indefinitely."

#pokemon #fakemon #fakemoncommunity #pokemonregion #pokemonlegends #lacadia #lacadiaregion #gamefreak #nintendo #fakemonart`;

test('long caption reproduces the reference post byte-for-byte', () => {
    assert.equal(longCaption(pokedex.tortality), REFERENCE_TORTALITY);
});

test('every short caption fits Bluesky, across all entries', () => {
    const over = Object.entries(pokedex)
        .map(([key, e]) => [key, shortCaption(e).length])
        .filter(([, len]) => len > BLUESKY_LIMIT);
    assert.deepEqual(over, [], `entries over ${BLUESKY_LIMIT} chars`);
});

test('short caption keeps the headline and tags intact when it truncates', () => {
    const windy = {
        name: 'Testmon', kind: 'Test',
        description: ['word '.repeat(200).trim()],
    };
    const out = shortCaption(windy);
    assert.ok(out.length <= BLUESKY_LIMIT, `got ${out.length}`);
    assert.ok(out.startsWith('Testmon, the Test Pokemon!'), 'headline survived');
    assert.ok(out.endsWith('#fakemon #lacadia'), 'tags survived');
    assert.ok(out.includes('\u2026'), 'marked as truncated');
});

test('short caption is untouched when it already fits', () => {
    const out = shortCaption(pokedex.tortality);
    assert.ok(!out.includes('\u2026'), 'should not truncate a caption that fits');
    assert.ok(out.includes('They can live up to 1,000 years old.'));
});

test('alt text carries the full flavour text on one line', () => {
    const alt = altText(pokedex.tortality);
    assert.ok(!alt.includes('\n'), 'alt text must be single-line');
    assert.ok(alt.includes('column of increasingly larger Tortality'), 'second paragraph present');
});

test('every entry renders without throwing and has required fields', () => {
    for (const [key, e] of Object.entries(pokedex)) {
        assert.ok(e.name, `${key} has a name`);
        assert.ok(e.kind, `${key} has a kind`);
        assert.ok(e.description?.length, `${key} has description text`);
        assert.ok(longCaption(e).length > 0);
    }
});
