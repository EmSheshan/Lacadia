// Bluesky via the AT Protocol XRPC HTTP API. No SDK dependency -- three plain
// fetch calls (session, blob upload, record create).

const SERVICE = process.env.BLUESKY_SERVICE ?? 'https://bsky.social';

export const name = 'bluesky';

/**
 * Normalises BLUESKY_HANDLE to something createSession accepts as an identifier.
 * The API takes a full handle, a DID or an email, but NOT a bare username --
 * which is the obvious thing to type. A leading @ is stripped and a profile URL
 * unwrapped; DIDs, emails and custom-domain handles pass through untouched.
 */
export function normaliseHandle(raw) {
    let s = String(raw ?? '').trim();
    if (!s) return '';
    if (/^did:/i.test(s)) return s;

    s = s.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    const profile = s.match(/^bsky\.app\/profile\/([^/?#]+)/i);
    if (profile) s = profile[1];

    s = s.replace(/^@/, '');
    if (s.includes('@')) return s; // an email identifier

    if (!s || s.includes('/')) return '';
    return s.includes('.') ? s : `${s}.bsky.social`;
}

export function isConfigured() {
    return Boolean(normaliseHandle(process.env.BLUESKY_HANDLE) && process.env.BLUESKY_APP_PASSWORD);
}

export function missingKeys() {
    return ['BLUESKY_HANDLE', 'BLUESKY_APP_PASSWORD'].filter((k) => !process.env[k]);
}

async function xrpc(endpoint, { method = 'POST', token, body, contentType } = {}) {
    const res = await fetch(`${SERVICE}/xrpc/${endpoint}`, {
        method,
        headers: {
            'Content-Type': contentType ?? 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: contentType ? body : JSON.stringify(body),
    });
    if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error(`bluesky ${endpoint} ${res.status}: ${detail.slice(0, 300)}`);
    }
    return res.json();
}

/**
 * Hashtags are inert text on Bluesky unless the post carries matching facets,
 * so build them here. Facet ranges are UTF-8 BYTE offsets, not char offsets.
 */
export function hashtagFacets(text) {
    const bytes = Buffer.from(text, 'utf8');
    const facets = [];
    // Preceded by start-of-text or whitespace, so "a#b" is not a tag.
    const re = /(^|\s)(#[^\s#]+)/g;
    let m;
    while ((m = re.exec(text)) !== null) {
        const tagStart = m.index + m[1].length;
        const tag = m[2].replace(/[.,;:!?)\]]+$/, '');
        if (tag.length <= 1) continue;
        const byteStart = Buffer.from(text.slice(0, tagStart), 'utf8').length;
        const byteEnd = byteStart + Buffer.from(tag, 'utf8').length;
        facets.push({
            index: { byteStart, byteEnd },
            features: [{ $type: 'app.bsky.richtext.facet#tag', tag: tag.slice(1) }],
        });
    }
    // Sanity: offsets must land on the tag we think they do.
    for (const f of facets) {
        const slice = bytes.subarray(f.index.byteStart, f.index.byteEnd).toString('utf8');
        if (slice !== '#' + f.features[0].tag) {
            throw new Error(`facet offset mismatch: got "${slice}"`);
        }
    }
    return facets;
}

export async function post({ text, image, alt, mimeType = 'image/jpeg', width, height }) {
    const identifier = normaliseHandle(process.env.BLUESKY_HANDLE);
    if (!identifier) {
        throw new Error(`could not read a handle from BLUESKY_HANDLE="${process.env.BLUESKY_HANDLE}"`);
    }

    const session = await xrpc('com.atproto.server.createSession', {
        body: { identifier, password: process.env.BLUESKY_APP_PASSWORD },
    });

    const uploaded = await xrpc('com.atproto.repo.uploadBlob', {
        token: session.accessJwt,
        body: image,
        contentType: mimeType,
    });

    const record = {
        $type: 'app.bsky.feed.post',
        text,
        createdAt: new Date().toISOString(),
        langs: ['en'],
        facets: hashtagFacets(text),
        embed: {
            $type: 'app.bsky.embed.images',
            images: [{
                alt,
                image: uploaded.blob,
                ...(width && height ? { aspectRatio: { width, height } } : {}),
            }],
        },
    };

    const created = await xrpc('com.atproto.repo.createRecord', {
        token: session.accessJwt,
        body: { repo: session.did, collection: 'app.bsky.feed.post', record },
    });

    const rkey = created.uri.split('/').pop();
    return {
        uri: created.uri,
        url: `https://bsky.app/profile/${session.handle ?? identifier}/post/${rkey}`,
    };
}
