import test from 'node:test';
import assert from 'node:assert/strict';
import { oldPostsFor } from './match.mjs';

const media = [
    { id: '1', caption: 'Stratoclysm, the Devourer Pokemon!\n\n"..."' },
    { id: '2', caption: 'Syrinsect, the Larva Pokemon!' },
    { id: '3', caption: 'Mochumo, the Thing Pokemon!' },
    { id: '4', caption: 'Mochu, the Snow Pokemon!' },
    { id: '5', caption: 'Sacrabell-Hymn, the Knell Pokemon!' },
    { id: '6', caption: 'Look at Stratoclysm go' },
    { id: '7' },
    { id: '8', caption: '  stratoclysm!!' },
];

test('matches the species named on the first line', () => {
    assert.deepEqual(oldPostsFor(media, 'Stratoclysm').map((m) => m.id), ['1', '8']);
});
test('a longer name is not a match', () => {
    assert.deepEqual(oldPostsFor(media, 'Mochu').map((m) => m.id), ['4']);
});
test('a form post matches its species', () => {
    assert.deepEqual(oldPostsFor(media, 'Sacrabell').map((m) => m.id), ['5']);
});
test('the new carousel is never a match', () => {
    assert.deepEqual(oldPostsFor(media, 'Stratoclysm', new Set(['1'])).map((m) => m.id), ['8']);
});
