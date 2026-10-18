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

export function isConfigured() {
    return REQUIRED.every((k) => Boolean(process.env[k]));
}

export function missingKeys() {
    return REQUIRED.filter((k) => !process.env[k]);
}

export async function post({ imagePath, body, alt, tags }) {
    const client = new Client({
        consumer_key: process.env.TUMBLR_CONSUMER_KEY,
        consumer_secret: process.env.TUMBLR_CONSUMER_SECRET,
        token: process.env.TUMBLR_TOKEN,
        token_secret: process.env.TUMBLR_TOKEN_SECRET,
    });

    const blog = process.env.TUMBLR_BLOG;
    const absolute = path.resolve(imagePath);
    if (!fs.existsSync(absolute)) throw new Error(`image not found: ${absolute}`);

    const result = await client.createPost(blog, {
        content: [
            { type: 'image', media: fs.createReadStream(absolute), alt_text: alt },
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
