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

test('baseName strips a form suffix and leaves plain names alone', async () => {
    const { baseName } = await import('./caption.mjs');
    assert.equal(baseName('Tortarma-Solar'), 'Tortarma');
    assert.equal(baseName('Sacrabell-Dirge'), 'Sacrabell');
    assert.equal(baseName('Kheprini'), 'Kheprini');
});

test('mergeForms collapses the name and keeps the shared text', async () => {
    const { mergeForms, longCaption } = await import('./caption.mjs');
    const forms = [pokedex.tortarmasolar, pokedex.tortarmapolar];
    const merged = mergeForms(forms);

    assert.equal(merged.name, 'Tortarma');
    assert.equal(merged.kind, forms[0].kind);
    assert.deepEqual(merged.description, forms[0].description);
    assert.ok(longCaption(merged).startsWith('Tortarma, the Tortoise Pokemon!'));
    assert.ok(!longCaption(merged).includes('-Solar'), 'form suffix must not leak into the caption');
});

test('mergeForms leaves a single entry untouched', async () => {
    const { mergeForms } = await import('./caption.mjs');
    assert.equal(mergeForms([pokedex.kheprini]).name, 'Kheprini');
});

test('mergeForms refuses to merge different species', async () => {
    const { mergeForms } = await import('./caption.mjs');
    assert.throws(() => mergeForms([pokedex.kheprini, pokedex.servankh]), /different species/);
});

test('every form group in the dex shares its kind and description', async () => {
    const { baseName } = await import('./caption.mjs');
    const groups = {};
    for (const e of Object.values(pokedex)) {
        if (!e.name.includes('-')) continue;
        (groups[baseName(e.name)] ??= []).push(e);
    }
    // Merging only makes sense while this holds; if new art breaks it, the
    // combined caption would silently drop one form's text.
    for (const [base, list] of Object.entries(groups)) {
        if (list.length < 2) continue;
        assert.equal(new Set(list.map((e) => e.kind)).size, 1, `${base} forms share a kind`);
        assert.equal(new Set(list.map((e) => JSON.stringify(e.description))).size, 1,
            `${base} forms share description text`);
    }
});
