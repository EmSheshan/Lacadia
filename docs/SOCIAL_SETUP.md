# Daily poster — setup

One Lacadia card posts per day to Bluesky and Tumblr. You add the credentials;
they live only in GitHub's encrypted secrets and never go in the repo.

A platform only runs if its secrets exist. You can set up Bluesky today and
Tumblr whenever — the other just skips itself in the meantime.

---

## 1. Bluesky (about 2 minutes)

Use an **app password**, never your real one. It can be revoked without touching
your account password.

1. <https://bsky.app/settings/app-passwords> → **Add App Password**
2. Name it `lacadia-daily`, copy the `xxxx-xxxx-xxxx-xxxx` value

Secrets to add:

| Secret | Value |
|---|---|
| `BLUESKY_HANDLE` | your handle, e.g. `lacadia.bsky.social` (no `@`) |
| `BLUESKY_APP_PASSWORD` | the app password from step 2 |

## 2. Tumblr (about 10 minutes)

1. <https://www.tumblr.com/oauth/apps> → **Register application**.
   Any name and description; for the callback URL use `https://example.com`.
   This gives you the **consumer key** and **consumer secret**.
2. <https://api.tumblr.com/console/calls/user/info> — enter those two values and
   authorise. The console then shows your **token** and **token secret**.

Secrets to add:

| Secret | Value |
|---|---|
| `TUMBLR_CONSUMER_KEY` | OAuth consumer key |
| `TUMBLR_CONSUMER_SECRET` | OAuth consumer secret |
| `TUMBLR_TOKEN` | token from the API console |
| `TUMBLR_TOKEN_SECRET` | token secret from the API console |
| `TUMBLR_BLOG` | your blog host, e.g. `lacadia.tumblr.com` |

## 3. Add them to GitHub

**Settings → Secrets and variables → Actions → New repository secret**, once per
row above. Direct link:
<https://github.com/EmSheshan/Lacadia/settings/secrets/actions>

## 4. Test before going live

**Actions → Daily Lacadia post → Run workflow**, leaving *Run the post without
sending it* **checked**. The log shows the exact text and image with nothing sent.

When it looks right, run it again with that box **unchecked** to post for real.
After that it runs itself at 15:00 UTC daily.

---

## How it behaves

- **Order** — dex order from Kheprini (#2073). 28 cards, ending at Sacrabell-Hymn (#2099).
- **Captions** — Bluesky gets the first flavour paragraph plus `#fakemon #lacadia`
  (its 300-char limit cannot fit the full text). Tumblr gets the full text, with
  the ten hashtags in its real `tags` field where they're actually searchable.
  Full flavour text is the image alt on both.
- **No double posts** — `social/queue.json` records each platform separately and is
  committed right after each success, so a retry resumes rather than repeats.
- **One platform failing** never blocks the other.
- **Day 28** — the job stops and opens an issue titled "Daily post queue is empty".

## Changing things

| Want to | Do |
|---|---|
| Change posting time | edit the `cron` in `.github/workflows/daily-post.yml` (UTC) |
| Reorder or skip cards | edit `social/queue.json` by hand |
| Re-post something | delete that platform's entry from its `posted` object |
| Pause everything | Actions → Daily Lacadia post → ⋯ → Disable workflow |
| Change the caption format | `social/caption.mjs`, then `npm test` |
| Add more art | add PNGs + `pokedex.js` entries, then `npm run build:images` and `npm run build:queue -- --after <last posted>` |

## Local commands

```
npm test                 # caption tests, incl. exact-match against the reference post
npm run build:images     # sharablePokemonArt/*.png -> socialImages/*.jpg (needs canvas)
npm run build:queue      # regenerate the queue, preserving posted state
npm run post:dry         # full dry run, sends nothing
```
