// Builds extra carousel slides that ride along behind each share card, so a
// post becomes a swipeable mini dex page instead of a single image:
//
//   1. the existing share card (unchanged, from socialImages/)
//   2. Dex entry  -- number, kind, typing, size, ability, flavour text
//   3. Battle data -- base stat bars + signature move
//   4. Shiny      -- normal vs shiny side by side
//
// Output: socialCarousel/<key>-<slide>.jpg at 1080x1080, same look as the cards.
// Local-only (needs `canvas`), like build-social-images.mjs.
//
//   node scripts/build-carousel.mjs                 # every pokedex entry with art
//   node scripts/build-carousel.mjs stratoclysm     # just these keys

import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'node:fs';
import path from 'node:path';
import { pokedex } from '../pokedex.js';
import { abilities } from '../abilities.js';
import { moves } from '../moves.js';

const BASE = path.resolve();
registerFont(path.join(BASE, 'assets', 'SmileySans-Oblique.otf'), { family: 'SmileyOblique' });

const OUT = path.join(BASE, 'socialCarousel');
const ART = path.join(BASE, 'pokemonArt');
const SIZE = 1200;          // draw at the card's native size...
const EXPORT = 1080;        // ...export at Instagram's
const QUALITY = 0.92;

const GOLD = '#ffd200';
const INK = '#14162b';
const PAPER = '#f4f1e8';
const FONT = (px) => `${px}px "SmileyOblique"`;

// Same palette as sharableImageGenerator.js so slides match the hero card.
const TYPE_COLORS = {
    Normal: '#c3c29b', Fire: '#ff6320', Water: '#4b99ff', Electric: '#F7D02C',
    Grass: '#7AC74C', Ice: '#96D9D6', Fighting: '#ff2b23', Poison: '#a622a3',
    Ground: '#e39b49', Flying: '#baa2ff', Psychic: '#ff4baa', Bug: '#A6B91A',
    Rock: '#958150', Ghost: '#4d4260', Dragon: '#5935fc', Dark: '#322d28',
    Steel: '#8c8c9a', Fairy: '#ff98b5',
};

const STATS = [
    ['hp', 'HP'], ['atk', 'Attack'], ['def', 'Defense'],
    ['spa', 'Sp. Atk'], ['spd', 'Sp. Def'], ['spe', 'Speed'],
];

const bg = await loadImage(path.join(BASE, 'assets', 'SharableImageBg.png'));
const typeBars = {};
for (const t of Object.keys(TYPE_COLORS)) {
    const p = path.join(BASE, 'typeBars', `${t}.png`);
    if (fs.existsSync(p)) typeBars[t] = await loadImage(p);
}
const moveIcons = {};
for (const c of ['Physical', 'Special', 'Status']) {
    moveIcons[c] = await loadImage(path.join(BASE, 'moveIcons', `${c}.png`));
}

// ---------------------------------------------------------------- helpers

function abilityText(name) {
    const a = abilities[name];
    return typeof a === 'string' ? a : a?.description ?? '';
}

/** Card background: type-coloured halves under the shared frame, like slide 1. */
function frame(ctx, mon, title) {
    const [t1, t2 = t1] = mon.types;
    ctx.fillStyle = TYPE_COLORS[t1] ?? '#aaa';
    ctx.fillRect(0, 0, SIZE, SIZE / 2);
    ctx.fillStyle = TYPE_COLORS[t2] ?? '#aaa';
    ctx.fillRect(0, SIZE / 2, SIZE, SIZE / 2);
    ctx.drawImage(bg, 0, 0);

    ctx.fillStyle = 'black';
    ctx.font = FONT(90);
    ctx.fillText(title, 70, 135);
}

function wrap(ctx, text, maxWidth) {
    const lines = [];
    for (const para of String(text).split('\n')) {
        let line = '';
        for (const word of para.split(/\s+/)) {
            const next = line ? `${line} ${word}` : word;
            if (ctx.measureText(next).width > maxWidth && line) {
                lines.push(line);
                line = word;
            } else line = next;
        }
        lines.push(line);
    }
    return lines;
}

/** Wrapped text, shrinking the font until it fits the box. Returns bottom y. */
function textBox(ctx, text, x, y, w, h, { max = 44, min = 26, lead = 1.3, color = PAPER } = {}) {
    let size = max, lines;
    for (; size >= min; size -= 2) {
        ctx.font = FONT(size);
        lines = wrap(ctx, text, w);
        if (lines.length * size * lead <= h) break;
    }
    ctx.fillStyle = color;
    lines.forEach((l, i) => ctx.fillText(l, x, y + size + i * size * lead));
    return y + lines.length * size * lead;
}

function panel(ctx, x, y, w, h, r = 28) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = 'rgba(14, 16, 38, 0.72)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 210, 0, 0.55)';
    ctx.stroke();
    ctx.restore();
}

/** Art with the gold offset silhouette the hero card uses. */
function artWithShadow(ctx, img, x, y, s, offset = 10) {
    const layer = createCanvas(SIZE, SIZE);
    const l = layer.getContext('2d');
    l.drawImage(img, x + offset, y + offset, s, s);
    l.globalCompositeOperation = 'source-in';
    l.fillStyle = GOLD;
    l.fillRect(0, 0, SIZE, SIZE);
    ctx.drawImage(layer, 0, 0);
    ctx.drawImage(img, x, y, s, s);
}

function label(ctx, text, x, y, size = 34) {
    ctx.font = FONT(size);
    ctx.fillStyle = GOLD;
    ctx.fillText(text.toUpperCase(), x, y);
}

function typePills(ctx, types, x, y, w = 200) {
    for (const t of types) {
        const img = typeBars[t];
        if (!img) continue;
        const h = img.height * (w / img.width);
        ctx.drawImage(img, x, y, w, h);
        x += w + 16;
    }
}

function swipeHint(ctx, text = 'swipe') {
    ctx.font = FONT(34);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    const w = ctx.measureText(`${text} →`).width;
    ctx.fillText(`${text} →`, SIZE - w - 60, 135);
}

// ---------------------------------------------------------------- slides

function slideDex(ctx, mon, art) {
    frame(ctx, mon, mon.name);
    swipeHint(ctx);

    // Left column: the art, smaller, so the slide still reads as "this mon".
    artWithShadow(ctx, art, 20, 230, 560);

    // Right column: the dex plate.
    const px = 600, pw = 540;
    panel(ctx, px, 230, pw, 545);
    ctx.font = FONT(64);
    ctx.fillStyle = GOLD;
    ctx.fillText(`#${mon.num}`, px + 36, 305);
    ctx.font = FONT(44);
    ctx.fillStyle = PAPER;
    ctx.fillText(`The ${mon.kind} Pok\u00e9mon`, px + 36, 362);
    typePills(ctx, mon.types, px + 36, 385, 220);

    label(ctx, 'Height', px + 36, 492);
    label(ctx, 'Weight', px + 290, 492);
    ctx.font = FONT(52);
    ctx.fillStyle = PAPER;
    ctx.fillText(`${mon.heightm} m`, px + 36, 548);
    ctx.fillText(`${mon.weightkg} kg`, px + 290, 548);

    const ab = Object.values(mon.abilities ?? {});
    label(ctx, ab.length > 1 ? 'Abilities' : 'Ability', px + 36, 612);
    if (ab.length === 1) {
        ctx.font = FONT(48);
        ctx.fillStyle = PAPER;
        ctx.fillText(ab[0], px + 36, 664);
        textBox(ctx, abilityText(ab[0]), px + 36, 674, pw - 72, 84, { max: 28, min: 20, color: '#c9c7d8' });
    } else {
        // One per line; shrink until the longest fits the plate.
        let size = 44;
        ctx.font = FONT(size);
        while (size > 28 && Math.max(...ab.map((a) => ctx.measureText(a).width)) > pw - 72) {
            ctx.font = FONT(size -= 2);
        }
        ctx.fillStyle = PAPER;
        ab.forEach((a, i) => ctx.fillText(a, px + 36, 660 + i * (size + 6)));
    }

    // Full-width flavour text.
    panel(ctx, 60, 800, SIZE - 120, 255);
    const flavour = (mon.description ?? []).join('\n');
    textBox(ctx, flavour, 96, 812, SIZE - 192, 228, { max: 40, min: 28, lead: 1.25 });
}

function readable(hex) {
    const n = parseInt(hex.slice(1), 16);
    let [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255];
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    if (lum >= 0.45) return hex;
    const t = Math.min(0.6, 0.45 - lum + 0.3);
    [r, g, b] = [r, g, b].map((c) => Math.round(c + (255 - c) * t));
    return `rgb(${r},${g},${b})`;
}

function slideStats(ctx, mon, art) {
    frame(ctx, mon, 'Battle Data');
    swipeHint(ctx);

    // Ghosted art in the corner keeps identity without fighting the numbers.
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.drawImage(art, 560, 200, 700, 700);
    ctx.restore();

    // Without a signature move the stats get the whole slide, bigger.
    const mv = moves[mon.signatureMove];
    const big = !mv;
    const x = 70, top = 230, rowH = big ? 104 : 74, barX = 300, barW = 620;
    const barH = big ? 52 : 40, fs = big ? 52 : 44;
    panel(ctx, 40, 200, SIZE - 80, rowH * 7 + (big ? 70 : 70));
    const color = readable(TYPE_COLORS[mon.types[0]]);
    let bst = 0;

    STATS.forEach(([k, name], i) => {
        const v = mon.baseStats[k];
        bst += v;
        const y = top + 30 + i * rowH;
        const mid = y + 8 + barH / 2;
        ctx.font = FONT(fs);
        ctx.fillStyle = PAPER;
        ctx.fillText(name, x, mid + fs * 0.36);

        ctx.beginPath();
        ctx.roundRect(barX, y + 8, barW, barH, barH / 2);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(barX, y + 8, Math.max(barH, barW * Math.min(v, 200) / 200), barH, barH / 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.font = FONT(fs + 4);
        ctx.fillStyle = v >= 120 ? GOLD : PAPER;
        ctx.fillText(String(v), barX + barW + 30, mid + fs * 0.38);
    });

    const by = top + 30 + 6 * rowH + 8 + barH / 2;
    ctx.font = FONT(fs + 8);
    ctx.fillStyle = GOLD;
    ctx.fillText('Total', x, by + fs * 0.4);
    ctx.fillText(String(bst), barX + barW + 30, by + fs * 0.4);

    // Signature move card.
    if (!mv) return;
    const my = 800, mh = 250;
    panel(ctx, 40, my, SIZE - 80, mh);
    label(ctx, 'Signature Move', 76, my + 56, 32);
    ctx.font = FONT(64);
    ctx.fillStyle = PAPER;
    ctx.fillText(mon.signatureMove, 76, my + 124);

    const pillsX = 76 + ctx.measureText(mon.signatureMove).width + 30;
    typePills(ctx, [mv.type], pillsX, my + 82, 170);
    const icon = moveIcons[mv.category];
    if (icon) {
        const ih = 40, iw = icon.width * (ih / icon.height);
        ctx.drawImage(icon, pillsX + 186, my + 84, iw, ih);
    }

    const meta = [
        mv.power ? `Pow ${mv.power}` : null,
        mv.accuracy ? `Acc ${mv.accuracy === true ? '—' : mv.accuracy}` : null,
        `PP ${mv.pp}`,
    ].filter(Boolean).join('   ');
    ctx.font = FONT(36);
    ctx.fillStyle = GOLD;
    const mw = ctx.measureText(meta).width;
    ctx.fillText(meta, SIZE - 76 - mw, my + 56);

    textBox(ctx, mv.description, 76, my + 140, SIZE - 152, 96, { max: 32, min: 22, color: '#c9c7d8' });
}

function slideShiny(ctx, mon, art, shiny) {
    frame(ctx, mon, 'Shiny');
    const s = 600, y = 260;
    artWithShadow(ctx, art, -10, y, s, 8);
    artWithShadow(ctx, shiny, SIZE - s + 10, y, s, 8);

    ctx.font = FONT(56);
    for (const [txt, cx] of [['Normal', SIZE * 0.25], ['Shiny', SIZE * 0.75]]) {
        const w = ctx.measureText(txt).width;
        ctx.fillStyle = txt === 'Normal' ? PAPER : GOLD;
        ctx.fillText(txt, cx - w / 2, y + s + 40);
    }

    ctx.font = FONT(40);
    ctx.fillStyle = PAPER;
    const q = 'Which one are you catching?';
    ctx.fillText(q, (SIZE - ctx.measureText(q).width) / 2, 1000);
}

// ---------------------------------------------------------------- main

async function render(draw) {
    const c = createCanvas(SIZE, SIZE);
    const ctx = c.getContext('2d');
    await draw(ctx);
    const out = createCanvas(EXPORT, EXPORT);
    const o = out.getContext('2d');
    o.fillStyle = '#fff';
    o.fillRect(0, 0, EXPORT, EXPORT);
    o.drawImage(c, 0, 0, EXPORT, EXPORT);
    return out.toBuffer('image/jpeg', { quality: QUALITY });
}

const wanted = process.argv.slice(2).map((s) => s.toLowerCase());
const keys = (wanted.length ? wanted : Object.keys(pokedex))
    .filter((k) => fs.existsSync(path.join(ART, `${k}.png`)));

fs.mkdirSync(OUT, { recursive: true });

for (const key of keys) {
    const mon = pokedex[key];
    if (!mon) { console.warn(`skip ${key}: no pokedex entry`); continue; }
    const art = await loadImage(path.join(ART, `${key}.png`));
    const shinyPath = path.join(ART, `${key}_shiny.png`);
    const shiny = fs.existsSync(shinyPath) ? await loadImage(shinyPath) : null;

    const slides = [
        ['2', (ctx) => slideDex(ctx, mon, art)],
        ['3', (ctx) => slideStats(ctx, mon, art)],
        ...(shiny ? [['4', (ctx) => slideShiny(ctx, mon, art, shiny)]] : []),
    ];
    for (const [n, draw] of slides) {
        fs.writeFileSync(path.join(OUT, `${key}-${n}.jpg`), await render(draw));
    }
    console.log(`${key}: ${slides.length} slides`);
}
