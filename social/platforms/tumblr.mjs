// Tumblr via the official client, using the Neue Post Format endpoint.
// OAuth 1.0a signing is delegated to the library rather than hand-rolled.

import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'tumblr.js';

export const name = 'tumblr';

const REQUIRED = [
    'TUMBLR_CONSUMER_KEY', 'TUMBLR_CONSUMER_SECRET',
    'TUMBLR_TOKEN', 'TUMBLR_TOKEN_SECRET', 'TUMBLR_BLOG',
];

/**
 * Normalises whatever the user put in TUMBLR_BLOG to a blog host.
 *
 * tumblr.js does no normalising at all -- it drops the string straight into
 * /v2/blog/<id>/posts -- and the permalink reported back has to be a real host.
 * Accepts the bare name, the host, or either dashboard URL form, since
 * `https://www.tumblr.com/blog/emsh` is what the address bar gives you.
 * Custom domains pass through untouched.
 */
export function blogHost(raw) {
    let s = String(raw ?? '').trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    if (!s) return '';

    // www.tumblr.com/blog/emsh  and  www.tumblr.com/emsh
    const dashboard = s.match(/^(?:www\.)?tumblr\.com\/(?:blog\/)?([^/?#]+)/i);
    if (dashboard) s = dashboard[1];

    if (!s || s.includes('/')) return '';
    return s.includes('.') ? s : `${s}.tumblr.com`;
}

export function isConfigured() {
    return REQUIRED.every((k) => Boolean(process.env[k])) && Boolean(blogHost(process.env.TUMBLR_BLOG));
}

export function missingKeys() {
    return REQUIRED.filter((k) => !process.env[k]);
}

/**
 * `imagePaths` is an array -- one path for a normal card, several when a
 * species' alternate forms go out together. NPF takes one block per image.
 */
export async function post({ imagePaths, body, alt, tags }) {
    const client = new Client({
        consumer_key: process.env.TUMBLR_CONSUMER_KEY,
        consumer_secret: process.env.TUMBLR_CONSUMER_SECRET,
        token: process.env.TUMBLR_TOKEN,
        token_secret: process.env.TUMBLR_TOKEN_SECRET,
    });

    const blog = blogHost(process.env.TUMBLR_BLOG);
    if (!blog) throw new Error(`could not read a blog name from TUMBLR_BLOG="${process.env.TUMBLR_BLOG}"`);
    if (!imagePaths?.length) throw new Error('no images given');

    const absolutes = imagePaths.map((p) => path.resolve(p));
    for (const a of absolutes) {
        if (!fs.existsSync(a)) throw new Error(`image not found: ${a}`);
    }

    const result = await client.createPost(blog, {
        content: [
            ...absolutes.map((a) => ({
                type: 'image',
                media: fs.createReadStream(a),
                alt_text: alt,
            })),
            { type: 'text', text: body },
        ],
        tags,
        state: 'published',
    });

    const id = result?.id_string ?? result?.id;
    return {
        id: String(id ?? 'unknown'),
        url: id ? `https://${blog}/post/${id}` : `https://${blog}`,
    };
}
