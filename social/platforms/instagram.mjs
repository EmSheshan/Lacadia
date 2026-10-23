// Instagram via the Instagram Login path (graph.instagram.com).
//
// This path uses an Instagram User access token directly: no Facebook Page, no
// Business Manager. The account does have to be an Instagram *professional*
// account (Business or Creator), and the app needs instagram_business_basic
// and instagram_business_content_publish.
//
// Publishing is a two-step container flow: create a container pointing at a
// PUBLIC jpeg URL, wait for Meta to finish fetching it, then publish. Meta
// pulls the image itself, which is why the socialImages/ folder is committed
// and served by GitHub Pages.

const HOST = process.env.IG_HOST ?? 'https://graph.instagram.com';
const VERSION = process.env.IG_API_VERSION ?? 'v21.0';

// Where Meta fetches the card from. GitHub Pages serves the committed JPEGs.
const IMAGE_BASE = (process.env.IG_IMAGE_BASE_URL
    ?? 'https://emsheshan.github.io/Lacadia').replace(/\/+$/, '');

export const name = 'instagram';

const REQUIRED = ['IG_USER_ID', 'IG_ACCESS_TOKEN'];

export function isConfigured() {
    return REQUIRED.every((k) => Boolean(process.env[k]));
}

export function missingKeys() {
    return REQUIRED.filter((k) => !process.env[k]);
}

/** Public URL Meta will fetch. `image` is the repo-relative path from the queue. */
export function imageUrl(image) {
    return `${IMAGE_BASE}/${String(image).replace(/^\/+/, '')}`;
}

async function graph(pathname, params, { method = 'POST' } = {}) {
    const url = new URL(`${HOST}/${VERSION}/${pathname}`);
    const body = new URLSearchParams({ ...params, access_token: process.env.IG_ACCESS_TOKEN });

    const res = await fetch(method === 'GET' ? `${url}?${body}` : url, {
        method,
        ...(method === 'GET' ? {} : { body }),
    });

    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = null; }

    if (!res.ok || json?.error) {
        // Meta's errors are far more useful than the status code alone.
        const e = json?.error;
        const detail = e
            ? `${e.type ?? 'Error'} ${e.code ?? ''}${e.error_subcode ? '/' + e.error_subcode : ''}: ${e.message ?? ''}`
            : text.slice(0, 300);
        throw new Error(`instagram ${pathname} ${res.status}: ${detail}`);
    }
    return json;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Meta fetches the image asynchronously, so the container is not publishable
 * the instant it is created. Poll until FINISHED; ERROR carries a reason.
 */
async function waitForContainer(id, { attempts = 20, intervalMs = 3000 } = {}) {
    for (let i = 0; i < attempts; i++) {
        const info = await graph(id, { fields: 'status_code,status' }, { method: 'GET' });
        if (info.status_code === 'FINISHED') return;
        if (info.status_code === 'ERROR' || info.status_code === 'EXPIRED') {
            throw new Error(`container ${info.status_code}: ${info.status ?? 'no detail'}`);
        }
        await sleep(intervalMs);
    }
    throw new Error(`container not ready after ${(attempts * intervalMs) / 1000}s`);
}

export async function post({ image, caption }) {
    const igUser = process.env.IG_USER_ID;
    const url = imageUrl(image);

    // Fail early and clearly if the image is not actually reachable -- Meta's
    // own error for this is opaque.
    const head = await fetch(url, { method: 'HEAD' });
    if (!head.ok) {
        throw new Error(`image not publicly reachable (${head.status}): ${url}`);
    }

    const container = await graph(`${igUser}/media`, { image_url: url, caption });
    await waitForContainer(container.id);
    const published = await graph(`${igUser}/media_publish`, { creation_id: container.id });

    return {
        id: published.id,
        url: `https://www.instagram.com/p/${published.id}`,
    };
}
