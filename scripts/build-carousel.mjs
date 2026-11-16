// Builds a 4:5 swipeable carousel per Pokemon, so a post becomes a mini dex
// page instead of a single square card:
//
//   1. Hero       -- the art, big
//   2. Shiny      -- normal vs shiny side by side (when shiny art exists)
//   3. Dex entry  -- number, kind, typing, size, abilities, flavour text
//   4. Base stats -- one colour per stat + signature move
//   5. Evolution  -- the whole line, this one highlighted (when it evolves)
//
// Why 4:5 (1080x1350): it is the tallest feed image Instagram allows, so it
// takes ~25% more screen than a square, and the profile grid's 3:4 crop only
// trims ~37px per side -- the name banner is kept clear of that.
//
// Backgrounds, in order of preference:
//   - a photo of the Pokemon's environment, blurred here (environments/, see
//     environments/README.md) -- the art then gets a soft glow outline;
//   - otherwise a type-tinted gradient, drawn here, with the gold offset shadow.
// A detailed frame is drawn over every slide either way.
//
// Output: socialCarousel/<key>-<n>.jpg. Local-only (needs `canvas`).
//
//   node scripts/build-carousel.mjs                 # every entry with art
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
const ENV = path.join(BASE, 'environments');
const W = 1200, H = 1500;              // draw size...
const EW = 1080, EH = 1350;            // ...export size (Instagram 4:5)
const QUALITY = 0.9;
const SAFE = 90;                       // clear of the 3:4 grid crop (37px) with room to spare

const GOLD = '#ffd200';
const PAPER = '#f4f1e8';
const MUTED = '#c9c7d8';
const FONT = (px) => `${px}px "SmileyOblique"`;

// Same palette as sharableImageGenerator.js.
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

// One colour per stat, in rainbow order.
const STAT_COLORS = {
    hp: '#ff5252', atk: '#ff9a3c', def: '#ffd83b',
    spa: '#4fa8ff', spd: '#5fdc6e', spe: '#ff7ec8',
};

const typeIcons = {}, typeBars = {}, moveIcons = {};
for (const t of Object.keys(TYPE_COLORS)) {
    const i = path.join(BASE, 'typeIcons', `${t}.png`);
    const b = path.join(BASE, 'typeBars', `${t}.png`);
    if (fs.existsSync(i)) typeIcons[t] = await loadImage(i);
    if (fs.existsSync(b)) typeBars[t] = await loadImage(b);
}
for (const c of ['Physical', 'Special', 'Status']) {
    moveIcons[c] = await loadImage(path.join(BASE, 'moveIcons', `${c}.png`));
}

// environments/map.json lets several Pokemon share one photo:
//   { "stratoclysm": "sky.jpg", "larvos": "forest.jpg" }
// A file named <key>.jpg/.png in environments/ is picked up without a mapping.
const envMap = fs.existsSync(path.join(ENV, 'map.json'))
    ? JSON.parse(fs.readFileSync(path.join(ENV, 'map.json'), 'utf8')) : {};

function envPathFor(key) {
    const candidates = [envMap[key], `${key}.jpg`, `${key}.jpeg`, `${key}.png`].filter(Boolean);
    return candidates.map((f) => path.join(ENV, f)).find((p) => fs.existsSync(p)) ?? null;
}

// ---------------------------------------------------------------- colour

const hexRgb = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return [n >> 16, (n >> 8) & 255, n & 255];
};
const mix = (a, b, t) => a.map((c, i) => Math.round(c + (b[i] - c) * t));
const css = ([r, g, b], a = 1) => `rgba(${r},${g},${b},${a})`;

// ---------------------------------------------------------------- image ops

/** node-canvas has no ctx.filter, so blur by shrinking and growing in steps. */
function blurred(src, w, h, strength = 24) {
    let cur = src, cw = w, ch = h;
    const steps = [];
    for (let f = 2; f <= strength; f *= 2) steps.push(f);
    for (const f of steps) {
        const c = createCanvas(Math.max(1, Math.round(w / f)), Math.max(1, Math.round(h / f)));
        c.getContext('2d').drawImage(cur, 0, 0, cw, ch, 0, 0, c.width, c.height);
        cur = c; cw = c.width; ch = c.height;
    }
    for (const f of steps.reverse().slice(1).concat(1)) {
        const c = createCanvas(Math.round(w / f), Math.round(h / f));
        c.getContext('2d').drawImage(cur, 0, 0, cw, ch, 0, 0, c.width, c.height);
        cur = c; cw = c.width; ch = c.height;
    }
    return cur;
}

/** The art's silhouette in one flat colour, on a full-size layer. */
function silhouette(img, x, y, s, color, spread = 0) {
    const layer = createCanvas(W, H);
    const l = layer.getContext('2d');
    const n = spread ? 24 : 1;
    for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        l.drawImage(img, x + Math.cos(a) * spread, y + Math.sin(a) * spread, s, s);
    }
    l.globalCompositeOperation = 'source-in';
    l.fillStyle = color;
    l.fillRect(0, 0, W, H);
    return layer;
}

// ---------------------------------------------------------------- background

/** Photo, cover-fitted, blurred, and dimmed enough for text to sit on. */
function photoBackground(ctx, photo, mon) {
    const scale = Math.max(W / photo.width, H / photo.height) * 1.08; // overscan hides blur edges
    const pw = photo.width * scale, ph = photo.height * scale;
    const sharp = createCanvas(W, H);
    sharp.getContext('2d').drawImage(photo, (W - pw) / 2, (H - ph) / 2, pw, ph);
    ctx.drawImage(blurred(sharp, W, H, 32), 0, 0);

    // A whisper of the type colour, then a dim + vignette for legibility.
    ctx.fillStyle = css(hexRgb(TYPE_COLORS[mon.types[0]] ?? '#888888'), 0.10);
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(10,12,24,0.22)';
    ctx.fillRect(0, 0, W, H);
    const v = ctx.createRadialGradient(W / 2, H / 2, W * 0.35, W / 2, H / 2, W * 0.95);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
}

/**
 * No photo: the original navy -> dusk -> slate -> navy sweep, pulled toward
 * the primary type at the top and the secondary at the bottom.
 */
function gradientBackground(ctx, mon) {
    const [t1, t2 = t1] = mon.types;
    const top = hexRgb(TYPE_COLORS[t1] ?? '#888888');
    const bot = hexRgb(TYPE_COLORS[t2] ?? '#888888');

    const stops = [
        [0.00, [30, 30, 52], top, 0.22],
        [0.22, [70, 58, 84], top, 0.38],
        [0.45, [96, 98, 122], top, 0.30],
        [0.60, [80, 102, 138], bot, 0.30],
        [0.82, [42, 56, 98], bot, 0.36],
        [1.00, [26, 30, 62], bot, 0.22],
    ];
    const g = ctx.createLinearGradient(0, 0, 0, H);
    for (const [p, base, tint, amt] of stops) g.addColorStop(p, css(mix(base, tint, amt)));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const grain = ctx.getImageData(0, 0, W, H);
    for (let i = 0; i < grain.data.length; i += 4) {
        const n = (Math.random() - 0.5) * 10;
        grain.data[i] += n; grain.data[i + 1] += n; grain.data[i + 2] += n;
    }
    ctx.putImageData(grain, 0, 0);

    const dots = (y0, dir, tint) => {
        const rows = 6, gap = 82;
        for (let r = 0; r < rows; r++) {
            const y = y0 + dir * r * gap * 0.62;
            const rad = 34 * (1 - r / rows) ** 1.4 + 3;
            const off = (r % 2) * gap / 2;
            ctx.fillStyle = css(mix([12, 14, 34], tint, 0.25), 0.55 - r * 0.07);
            for (let x = -gap + off; x < W + gap; x += gap) {
                ctx.beginPath();
                ctx.arc(x, y, rad, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    };
    dots(18, 1, top);
    dots(H - 18, -1, bot);
}

// ---------------------------------------------------------------- frame

function diamond(ctx, x, y, r, fill) {
    ctx.beginPath();
    ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
}

/**
 * The detailed frame laid over the whole slide: a double gold rule, heavier
 * corner brackets with a dot cluster, and diamond studs at the edge midpoints.
 */
function border(ctx) {
    const o = 26, i2 = 40;               // outer and inner rule insets
    ctx.save();

    // Darken the margin outside the frame so it reads as a mount.
    ctx.fillStyle = 'rgba(6,6,14,0.35)';
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.roundRect(o, o, W - 2 * o, H - 2 * o, 18);
    ctx.fill('evenodd');

    ctx.strokeStyle = 'rgba(255,210,0,0.95)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(o, o, W - 2 * o, H - 2 * o, 18);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,226,120,0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 7]);
    ctx.beginPath();
    ctx.roundRect(i2, i2, W - 2 * i2, H - 2 * i2, 10);
    ctx.stroke();
    ctx.setLineDash([]);

    // Corner brackets.
    const len = 92, t = 7;
    ctx.fillStyle = GOLD;
    for (const [cx, cy, sx, sy] of [[o, o, 1, 1], [W - o, o, -1, 1], [o, H - o, 1, -1], [W - o, H - o, -1, -1]]) {
        ctx.fillRect(Math.min(cx, cx + sx * len), cy - (sy < 0 ? t : 0), len, t);
        ctx.fillRect(cx - (sx < 0 ? t : 0), Math.min(cy, cy + sy * len), t, len);
        diamond(ctx, cx + sx * 8, cy + sy * 8, 13, GOLD);
        diamond(ctx, cx + sx * 8, cy + sy * 8, 5, '#1a1420');
        for (let k = 0; k < 3; k++) {     // little halftone run off each bracket
            const r = 4.5 - k * 1.3;
            ctx.beginPath(); ctx.arc(cx + sx * (len + 14 + k * 14), cy + sy * 3.5, r, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(cx + sx * 3.5, cy + sy * (len + 14 + k * 14), r, 0, Math.PI * 2); ctx.fill();
        }
    }

    // Studs at the edge midpoints.
    for (const [x, y] of [[W / 2, o], [W / 2, H - o], [o, H / 2], [W - o, H / 2]]) {
        diamond(ctx, x, y, 11, GOLD);
        diamond(ctx, x, y, 4, '#1a1420');
    }
    ctx.restore();
}

/** Yellow name banner with the halftone tail, like the original card. */
function banner(ctx, title) {
    const y = 70, h = 128;

    let size = 92;
    ctx.font = FONT(size);
    while (ctx.measureText(title).width > 720 && size > 56) ctx.font = FONT(size -= 4);
    const textW = ctx.measureText(title).width;
    const solid = Math.max(520, SAFE + textW + 60);

    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.moveTo(0, y + 12); ctx.lineTo(solid + 52, y + 12);
    ctx.lineTo(solid + 12, y + h + 12); ctx.lineTo(0, y + h + 12);
    ctx.fill();

    const g = ctx.createLinearGradient(0, 0, solid, 0);
    g.addColorStop(0, '#ffb800');
    g.addColorStop(1, '#ffdf1a');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, y); ctx.lineTo(solid + 40, y);
    ctx.lineTo(solid, y + h); ctx.lineTo(0, y + h);
    ctx.fill();

    for (let col = 0; col < 9; col++) {
        for (let row = 0; row < 7; row++) {
            const cx = solid - 60 + col * 30 + (row % 2) * 15 + (h - row * 19) * 0.3;
            const cy = y + 8 + row * 19;
            const r = Math.max(0, 11 - col * 1.3 + (row % 3) * 0.6);
            if (r < 1.5) continue;
            ctx.fillStyle = col < 3 ? '#ffd21a' : '#ffe24a';
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.fillStyle = '#111';
    ctx.fillText(title, SAFE, y + 94 - (92 - size) / 3);
}

function watermark(ctx) {
    const h = 78, y = H - 168, x = W - 360;
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 4; j++) {
            ctx.fillStyle = 'rgba(8,8,16,0.9)';
            ctx.beginPath();
            ctx.arc(x - 70 + i * 13, y + 12 + j * 19 + (i % 2) * 9, 1.5 + i * 1.1, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.fillStyle = 'rgba(8,8,16,0.92)';
    ctx.fillRect(x, y, W - x, h);
    ctx.font = FONT(54);
    ctx.fillStyle = GOLD;
    ctx.fillText('@EmSheshan', W - SAFE - ctx.measureText('@EmSheshan').width, y + 58);
}

function swipeHint(ctx) {
    ctx.font = FONT(36);
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    const t = 'swipe →';
    ctx.fillText(t, W - SAFE - ctx.measureText(t).width, 145);
}

/** Everything drawn over the slide content: frame, banner, tag. */
function chrome(ctx, title, sl) {
    const swipe = !sl.isLast;
    border(ctx);
    banner(ctx, title);
    watermark(ctx);
    if (swipe) swipeHint(ctx);
}

// ---------------------------------------------------------------- helpers

function abilityText(name) {
    const a = abilities[name];
    return typeof a === 'string' ? a : a?.description ?? '';
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

/** Wrapped text, shrinking until it fits, optionally centred in the box. */
function textBox(ctx, text, x, y, w, h, { max = 44, min = 24, lead = 1.3, color = PAPER, center = false } = {}) {
    let size = max, lines;
    for (; size >= min; size -= 2) {
        ctx.font = FONT(size);
        lines = wrap(ctx, text, w);
        if (lines.length * size * lead <= h) break;
    }
    const used = lines.length * size * lead;
    const y0 = center ? y + (h - used) / 2 : y;
    ctx.fillStyle = color;
    lines.forEach((l, i) => ctx.fillText(l, x, y0 + size + i * size * lead - size * 0.15));
}

function panel(ctx, x, y, w, h, r = 26) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = 'rgba(12, 14, 34, 0.76)';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(255, 210, 0, 0.55)';
    ctx.stroke();
    ctx.restore();
}

/**
 * The art, outlined to suit the background: a soft light halo on a photo (as
 * in the hand-made environment cards), the gold offset shadow on a gradient.
 */
function drawArt(ctx, slide, img, x, y, s) {
    if (slide.photo) {
        const tint = css(mix([255, 250, 235], hexRgb(TYPE_COLORS[slide.mon.types[0]] ?? '#ffffff'), 0.25));
        const k = s / 1100;
        ctx.drawImage(blurred(silhouette(img, x, y, s, tint, 16 * k), W, H, 8), 0, 0);
        ctx.globalAlpha = 0.9;
        ctx.drawImage(silhouette(img, x, y, s, tint, 7 * k), 0, 0);
        ctx.globalAlpha = 1;
    } else {
        const off = Math.max(6, Math.round(12 * s / 1100));
        ctx.drawImage(silhouette(img, x + off, y + off, s, GOLD), 0, 0);
    }
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
        ctx.drawImage(img, x, y, w, img.height * (w / img.width));
        x += w + 16;
    }
}

// ---------------------------------------------------------------- slides

function slideHero(ctx, sl) {
    const { mon, art } = sl;
    const s = 1080;
    drawArt(ctx, sl, art, (W - s) / 2, 250, s);

    let x = SAFE - 20;
    for (const t of mon.types) {
        const img = typeIcons[t];
        if (!img) continue;
        ctx.drawImage(img, x, H - 185, 96, 96);
        x += 112;
    }
    chrome(ctx, mon.name, sl);
}

function slideDex(ctx, sl) {
    const { mon, art } = sl;
    drawArt(ctx, sl, art, 50, 240, 560);

    const px = 620, pw = W - px - 70, py = 245, ph = 580;
    panel(ctx, px, py, pw, ph);
    const ix = px + 34;
    ctx.font = FONT(64);
    ctx.fillStyle = GOLD;
    ctx.fillText(`#${mon.num}`, ix, py + 76);
    ctx.font = FONT(42);
    ctx.fillStyle = PAPER;
    ctx.fillText(`The ${mon.kind} Pokémon`, ix, py + 134);
    typePills(ctx, mon.types, ix, py + 158, 210);

    label(ctx, 'Height', ix, py + 264);
    label(ctx, 'Weight', ix + 240, py + 264);
    ctx.font = FONT(52);
    ctx.fillStyle = PAPER;
    ctx.fillText(`${mon.heightm} m`, ix, py + 320);
    ctx.fillText(`${mon.weightkg} kg`, ix + 240, py + 320);

    const ab = Object.values(mon.abilities ?? {});
    label(ctx, ab.length > 1 ? 'Abilities' : 'Ability', ix, py + 392);
    if (ab.length === 1) {
        ctx.font = FONT(48);
        ctx.fillStyle = PAPER;
        ctx.fillText(ab[0], ix, py + 444);
        textBox(ctx, abilityText(ab[0]), ix, py + 456, pw - 68, 108, { max: 30, min: 20, color: MUTED });
    } else {
        let size = 46;
        ctx.font = FONT(size);
        while (size > 28 && Math.max(...ab.map((a) => ctx.measureText(a).width)) > pw - 68) {
            ctx.font = FONT(size -= 2);
        }
        ctx.fillStyle = PAPER;
        ab.forEach((a, i) => ctx.fillText(a, ix, py + 444 + i * (size + 10)));
    }

    const fy = 855, fh = H - 200 - fy;
    panel(ctx, 70, fy, W - 140, fh);
    textBox(ctx, (mon.description ?? []).join('\n\n'), 106, fy + 22, W - 212, fh - 44,
        { max: 46, min: 28, lead: 1.28, center: true });

    chrome(ctx, mon.name, sl);
}

function slideStats(ctx, sl) {
    const { mon, art } = sl;

    drawArt(ctx, sl, art, 80, 225, 330);
    const bst = STATS.reduce((n, [k]) => n + mon.baseStats[k], 0);
    label(ctx, 'Base Stat Total', 470, 320, 38);
    ctx.font = FONT(150);
    ctx.fillStyle = PAPER;
    ctx.fillText(String(bst), 464, 458);
    typePills(ctx, mon.types, 474, 482, 200);

    const mv = moves[mon.signatureMove];
    const big = !mv;
    const top = 585, rowH = big ? 108 : 72, barH = big ? 52 : 38, fs = big ? 54 : 42;
    const x = 110, barX = 340, barW = 600;
    panel(ctx, 70, top, W - 140, rowH * 6 + 50);

    STATS.forEach(([k, name], i) => {
        const v = mon.baseStats[k];
        const mid = top + 25 + i * rowH + rowH / 2;
        ctx.font = FONT(fs);
        ctx.fillStyle = PAPER;
        ctx.fillText(name, x, mid + fs * 0.36);

        ctx.beginPath();
        ctx.roundRect(barX, mid - barH / 2, barW, barH, barH / 2);
        ctx.fillStyle = 'rgba(255,255,255,0.10)';
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(barX, mid - barH / 2, Math.max(barH, barW * Math.min(v, 200) / 200), barH, barH / 2);
        ctx.fillStyle = STAT_COLORS[k];
        ctx.fill();

        ctx.font = FONT(fs + 6);
        ctx.fillStyle = PAPER;
        ctx.fillText(String(v), barX + barW + 30, mid + fs * 0.38);
    });

    if (mv) {
        const my = top + rowH * 6 + 70, mh = H - 196 - my;
        panel(ctx, 70, my, W - 140, mh);
        label(ctx, 'Signature Move', 108, my + 52, 30);
        ctx.font = FONT(60);
        ctx.fillStyle = PAPER;
        ctx.fillText(mon.signatureMove, 108, my + 116);

        const pillsX = 108 + ctx.measureText(mon.signatureMove).width + 28;
        typePills(ctx, [mv.type], pillsX, my + 78, 160);
        const icon = moveIcons[mv.category];
        if (icon) {
            const ih = 38;
            ctx.drawImage(icon, pillsX + 174, my + 80, icon.width * (ih / icon.height), ih);
        }

        const meta = [
            mv.power ? `Pow ${mv.power}` : null,
            mv.accuracy ? `Acc ${mv.accuracy === true ? '—' : mv.accuracy}` : null,
            `PP ${mv.pp}`,
        ].filter(Boolean).join('   ');
        ctx.font = FONT(34);
        ctx.fillStyle = GOLD;
        ctx.fillText(meta, W - 108 - ctx.measureText(meta).width, my + 52);

        textBox(ctx, mv.description, 108, my + 132, W - 216, mh - 146, { max: 34, min: 22, color: MUTED });
    }

    chrome(ctx, 'Base Stats', sl);
}

function slideShiny(ctx, sl) {
    const { art, shiny } = sl;
    const s = 610, y = 330;
    drawArt(ctx, sl, art, -5, y, s);
    drawArt(ctx, sl, shiny, W - s + 5, y, s);

    ctx.font = FONT(64);
    for (const [txt, cx, col] of [['Normal', W * 0.25, PAPER], ['Shiny', W * 0.75, GOLD]]) {
        ctx.fillStyle = col;
        ctx.fillText(txt, cx - ctx.measureText(txt).width / 2, y + s + 70);
    }

    const q = 'Which one are you catching?';
    ctx.font = FONT(50);
    const qw = ctx.measureText(q).width;
    panel(ctx, (W - qw) / 2 - 50, 1120, qw + 100, 96, 48);
    ctx.fillStyle = PAPER;
    ctx.fillText(q, (W - qw) / 2, 1185);

    chrome(ctx, 'Shiny', sl);
}

// ---------------------------------------------------------------- evolution

// pokedex.js only records forward evolutions by display name, so the line is
// rebuilt by walking `evos`. A name with no exact entry (Nokoi -> "Yakoyza")
// stands for every form of that species.
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
const keyByName = Object.fromEntries(Object.entries(pokedex).map(([k, v]) => [norm(v.name), k]));
const hasArt = (k) => fs.existsSync(path.join(ART, `${k}.png`));

function resolve(name) {
    const exact = keyByName[norm(name)];
    if (exact) return [exact];
    return Object.entries(pokedex)
        .filter(([, v]) => norm(String(v.name).split('-')[0]) === norm(name))
        .map(([k]) => k);
}

const evosOf = (key) => (pokedex[key]?.evos ?? []).flatMap(resolve);
const prevoOf = (key) => Object.keys(pokedex).find((k) => evosOf(k).includes(key)) ?? null;

/** Stages of key's family, root first: [[root], [stage 2...], [stage 3...]]. */
function evoLine(key) {
    let root = key;
    for (let p = prevoOf(root), guard = 0; p && guard < 5; p = prevoOf(root), guard++) root = p;
    const stages = [[root]];
    for (let guard = 0; guard < 5; guard++) {
        const next = [...new Set(stages.at(-1).flatMap(evosOf))];
        if (!next.length) break;
        stages.push(next);
    }
    return stages.map((st) => st.filter(hasArt)).filter((st) => st.length);
}

function chevron(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.moveTo(x - 16, y - 30); ctx.lineTo(x + 18, y); ctx.lineTo(x - 16, y + 30);
    ctx.lineTo(x - 4, y); ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function slideEvo(ctx, sl) {
    const stages = sl.evo;
    const arrowW = 60, left = 70, right = W - 70;
    const colW = (right - left - arrowW * (stages.length - 1)) / stages.length;
    const top = 250, bottom = H - 210, nameH = 64;

    stages.forEach((members, si) => {
        const cx = left + si * (colW + arrowW) + colW / 2;
        // Several members in one stage (a branch) stack down the column.
        const cols = members.length > 3 ? 2 : 1;
        const rows = Math.ceil(members.length / cols);
        const cellW = colW / cols, cellH = (bottom - top) / rows;
        const size = Math.min(cellW - 10, cellH - nameH, 440);

        members.forEach((k, mi) => {
            const c = mi % cols, r = Math.floor(mi / cols);
            const x0 = cx - colW / 2 + c * cellW + (cellW - size) / 2;
            const blockH = rows === 1 ? size + nameH : cellH;
            const y0 = rows === 1 ? (top + bottom - blockH) / 2 : top + r * cellH;
            const img = sl.evoArt[k];
            const isMe = k === sl.key;

            if (isMe) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(x0 + size / 2, y0 + size / 2, size * 0.52, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,210,0,0.16)';
                ctx.fill();
                ctx.lineWidth = 4;
                ctx.strokeStyle = 'rgba(255,210,0,0.8)';
                ctx.stroke();
                ctx.restore();
            }
            drawArt(ctx, sl, img, x0, y0, size);

            const nm = pokedex[k].name;
            let fsz = Math.min(48, Math.max(26, size / 6));
            ctx.font = FONT(fsz);
            while (ctx.measureText(nm).width > cellW - 10 && fsz > 22) ctx.font = FONT(fsz -= 2);
            ctx.fillStyle = isMe ? GOLD : PAPER;
            ctx.fillText(nm, x0 + size / 2 - ctx.measureText(nm).width / 2, y0 + size + fsz + 8);
        });

        if (si < stages.length - 1) chevron(ctx, cx + colW / 2 + arrowW / 2, (top + bottom) / 2);
    });

    chrome(ctx, 'Evolution', sl);
}

// ---------------------------------------------------------------- main

async function render(sl, draw) {
    const c = createCanvas(W, H);
    const ctx = c.getContext('2d');
    if (sl.photo) photoBackground(ctx, sl.photo, sl.mon);
    else gradientBackground(ctx, sl.mon);
    draw(ctx, sl);
    const out = createCanvas(EW, EH);
    out.getContext('2d').drawImage(c, 0, 0, EW, EH);
    return out.toBuffer('image/jpeg', { quality: QUALITY });
}

const wanted = process.argv.slice(2).map((s) => s.toLowerCase());
const keys = (wanted.length ? wanted : Object.keys(pokedex))
    .filter((k) => fs.existsSync(path.join(ART, `${k}.png`)));

// node-canvas frees its pixel buffers lazily, so one process rendering every
// card runs out of memory. A full run hands out small batches to child processes.
if (!wanted.length) {
    const { spawnSync } = await import('node:child_process');
    const BATCH = 6;
    for (let i = 0; i < keys.length; i += BATCH) {
        const r = spawnSync(process.execPath, [process.argv[1], ...keys.slice(i, i + BATCH)], { stdio: 'inherit' });
        if (r.status !== 0) process.exit(r.status ?? 1);
    }
    process.exit(0);
}

fs.mkdirSync(OUT, { recursive: true });

for (const key of keys) {
    const mon = pokedex[key];
    if (!mon) { console.warn(`skip ${key}: no pokedex entry`); continue; }
    const shinyPath = path.join(ART, `${key}_shiny.png`);
    const envPath = envPathFor(key);
    const sl = {
        mon,
        art: await loadImage(path.join(ART, `${key}.png`)),
        shiny: fs.existsSync(shinyPath) ? await loadImage(shinyPath) : null,
        photo: envPath ? await loadImage(envPath) : null,
    };

    sl.key = key;
    sl.evo = evoLine(key);
    const evolves = sl.evo.flat().length > 1;
    if (evolves) {
        sl.evoArt = {};
        for (const k of sl.evo.flat()) sl.evoArt[k] = await loadImage(path.join(ART, `${k}.png`));
    }

    const slides = [
        slideHero,
        ...(sl.shiny ? [slideShiny] : []),
        slideDex,
        slideStats,
        ...(evolves ? [slideEvo] : []),
    ];
    for (const [i, draw] of slides.entries()) {
        sl.isLast = i === slides.length - 1;
        fs.writeFileSync(path.join(OUT, `${key}-${i + 1}.jpg`), await render(sl, draw));
    }
    console.log(`${key}: ${slides.length} slides${sl.photo ? ` (photo: ${path.basename(envPath)})` : ''}`);
}
