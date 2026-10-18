# Daily Lacadia Art Poster — Design

**Date:** 2026-10-18
**Status:** Approved (Bluesky + Tumblr; Instagram deferred)

## Problem

105 finished share cards sit in `sharablePokemonArt/`. They get posted to social
media by hand, which means they often don't get posted at all. Automate one post
per day so the cadence survives forgetting.

## Scope

In scope: Bluesky and Tumblr.
Deferred: Instagram — its Graph API needs a Business/Creator account linked to a
Facebook page, and its access token expires about every 60 days. The design keeps
a slot for it; adding it later is a new poster module plus secrets, no redesign.

## Key facts established

- `sharablePokemonArt/` holds 105 PNGs at 1200x1200, ~1.2 MB each. **Untracked in git.**
- `pokedex.js` has a matching entry per card: `name`, `kind`, `types`, `description[]`.
- The caption template reproduces the user's reference post byte-for-byte from that data.
- Full captions run 330–518 chars. Tumblr is fine; **Bluesky's limit is 300**, so every
  one of the 105 overflows and needs a short variant.
- Last posted: **Tortality (#2072, position 77/105)**. Next: **Kheprini (#2073)**.
- **28 cards remain** — about four weeks, Kheprini (#2073) through Sacrabell-Hymn (#2099).
- Repo `EmSheshan/Lacadia` is public and GitHub Pages already serves it.

## Architecture

Four units, each with one job.

| Unit | Responsibility | Runs |
|---|---|---|
| `scripts/build-social-images.mjs` | `sharablePokemonArt/*.png` -> `socialImages/*.jpg`, 1080x1080 q92 (~201 KB) | Locally, on demand |
| `social/caption.mjs` | Pokedex entry -> `{ long, short, alt }`. Single source of caption truth. | Imported |
| `scripts/post-daily.mjs` | Pick next unposted, post to each enabled platform, record state | GitHub Actions, daily |
| `.github/workflows/daily-post.yml` | Cron trigger, manual trigger, dry-run toggle | GitHub Actions |

### Why the images get committed

GitHub Actions clones the repo. `sharablePokemonArt/` is untracked, so the cloud
job would find no art. The compressed `socialImages/` directory (~21 MB for all
105) is committed so the job has something to post. Compression is needed anyway:
the 1.2 MB originals exceed Bluesky's ~1 MB blob cap.

`canvas` is a local-only dependency — it needs a native build and never runs in CI.

### Captions

One module, three renderings, so platforms cannot drift apart:

- **long** — the user's exact template, used for Tumblr:
  `{name}, the {kind} Pokemon!` / blank / `"{description joined by blank line}"` / blank / 10 hashtags
- **short** — Bluesky. Name line + first description paragraph + `#fakemon #lacadia`.
  Measured max across all 105: 292 chars. A hard truncation guard enforces 300.
- **alt** — full description text, attached as image alt on every platform.

### State and idempotency

`social/queue.json` is the single source of truth: 28 entries in dex order from
Kheprini, each carrying per-platform posted timestamps.

Rules that keep a bad day from becoming a double post:

1. An entry is "done" only when every enabled platform has posted it.
2. State is written and committed immediately after each individual platform
   succeeds, not batched at the end.
3. A platform that already has a timestamp for an entry is skipped, so a re-run
   or a retry resumes rather than repeats.
4. Platforms are independent — Tumblr failing never blocks Bluesky.

### Enablement by secret presence

A platform is active only if its secrets exist. Missing secrets mean a clean skip,
not an error. This is what lets Instagram switch on later with no code change, and
lets the user roll out Bluesky before Tumblr if they want.

### End of queue

On day 28 the queue empties. The job then stops posting and opens a GitHub issue,
so the silence is visible rather than mysterious. It does not loop or repost.

## Error handling

- Any platform throwing is caught, logged, and does not abort the others.
- The workflow exits non-zero if **every** enabled platform failed, so GitHub emails
  a failure notice.
- `--dry-run` renders captions, resolves the image, and prints everything while
  making zero network writes. The first run will be a dry run.

## Credentials

Stored as GitHub repo secrets, entered by the user. Never committed, never handled
by Claude:

- `BLUESKY_HANDLE`, `BLUESKY_APP_PASSWORD`
- `TUMBLR_CONSUMER_KEY`, `TUMBLR_CONSUMER_SECRET`, `TUMBLR_TOKEN`, `TUMBLR_TOKEN_SECRET`, `TUMBLR_BLOG`

## Testing

- Caption rendering asserted against the user's reference Tortality post, exact match.
- Length invariant: every short caption <= 300 across all 105 entries.
- Queue ordering asserted to start at Kheprini and run in ascending dex number.
- Full dry run before any live post.

## Out of scope

Instagram; generating new art; editing `sharableImageGenerator.js`; posting more
than once a day; cross-posting replies or threads.
