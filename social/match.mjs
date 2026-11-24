// Which Instagram posts are a species' old post: the caption's first line
// starts with its name. "Stratoclysm, the Devourer Pokemon!" and
// "Sacrabell-Hymn ..." match; a longer name that merely starts the same way
// ("Mochu" vs "Mochumo") doesn't.
export function oldPostsFor(media, name, keepIds = new Set()) {
    const re = new RegExp(`^${name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-z])`);
    return media.filter((m) => !keepIds.has(m.id)
        && re.test(String(m.caption ?? '').split('\n')[0].trim().toLowerCase()));
}
