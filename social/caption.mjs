// Single source of caption truth. Every platform renders from here so they
// cannot drift apart.

export const HASHTAGS_FULL = [
    '#pokemon', '#fakemon', '#fakemoncommunity', '#pokemonregion',
    '#pokemonlegends', '#lacadia', '#lacadiaregion', '#gamefreak',
    '#nintendo', '#fakemonart',
].join(' ');

export const HASHTAGS_SHORT = '#fakemon #lacadia';

export const BLUESKY_LIMIT = 300;

/** Flavour text as one block, paragraphs separated by a blank line. */
function descriptionBlock(entry) {
    return (entry.description ?? []).join('\n\n');
}

function headline(entry) {
    return `${entry.name}, the ${entry.kind} Pokemon!`;
}

/**
 * Full caption, used for Tumblr. This is the user's reference format and is
 * asserted byte-for-byte against their Tortality post in the tests.
 */
export function longCaption(entry) {
    return `${headline(entry)}\n\n"${descriptionBlock(entry)}"\n\n${HASHTAGS_FULL}`;
}

/**
 * Bluesky caption. Every full caption overflows the 300-char limit, so this
 * uses only the first flavour paragraph and a trimmed tag set. Measured max
 * across all 105 entries is 292; the guard below is belt-and-braces for entries
 * added later.
 */
export function shortCaption(entry) {
    const head = headline(entry);
    const tags = HASHTAGS_SHORT;
    const first = (entry.description ?? [])[0] ?? '';

    const build = (body) => `${head}\n\n"${body}"\n\n${tags}`;

    const full = build(first);
    if (full.length <= BLUESKY_LIMIT) return full;

    // Trim the flavour text, not the name or tags, and cut on a word boundary.
    const overflow = full.length - BLUESKY_LIMIT;
    const room = Math.max(0, first.length - overflow - 1); // -1 for the ellipsis
    let trimmed = first.slice(0, room);
    const lastSpace = trimmed.lastIndexOf(' ');
    if (lastSpace > room * 0.6) trimmed = trimmed.slice(0, lastSpace);
    return build(trimmed.replace(/[\s.,;:]+$/, '') + '\u2026');
}

/** Image alt text: the full flavour text, for accessibility and search. */
export function altText(entry) {
    return `${headline(entry)} ${descriptionBlock(entry)}`.replace(/\s+/g, ' ').trim();
}

/** Hashtags as bare words, for platforms with a real tag field (Tumblr). */
export function tagList() {
    return HASHTAGS_FULL.split(' ').map((t) => t.replace(/^#/, ''));
}

/**
 * Tumblr body. Same words as the long caption but without the inline hashtag
 * line, because Tumblr has a first-class `tags` field -- tags put there are
 * searchable and render under the post, whereas inline ones are just text.
 */
export function tumblrBody(entry) {
    return `${headline(entry)}

"${descriptionBlock(entry)}"`;
}

export function renderAll(entry) {
    return {
        long: longCaption(entry),
        short: shortCaption(entry),
        alt: altText(entry),
        tumblrBody: tumblrBody(entry),
        tags: tagList(),
    };
}

/** "Tortarma-Solar" -> "Tortarma". Alternate forms are hyphen-suffixed. */
export function baseName(name) {
    return String(name).split('-')[0];
}

/**
 * Collapses several forms of one species into a single entry for a combined
 * post. Forms share their kind and description text verbatim, so only the name
 * needs collapsing -- every renderer above then works unchanged, and a post
 * carrying both Tortarma forms reads "Tortarma, the Tortoise Pokemon!".
 *
 * A single-entry group is returned untouched.
 */
export function mergeForms(entries) {
    if (!entries?.length) throw new Error('mergeForms needs at least one entry');
    if (entries.length === 1) return entries[0];

    const names = entries.map((e) => baseName(e.name));
    if (new Set(names).size !== 1) {
        throw new Error(`refusing to merge different species: ${entries.map((e) => e.name).join(', ')}`);
    }
    return { ...entries[0], name: names[0] };
}
