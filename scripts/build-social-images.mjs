// Compresses the 1200x1200 share cards into web-sized JPEGs that get committed,
// so the GitHub Actions job has art to post (sharablePokemonArt/ is untracked)
// and so every file clears Bluesky's ~1MB blob cap.
//
// Local-only: depends on `canvas`, which needs a native build and never runs in CI.
//   node scripts/build-social-images.mjs [--force]

import { createCanvas, loadImage } from 'canvas';
import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve('sharablePokemonArt');
const OUT = path.resolve('socialImages');
const SIZE = 1080;
const QUALITY = 0.92;
const BLUESKY_BLOB_LIMIT = 1_000_000;

const force = process.argv.includes('--force');

if (!fs.existsSync(SRC)) {
    console.error(`Source folder missing: ${SRC}`);
    process.exit(1);
}
fs.mkdirSync(OUT, { recursive: true });

const files = fs.readdirSync(SRC).filter((f) => f.toLowerCase().endsWith('.png'));
if (files.length === 0) {
    console.error(`No PNGs in ${SRC}`);
    process.exit(1);
}

let built = 0, skipped = 0, biggest = 0, biggestName = '';

for (const file of files) {
    const srcPath = path.join(SRC, file);
    const outPath = path.join(OUT, `${path.parse(file).name}.jpg`);

    if (!force && fs.existsSync(outPath)
        && fs.statSync(outPath).mtimeMs >= fs.statSync(srcPath).mtimeMs) {
        skipped++;
        continue;
    }

    const img = await loadImage(srcPath);
    const canvas = createCanvas(SIZE, SIZE);
    const ctx = canvas.getContext('2d');
    // Flatten onto white: JPEG has no alpha channel.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.drawImage(img, 0, 0, SIZE, SIZE);

    const buf = canvas.toBuffer('image/jpeg', { quality: QUALITY });
    fs.writeFileSync(outPath, buf);
    built++;

    if (buf.length > biggest) { biggest = buf.length; biggestName = file; }
    if (buf.length > BLUESKY_BLOB_LIMIT) {
        console.warn(`  OVER BLUESKY LIMIT: ${file} -> ${(buf.length / 1024).toFixed(0)}KB`);
    }
}

const total = fs.readdirSync(OUT)
    .filter((f) => f.endsWith('.jpg'))
    .reduce((n, f) => n + fs.statSync(path.join(OUT, f)).size, 0);

console.log(`built ${built}, skipped ${skipped} (up to date)`);
console.log(`largest: ${biggestName || '-'} at ${(biggest / 1024).toFixed(0)}KB  (Bluesky cap ${BLUESKY_BLOB_LIMIT / 1024 | 0}KB)`);
console.log(`socialImages/ total: ${(total / 1024 / 1024).toFixed(1)}MB across ${fs.readdirSync(OUT).filter((f) => f.endsWith('.jpg')).length} files`);
