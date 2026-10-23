// Prints the Instagram user ID that IG_USER_ID needs.
//
//   node --env-file-if-exists=.env scripts/ig-whoami.mjs
//
// Reads IG_ACCESS_TOKEN from the environment so the token never goes in your
// shell history. The token itself is never printed.
//
// The trap this exists for: /me returns BOTH `id` and `user_id`, and they are
// different. `id` is an app-scoped ID and will NOT work for publishing.
// `user_id` is the one you want.

const VERSION = process.env.IG_API_VERSION ?? 'v26.0';
const token = process.env.IG_ACCESS_TOKEN;

if (!token) {
    console.error('IG_ACCESS_TOKEN is not set.');
    console.error('Put it in .env (gitignored) and run:');
    console.error('  node --env-file-if-exists=.env scripts/ig-whoami.mjs');
    process.exit(1);
}

const url = new URL(`https://graph.instagram.com/${VERSION}/me`);
url.searchParams.set('fields', 'user_id,username');
url.searchParams.set('access_token', token);

const res = await fetch(url);
const body = await res.json().catch(() => null);

if (!res.ok || body?.error) {
    const e = body?.error;
    console.error(`Failed (${res.status}): ${e ? `${e.type ?? ''} ${e.code ?? ''}: ${e.message ?? ''}` : 'no detail'}`);
    if (e?.code === 190) console.error('Code 190 means the token is invalid or expired -- generate a fresh one.');
    process.exit(1);
}

console.log('');
console.log(`  username : ${body.username}`);
console.log(`  user_id  : ${body.user_id}        <-- this is IG_USER_ID`);
if (body.id && body.id !== body.user_id) {
    console.log(`  id       : ${body.id}   <-- app-scoped, do NOT use this`);
}
console.log('');
console.log('Add user_id as the IG_USER_ID secret.');
