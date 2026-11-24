// Builds a 4:5 swipeable carousel per Pokemon, so a post becomes a mini dex
// page instead of a single square card:
//
//   1. Hero       -- the art, big
//   2. Dex entry  -- shiny art, number, kind, typing, size, abilities, flavour text
//   3. Base stats -- one colour per stat + signature move
//   4. Evolution  -- the whole line, this one highlighted (when it evolves)
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
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { pickHabitat, paintHabitat, HABITATS } from './habitats.mjs';

const BASE = path.resolve();

// Data comes from the Emsh site (checked out next to this repo, or EMSH_DIR),
// so posts always match the website: types, evolutions, habitat photos. Without
// it, this repo's own (older) pokedex.js is used.
const EMSH = [process.env.EMSH_DIR, '../emsh', '../Emsh'].filter(Boolean)
    .map((d) => path.resolve(BASE, d)).find((d) => fs.existsSync(path.join(d, 'lacadia', 'data', 'pokedex.csv')));
const SITE = EMSH && path.join(EMSH, 'lacadia', 'data');
let pokedex, abilities, moves;
const siteBg = {};
if (SITE) {
    const { parseCSV, buildDex } = await import(path.join(EMSH, 'shared', 'pokeData.js'));
    const read = (f) => fs.existsSync(path.join(SITE, f)) ? parseCSV(fs.readFileSync(path.join(SITE, f), 'utf8')) : [];
    pokedex = { ...buildDex(read('pokedex.csv'), { start: 1 }), ...buildDex(read('canondex.csv'), { external: true }) };
    for (const m of Object.values(pokedex)) if (m.background) siteBg[m.id] = m.background;
    ({ abilities } = await import(path.join(SITE, 'abilities.js')));
    ({ moves } = await import(path.join(SITE, 'moves.js')));
    console.log(`data: ${path.relative(BASE, SITE) || SITE}`);
} else {
    ({ pokedex } = await import(path.join(BASE, 'pokedex.js')));
    ({ abilities } = await import(path.join(BASE, 'abilities.js')));
    ({ moves } = await import(path.join(BASE, 'moves.js')));
    console.log('data: pokedex.js (no Emsh checkout found)');
}
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

// environments/map.json picks a backdrop per Pokemon (or species name):
//   { "stratoclysm": "space", "larvos": "forest.jpg", "bitbyte": "gradient" }
// A value is a photo in environments/, a painted habitat name (see
// scripts/habitats.mjs), or "gradient" for the plain type gradient.
// A photo named <key>.jpg/.png is picked up without a mapping. With no
// mapping or photo, a habitat is chosen from the flavour text and type.
const envMap = fs.existsSync(path.join(ENV, 'map.json'))
    ? JSON.parse(fs.readFileSync(path.join(ENV, 'map.json'), 'utf8')) : {};

function envPathFor(key) {
    const site = siteBg[key] && ['jpg', 'jpeg', 'png'].map((e) => path.join(EMSH, 'environments', `${siteBg[key]}.${e}`)).find((p) => fs.existsSync(p));
    if (site) return site;
    const candidates = [envMap[key], `${key}.jpg`, `${key}.jpeg`, `${key}.png`].filter(Boolean);
    return candidates.map((f) => path.join(ENV, f)).find((p) => fs.existsSync(p) && fs.statSync(p).isFile()) ?? null;
}

/** 'gradient', a habitat name, or null when only a photo would do. */
function mappedScene(keys) {
    for (const k of keys) {
        const v = envMap[k];
        if (v === 'gradient' || HABITATS.includes(v)) return v;
    }
    return null;
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


/**
 * Lens-style chromatic aberration: red is sampled a touch further out from
 * the centre and blue a touch further in, so colour fringes grow towards the
 * edges and the middle stays sharp.
 */
function chromatic(ctx, amount = 0.012) {
    const src = ctx.getImageData(0, 0, W, H), out = ctx.createImageData(W, H);
    const s = src.data, d = out.data, cx = W / 2, cy = H / 2;
    const at = (x, y) => (Math.min(H - 1, Math.max(0, Math.round(y))) * W + Math.min(W - 1, Math.max(0, Math.round(x)))) * 4;
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            const i = (y * W + x) * 4, dx = x - cx, dy = y - cy;
            d[i] = s[at(cx + dx * (1 + amount), cy + dy * (1 + amount))];
            d[i + 1] = s[i + 1];
            d[i + 2] = s[at(cx + dx * (1 - amount), cy + dy * (1 - amount)) + 2];
            d[i + 3] = 255;
        }
    }
    ctx.putImageData(out, 0, 0);
}


/**
 * A neat halftone band: a regular offset grid of dots, biggest at the edge
 * (y0) and shrinking row by row towards the middle (dir = 1 down, -1 up).
 */
function halftoneEdge(ctx, y0, dir, { rows = 9, gap = 30, maxR = 13, color = 'rgba(6,6,14,0.55)' } = {}) {
    ctx.save();
    ctx.fillStyle = color;
    const pitch = gap * 0.866;                     // equilateral grid
    for (let r = 0; r < rows; r++) {
        const rad = maxR * (1 - r / rows) ** 1.25;
        if (rad < 0.8) continue;
        const y = y0 + dir * (r * pitch + gap / 2);
        for (let x = (r % 2) * gap / 2; x < W + gap; x += gap) {
            ctx.beginPath();
            ctx.arc(x, y, rad, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.restore();
}


/** Photo, cover-fitted, blurred, and dimmed enough for text to sit on. */
function photoBackground(ctx, photo, mon) {
    const scale = Math.max(W / photo.width, H / photo.height) * 1.08; // overscan hides blur edges
    const pw = photo.width * scale, ph = photo.height * scale;
    const sharp = createCanvas(W, H);
    sharp.getContext('2d').drawImage(photo, (W - pw) / 2, (H - ph) / 2, pw, ph);
    ctx.drawImage(blurred(sharp, W, H, 32), 0, 0);
    chromatic(ctx, 0.028);

    // Blend the type gradient through it so every card keeps the house
    // colours, then dim + vignette so text and art stand off the scene.
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = typeGradient(ctx, mon);
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = typeGradient(ctx, mon);
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    ctx.fillStyle = 'rgba(10,12,24,0.16)';
    ctx.fillRect(0, 0, W, H);
    const v = ctx.createRadialGradient(W / 2, H / 2, W * 0.35, W / 2, H / 2, W * 0.95);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
    // Dark halftone creeping in from the top and bottom edges: the scene and
    // the art in the middle stay clear and bright.
    halftoneEdge(ctx, 0, 1);
    halftoneEdge(ctx, H, -1);
}

const smooth = (t) => t * t * (3 - 2 * t);

/**
 * The original navy -> dusk -> slate -> navy sweep, tinted by type. The tint
 * slides continuously from the primary type at the top to the secondary at
 * the bottom, so the two types blend instead of meeting in a band.
 */
function typeGradient(ctx, mon) {
    const [t1, t2 = t1] = mon.types;
    const top = hexRgb(TYPE_COLORS[t1] ?? '#888888');
    const bot = hexRgb(TYPE_COLORS[t2] ?? '#888888');
    const base = [[0, [30, 30, 52]], [0.22, [70, 58, 84]], [0.48, [92, 96, 124]],
        [0.62, [80, 98, 134]], [0.84, [42, 56, 98]], [1, [26, 30, 62]]];
    const baseAt = (p) => {
        const i = base.findIndex(([q]) => q >= p);
        if (i <= 0) return base[0][1];
        const [q0, c0] = base[i - 1], [q1, c1] = base[i];
        return mix(c0, c1, smooth((p - q0) / (q1 - q0)));
    };
    const g = ctx.createLinearGradient(0, 0, 0, H);
    for (let i = 0; i <= 24; i++) {
        const p = i / 24;
        const tint = mix(top, bot, smooth(Math.min(1, Math.max(0, (p - 0.15) / 0.7))));
        const amt = 0.26 + 0.1 * Math.sin(p * Math.PI);
        g.addColorStop(p, css(mix(baseAt(p), tint, amt)));
    }
    return g;
}

function gradientBackground(ctx, mon) {
    const [t1, t2 = t1] = mon.types;
    const top = hexRgb(TYPE_COLORS[t1] ?? '#888888');
    const bot = hexRgb(TYPE_COLORS[t2] ?? '#888888');
    ctx.fillStyle = typeGradient(ctx, mon);
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
 * The frame laid over the whole slide: a single gold rule, heavier
 * rounded corners.
 */
function border(ctx) {
    // One clean gold rule with short heavier corners.
    const o = 28, r = 20;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,210,0,0.85)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(o, o, W - 2 * o, H - 2 * o, r);
    ctx.stroke();

    const len = 70;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.strokeStyle = GOLD;
    for (const [cx, cy, sx, sy] of [[o, o, 1, 1], [W - o, o, -1, 1], [o, H - o, 1, -1], [W - o, H - o, -1, -1]]) {
        ctx.beginPath();
        ctx.moveTo(cx, cy + sy * len);
        ctx.lineTo(cx, cy + sy * r);
        ctx.arcTo(cx, cy, cx + sx * r, cy, r);
        ctx.lineTo(cx + sx * len, cy);
        ctx.stroke();
    }
    ctx.restore();
}

const LEAN = 36;   // how far the banner and tag edges slant over their height

/** Yellow name banner with a slanted end, like the original card. */
function banner(ctx, title) {
    const y = 70, h = 124;
    let size = 90;
    ctx.font = FONT(size);
    while (ctx.measureText(title).width > 720 && size > 56) ctx.font = FONT(size -= 4);
    const solid = Math.max(480, SAFE + ctx.measureText(title).width + 56);
    const edgeAt = (yy) => solid + LEAN * (1 - (yy - y) / h);

    const shape = () => {
        ctx.beginPath();
        ctx.moveTo(0, y); ctx.lineTo(edgeAt(y), y); ctx.lineTo(edgeAt(y + h), y + h); ctx.lineTo(0, y + h);
    };
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.4)';           // slight drop shadow
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 6;
    ctx.shadowOffsetY = 7;
    const g = ctx.createLinearGradient(0, 0, solid, 0);
    g.addColorStop(0, '#ffb800');
    g.addColorStop(1, '#ffdc14');
    ctx.fillStyle = g;
    shape();
    ctx.fill();
    ctx.restore();

    // Very faint halftone in the yellow, dots growing towards the slanted end.
    ctx.save();
    shape();
    ctx.clip();
    ctx.fillStyle = 'rgba(200,110,0,0.13)';
    const gap = 16;
    for (let row = 0, yy = y + gap / 2; yy < y + h; row++, yy += gap * 0.866) {
        for (let xx = (row % 2) * gap / 2; xx < solid + LEAN + gap; xx += gap) {
            const r = 0.8 + 4.4 * (xx / (solid + LEAN)) ** 1.6;
            ctx.beginPath();
            ctx.arc(xx, yy, r, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.restore();

    // Optically centred: cap height sits in the middle of the band.
    ctx.fillStyle = '#111';
    ctx.fillText(title, SAFE, y + h / 2 + size * 0.34);
}

/** The handle, as the banner's dark twin coming in from the bottom right. */
function watermark(ctx) {
    const h = 84, y = H - 178;
    ctx.font = FONT(52);
    const t = '@EmSheshan';
    const tw = ctx.measureText(t).width;
    const left = W - SAFE - tw - 40;
    const edgeAt = (yy) => left + LEAN * 0.68 * (1 - (yy - y) / h) - LEAN * 0.68;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = 'rgba(10,10,18,0.94)';
    ctx.beginPath();
    ctx.moveTo(edgeAt(y), y); ctx.lineTo(W, y); ctx.lineTo(W, y + h); ctx.lineTo(edgeAt(y + h), y + h);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = GOLD;
    ctx.fillText(t, W - SAFE - tw, y + h / 2 + 52 * 0.34);
}

/** Page marker: one diamond per slide, this one filled -- tells people to swipe. */
function pager(ctx, index, count) {
    const r = 10, gap = 30, y = 74;
    let x = W - SAFE - r - (count - 1) * gap;
    for (let i = 0; i < count; i++, x += gap) {
        if (i === index) {
            diamond(ctx, x, y, r + 2, GOLD);
        } else {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y);
            ctx.closePath();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = 'rgba(255,255,255,0.8)';
            ctx.stroke();
            ctx.restore();
        }
    }
}

/** Everything drawn over the slide content: frame, banner, tag, page marker. */
function chrome(ctx, title, sl) {
    border(ctx);
    banner(ctx, title);
    watermark(ctx);
    if (sl.count > 1) pager(ctx, sl.index, sl.count);
}

// ---------------------------------------------------------------- helpers

function abilityText(name) {
    const a = abilities[name];
    return typeof a === 'string' ? a : a?.description ?? '';
}

function fitText(ctx, text, maxW, size, min = 20) {
    ctx.font = FONT(size);
    while (ctx.measureText(text).width > maxW && size > min) ctx.font = FONT(size -= 2);
    return size;
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

/**
 * A liquid-glass panel, in the clear modern style rather than glossy Aero:
 * the slide behind is frosted, the edges refract it like a lens, the tint is
 * only as dark as the backdrop needs for white text, and a hairline rim
 * catches light at two opposite corners. No sheen gradient.
 */
function panel(ctx, x, y, w, h, r = 26) {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    const path = (inset = 0) => {
        ctx.beginPath();
        ctx.roundRect(x + inset, y + inset, w - inset * 2, h - inset * 2, Math.max(2, r - inset));
    };

    const pad = 40;
    const sx = Math.max(0, x - pad), sy = Math.max(0, y - pad);
    const sw = Math.min(W - sx, w + pad * 2), sh = Math.min(H - sy, h + pad * 2);
    const under = createCanvas(sw, sh);
    under.getContext('2d').drawImage(ctx.canvas, sx, sy, sw, sh, 0, 0, sw, sh);
    const frost = blurred(under, sw, sh, 12);

    // How bright is what we're sitting on? Tint just enough for white text.
    const px = frost.getContext('2d').getImageData(0, 0, sw, sh).data;
    let lum = 0;
    for (let i = 0; i < px.length; i += 64) lum += (0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]) / 255;
    lum /= px.length / 64;
    const tint = Math.min(0.62, Math.max(0.16, (lum - 0.28) / Math.max(lum, 0.01) + 0.12));

    ctx.save();                                           // soft contact shadow
    ctx.shadowColor = 'rgba(0,0,0,0.22)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 6;
    path();
    ctx.fillStyle = 'rgba(0,0,0,0.01)';
    ctx.fill();
    ctx.restore();

    ctx.save();
    path();
    ctx.clip();
    ctx.drawImage(frost, sx, sy);
    // Lens: the rim band shows the backdrop magnified, so it bends at the edge.
    const band = 16, zoom = 1.1;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.roundRect(x + band, y + band, w - band * 2, h - band * 2, Math.max(2, r - band));
    ctx.clip('evenodd');
    const cx = x + w / 2, cy = y + h / 2;
    ctx.translate(cx, cy);
    ctx.scale(zoom, zoom);
    ctx.translate(-cx, -cy);
    ctx.drawImage(frost, sx, sy);
    ctx.restore();
    ctx.fillStyle = `rgba(12,14,26,${tint.toFixed(3)})`;
    ctx.fillRect(x, y, w, h);
    ctx.restore();

    // Faint inner light along the edge, then the hairline rim.
    ctx.save();
    path(3);
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.stroke();
    path();
    const spec = ctx.createLinearGradient(x, y, x + w, y + h);
    spec.addColorStop(0, 'rgba(255,255,255,0.42)');
    spec.addColorStop(0.2, 'rgba(255,255,255,0.10)');
    spec.addColorStop(0.5, 'rgba(255,255,255,0.05)');
    spec.addColorStop(0.8, 'rgba(255,255,255,0.10)');
    spec.addColorStop(1, 'rgba(255,255,255,0.32)');
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = spec;
    ctx.stroke();
    ctx.restore();

}

/**
 * The art, outlined to suit the background: a soft light halo on a photo (as
 * in the hand-made environment cards), the gold offset shadow on a gradient.
 */
function drawArt(ctx, slide, img, x, y, s, { glow = true } = {}) {
    if (slide.photo && !glow) {
        // no glow: just the art
    } else if (slide.photo) {
        // A soft light-yellow glow behind the art, added (additive blend) and
        // split into red / green / blue that sit slightly apart, so its edge
        // fringes like a lens.
        const k = Math.max(0.3, s / 1100);
        const glow = blurred(silhouette(img, x, y, s, '#ffffff', 22 * k), W, H, s > 600 ? 64 : 32);
        const shift = Math.max(3, Math.round(9 * k));
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (const [color, dx] of [['rgb(255,0,0)', -shift], ['rgb(0,236,0)', 0], ['rgb(0,0,150)', shift]]) {
            const ch = createCanvas(W, H), c = ch.getContext('2d');
            c.drawImage(glow, 0, 0);
            c.globalCompositeOperation = 'source-in';
            c.fillStyle = color;
            c.fillRect(0, 0, W, H);
            ctx.globalAlpha = 0.45;
            ctx.drawImage(ch, dx, 0);
        }
        ctx.restore();
    } else {
        const off = Math.max(6, Math.round(12 * s / 1100));
        ctx.drawImage(silhouette(img, x + off, y + off, s, GOLD), 0, 0);
    }
    ctx.drawImage(img, x, y, s, s);
}

function label(ctx, text, x, y, size = 34) {
    const d = Math.max(5, size * 0.2);
    diamond(ctx, x + d, y - size * 0.34, d, GOLD);
    ctx.font = FONT(size);
    ctx.fillStyle = GOLD;
    ctx.fillText(text.toUpperCase(), x + d * 2 + 10, y);
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

/** Regional dex number: Springbun (#2000 internally) is #001. */
const dexNo = (num) => `#${String(num >= 2000 ? num - 1999 : num).padStart(3, '0')}`;

function slideHero(ctx, sl) {
    const { mon, art } = sl.cur ?? sl;
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

const isNewAbility = (name) => abilities[name]?.tag === 'lacadia';

/**
 * Abilities panel: everyone knows the official abilities, so those are just
 * named; Lacadia's own get a NEW tag and their effect spelled out.
 * Draws at y (or only measures, with draw=false) and returns the height used.
 */
function abilityPanel(ctx, names, y, draw = true) {
    const x = 70, w = W - 140, ix = 108, iw = w - 76;
    const official = names.filter((a) => !isNewAbility(a));
    const fresh = names.filter(isNewAbility);
    let h = 32 + 44;                                  // padding + heading
    const blocks = fresh.map((a) => {
        ctx.font = FONT(34);
        const lines = wrap(ctx, abilityText(a), iw);
        return { a, lines, h: 58 + lines.length * 42 };
    });
    for (const bl of blocks) h += bl.h;
    if (official.length) h += 60;
    h += 18;
    if (!draw) return h;

    panel(ctx, x, y, w, h);
    label(ctx, names.length > 1 ? 'Abilities' : 'Ability', ix, y + 62, 32);
    let cy = y + 76;
    for (const bl of blocks) {
        ctx.font = FONT(48);
        ctx.fillStyle = PAPER;
        ctx.fillText(bl.a, ix, cy + 44);
        const tw = ctx.measureText(bl.a).width;
        ctx.beginPath();
        ctx.roundRect(ix + tw + 18, cy + 10, 78, 38, 19);
        ctx.fillStyle = GOLD;
        ctx.fill();
        ctx.font = FONT(28);
        ctx.fillStyle = '#111';
        ctx.fillText('NEW', ix + tw + 30, cy + 39);
        ctx.font = FONT(34);
        ctx.fillStyle = MUTED;
        bl.lines.forEach((l, i) => ctx.fillText(l, ix, cy + 58 + 34 + i * 42));
        cy += bl.h;
    }
    if (official.length) {
        // Names separated by small diamonds; measure with spaces standing in.
        const size = fitText(ctx, official.join('     '), iw, 44);
        ctx.fillStyle = PAPER;
        let ax = ix;
        official.forEach((a, i) => {
            if (i) {
                diamond(ctx, ax + size * 0.38, cy + 46 - size * 0.32, size * 0.14, GOLD);
                ax += size * 0.76;
            }
            ctx.fillStyle = PAPER;
            ctx.fillText(a, ax, cy + 46);
            ax += ctx.measureText(a).width;
        });
        ctx.fillStyle = PAPER;

    }
    return h;
}

function slideDex(ctx, sl) {
    const { mon, art, shiny } = sl;
    // The shiny gets its showing here rather than on a slide of its own.
    const s = 470;
    drawArt(ctx, sl, shiny ?? art, 60, 225, s);
    if (shiny) {
        ctx.font = FONT(36);
        const t = '★ Shiny';
        const tw = ctx.measureText(t).width;
        panel(ctx, 60 + s / 2 - tw / 2 - 26, 225 + s - 10, tw + 52, 54, 27);
        ctx.fillStyle = GOLD;
        ctx.fillText(t, 60 + s / 2 - tw / 2, 225 + s + 28);
    }

    const px = 580, pw = W - px - 70, py = 245, ph = 380;
    panel(ctx, px, py, pw, ph);
    const ix = px + 34;
    ctx.font = FONT(64);
    ctx.fillStyle = GOLD;
    ctx.fillText(dexNo(mon.num), ix, py + 76);
    fitText(ctx, `The ${mon.kind} Pokémon`, pw - 68, 42);
    ctx.fillStyle = PAPER;
    ctx.fillText(`The ${mon.kind} Pokémon`, ix, py + 134);
    typePills(ctx, mon.types, ix, py + 158, Math.min(220, (pw - 84) / 2));

    label(ctx, 'Height', ix, py + 270);
    label(ctx, 'Weight', ix + 250, py + 270);
    ctx.font = FONT(56);
    ctx.fillStyle = PAPER;
    ctx.fillText(`${mon.heightm} m`, ix, py + 334);
    ctx.fillText(`${mon.weightkg} kg`, ix + 250, py + 334);

    const ay = 745;
    const ah = abilityPanel(ctx, Object.values(mon.abilities ?? {}), ay);

    const fy = ay + ah + 22, fh = H - 200 - fy;
    panel(ctx, 70, fy, W - 140, fh);
    textBox(ctx, (mon.description ?? []).join('\n\n'), 106, fy + 20, W - 212, fh - 40,
        { max: 44, min: 24, lead: 1.26, center: true });

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
    // Forms sharing one stat block can differ in type, so don't claim one.
    if (!(sl.forms?.length > 1)) typePills(ctx, mon.types, 474, 482, 200);

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

// ---------------------------------------------------------------- forms
//
// A species with alternate forms (Sacrabell, Tortarma, Yakoyza) is posted as
// ONE carousel, so its shared text appears once and its forms sit side by side.

const formName = (mon) => String(mon.name).split('-').slice(1).join('-') || mon.name;


function slideDexForms(ctx, sl) {
    const { forms, mon } = sl;
    const n = forms.length;

    ctx.font = FONT(60);
    ctx.fillStyle = GOLD;
    ctx.fillText(dexNo(mon.num), 80, 285);
    const nw = ctx.measureText(dexNo(mon.num)).width;
    ctx.font = FONT(44);
    ctx.fillStyle = PAPER;
    ctx.fillText(`The ${mon.kind} Pok\u00e9mon`, 80 + nw + 26, 285);
    if (forms.some((f) => f.shiny)) {
        ctx.font = FONT(34);
        ctx.fillStyle = GOLD;
        const t = '\u2605 Shiny';
        ctx.fillText(t, W - 80 - ctx.measureText(t).width, 285);
    }

    // One info cell per form: wide rows for two forms, a 2x2 grid for four.
    const fy = n > 2 ? 1040 : 1000;
    const top = 315, gap = 20, cols = n > 2 ? 2 : 1, rows = Math.ceil(n / cols);
    const cw = (W - 140 - gap * (cols - 1)) / cols;
    const ch = (fy - 20 - top - gap * (rows - 1)) / rows;

    forms.forEach((f, i) => {
        const cx = 70 + (i % cols) * (cw + gap), cy = top + Math.floor(i / cols) * (ch + gap);
        panel(ctx, cx, cy, cw, ch);
        const ab = Object.values(f.mon.abilities ?? {}).join(' / ');
        if (cols === 1) {
            const s = ch - 30;
            drawArt(ctx, { ...sl, mon: f.mon }, f.shiny ?? f.art, cx + 20, cy + 15, s);
            const ix = cx + s + 50, iw = cw - s - 80;
            fitText(ctx, formName(f.mon) + ' Form', iw, 54);
            ctx.fillStyle = GOLD;
            ctx.fillText(formName(f.mon) + ' Form', ix, cy + 72);
            typePills(ctx, f.mon.types, ix, cy + 96, 190);
            ctx.font = FONT(42);
            ctx.fillStyle = PAPER;
            ctx.fillText(`${f.mon.heightm} m   \u00b7   ${f.mon.weightkg} kg`, ix, cy + 196);
            label(ctx, 'Ability', ix, cy + 252, 28);
            fitText(ctx, ab, iw, 40);
            ctx.fillStyle = PAPER;
            ctx.fillText(ab, ix, cy + 296);
        } else {
            const s = Math.min(ch - 20, cw * 0.5);
            drawArt(ctx, { ...sl, mon: f.mon }, f.shiny ?? f.art, cx + 8, cy + (ch - s) / 2, s);
            const ix = cx + s + 22, iw = cw - s - 44;
            fitText(ctx, formName(f.mon), iw, 50);
            ctx.fillStyle = GOLD;
            ctx.fillText(formName(f.mon), ix, cy + 70);
            f.mon.types.forEach((t, ti) => typePills(ctx, [t], ix, cy + 92 + ti * 48, Math.min(iw, 200)));
            const hy = cy + 92 + f.mon.types.length * 48 + 44;
            fitText(ctx, `${f.mon.heightm} m \u00b7 ${f.mon.weightkg} kg`, iw, 36);
            ctx.fillStyle = PAPER;
            ctx.fillText(`${f.mon.heightm} m \u00b7 ${f.mon.weightkg} kg`, ix, hy);
        }
    });

    let ty = fy;
    const fresh = [...new Set(forms.flatMap((f) => Object.values(f.mon.abilities ?? {})))]
        .filter((a) => isNewAbility(a) && a !== sl.trigger?.name);
    if (fresh.length) ty += abilityPanel(ctx, fresh, fy) + 20;

    const fh = H - 200 - ty;
    panel(ctx, 70, ty, W - 140, fh);
    textBox(ctx, (mon.description ?? []).join('\n\n'), 106, ty + 20, W - 212, fh - 40,
        { max: 40, min: 22, lead: 1.25, center: true });

    chrome(ctx, sl.base, sl);
}

function slideStatsForms(ctx, sl) {
    // One block per form: its art, name and total, then its own six bars.
    const { forms } = sl;
    const n = forms.length, cols = n > 2 ? 2 : 1, rows = Math.ceil(n / cols), gap = 22;
    const top = 225, bottom = H - 190;
    const bw = (W - 140 - gap * (cols - 1)) / cols, bh = (bottom - top - gap * (rows - 1)) / rows;

    forms.forEach((f, i) => {
        const x = 70 + (i % cols) * (bw + gap), y = top + Math.floor(i / cols) * (bh + gap);
        panel(ctx, x, y, bw, bh);
        const head = Math.min(170, bh * 0.32), art = head - 20;
        drawArt(ctx, { ...sl, mon: f.mon }, f.art, x + 18, y + 12, art);
        const tx = x + art + 40;
        ctx.font = FONT(52);
        ctx.fillStyle = GOLD;
        ctx.fillText(`${formName(f.mon)} Form`, tx, y + head * 0.45);
        typePills(ctx, f.mon.types, tx, y + head * 0.55, 170);
        const bst = STATS.reduce((t, [k]) => t + f.mon.baseStats[k], 0);
        ctx.font = FONT(110);
        const bx = x + bw - 34 - ctx.measureText(String(bst)).width;
        ctx.fillStyle = PAPER;
        ctx.fillText(String(bst), bx, y + head * 0.7);
        label(ctx, 'Total', bx, y + head * 0.7 + 38, 26);

        const ry = y + head + 14, rowH = (bh - head - 30) / 6;
        const lx = x + 36, barX = x + Math.min(240, bw * 0.34), valW = 90;
        const barW = x + bw - 36 - valW - barX, barH = Math.min(30, rowH * 0.5);
        const fs = Math.min(40, rowH * 0.66);
        STATS.forEach(([k, name], si) => {
            const v = f.mon.baseStats[k], mid = ry + si * rowH + rowH / 2;
            ctx.font = FONT(fs);
            ctx.fillStyle = PAPER;
            ctx.fillText(name, lx, mid + fs * 0.36);
            ctx.beginPath();
            ctx.roundRect(barX, mid - barH / 2, barW, barH, barH / 2);
            ctx.fillStyle = 'rgba(255,255,255,0.10)';
            ctx.fill();
            ctx.beginPath();
            ctx.roundRect(barX, mid - barH / 2, Math.max(barH, barW * Math.min(v, 200) / 200), barH, barH / 2);
            ctx.fillStyle = STAT_COLORS[k];
            ctx.fill();
            ctx.font = FONT(fs + 4);
            ctx.fillStyle = PAPER;
            ctx.fillText(String(v), barX + barW + 22, mid + (fs + 4) * 0.36);
        });
    });

    chrome(ctx, 'Base Stats', sl);
}

/** Abilities whose text says they change the Pokemon's form. */
function formTrigger(forms) {
    for (const f of forms) {
        for (const a of Object.values(f.mon.abilities ?? {})) {
            if (/\bform\b/i.test(abilityText(a))) return { name: a, text: abilityText(a) };
        }
    }
    return null;
}

const sameStats = (forms) => forms.every((f) =>
    STATS.every(([k]) => f.mon.baseStats[k] === forms[0].mon.baseStats[k]));

function slideForms(ctx, sl) {
    const { forms } = sl;
    const s = 520, y = 260;
    const xs = [40, W - s - 40];
    forms.slice(0, 2).forEach((f, i) => {
        drawArt(ctx, { ...sl, mon: f.mon }, f.art, xs[i], y, s);
        const t = formName(f.mon) + ' Form';
        ctx.font = FONT(56);
        ctx.fillStyle = GOLD;
        ctx.fillText(t, xs[i] + s / 2 - ctx.measureText(t).width / 2, y + s + 64);
        typePills(ctx, f.mon.types, xs[i] + s / 2 - 100, y + s + 90, 200);
    });
    chevron(ctx, W / 2, y + s / 2);

    const tr = sl.trigger;
    const py = 1000, ph = H - 200 - py;
    panel(ctx, 70, py, W - 140, ph);
    label(ctx, tr.name, 108, py + 58, 40);
    textBox(ctx, tr.text, 108, py + 76, W - 216, ph - 96, { max: 42, min: 26 });

    chrome(ctx, 'Forms', sl);
}

// ---------------------------------------------------------------- evolution

// pokedex.js only records forward evolutions by display name, so the line is
// rebuilt by walking `evos`. A name with no exact entry (Nokoi -> "Yakoyza")
// stands for every form of that species.
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
const keyByName = Object.fromEntries(Object.entries(pokedex).map(([k, v]) => [norm(v.name), k]));
const CACHE = path.join(os.tmpdir(), 'lacadia-carousel-art');
/** Full-size PNG from pokemonArt/, else the site's WebP converted to PNG (canvas can't read WebP). */
function artFile(k) {
    const png = path.join(ART, `${k}.png`);
    if (fs.existsSync(png)) return png;
    const webp = SITE && path.join(SITE, 'pokemonArt', `${k}.webp`);
    if (!webp || !fs.existsSync(webp)) return null;
    const out = path.join(CACHE, `${k}.png`);
    if (!fs.existsSync(out)) {
        fs.mkdirSync(CACHE, { recursive: true });
        spawnSync('python3', ['-I', '-c', 'import sys;from PIL import Image;Image.open(sys.argv[1]).save(sys.argv[2])', webp, out]);
    }
    return fs.existsSync(out) ? out : null;
}
const hasArt = (k) => !!artFile(k);

function resolve(name) {
    const exact = keyByName[norm(name)];
    if (exact) return [exact];
    return Object.entries(pokedex)
        .filter(([, v]) => norm(String(v.name).split('-')[0]) === norm(name))
        .map(([k]) => k);
}

const evosOf = (key) => pokedex[key]?.evo
    ? pokedex[key].evo.filter((k) => pokedex[k])          // site data: ids
    : (pokedex[key]?.evos ?? []).flatMap(resolve);
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
        const cellW = colW / cols;
        const size = Math.min(cellW - 10, (bottom - top) / rows - nameH - 20, 440);
        // Every stage shares one centre line (the arrows sit on it); a branch's
        // rows are spaced evenly above and below it.
        const axis = (top + bottom) / 2 - nameH / 2, pitch = size + nameH + 20;

        members.forEach((k, mi) => {
            const c = mi % cols, r = Math.floor(mi / cols);
            const x0 = cx - colW / 2 + c * cellW + (cellW - size) / 2;
            const y0 = axis + (r - (rows - 1) / 2) * pitch - size / 2;
            const img = sl.evoArt[k];
            const isMe = sl.keys.includes(k);

            drawArt(ctx, sl, img, x0, y0, size, { glow: isMe });

            const nm = pokedex[k].name;
            let fsz = Math.min(48, Math.max(26, size / 6));
            ctx.font = FONT(fsz);
            while (ctx.measureText(nm).width > cellW - 10 && fsz > 22) ctx.font = FONT(fsz -= 2);
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.65)';           // readable on pale scenes
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 2;
            ctx.fillStyle = isMe ? GOLD : PAPER;
            ctx.fillText(nm, x0 + size / 2 - ctx.measureText(nm).width / 2, y0 + size + fsz + 8);
            ctx.restore();
        });

        // Line the arrow up with the art, not the art+name block.
        if (si < stages.length - 1) chevron(ctx, cx + colW / 2 + arrowW / 2, (top + bottom) / 2 - nameH / 2);
    });

    chrome(ctx, 'Evolution', sl);
}

// ---------------------------------------------------------------- main

async function render(sl, draw) {
    const c = createCanvas(W, H);
    const ctx = c.getContext('2d');
    const bgMon = sl.cur?.mon ?? sl.mon;     // a form's own slide takes its own tint
    const id = bgMon.types.join('/');
    if (!sl.bg.has(id)) {
        const b = createCanvas(W, H);
        if (sl.photo) photoBackground(b.getContext('2d'), sl.photo, bgMon);
        else gradientBackground(b.getContext('2d'), bgMon);
        sl.bg.set(id, b);
    }
    ctx.drawImage(sl.bg.get(id), 0, 0);
    draw(ctx, sl);
    const out = createCanvas(EW, EH);
    out.getContext('2d').drawImage(c, 0, 0, EW, EH);
    return out.toBuffer('image/jpeg', { quality: QUALITY });
}

// Group every pokedex entry with art by species: forms share the name before
// the hyphen ("Sacrabell-Hymn" -> "Sacrabell"), as in social/caption.mjs.
const baseOf = (key) => String(pokedex[key].name).split('-')[0];
const species = new Map();
for (const k of Object.keys(pokedex).filter((k) => !pokedex[k].isExternal && hasArt(k))) {
    const b = baseOf(k);
    if (!species.has(b)) species.set(b, []);
    species.get(b).push(k);
}
const outKey = (members) => (members.length > 1 ? norm(baseOf(members[0])) : members[0]);

// Accept a pokedex key, a form's key, or a species name ("sacrabell").
const wanted = process.argv.slice(2).map((s) => s.toLowerCase());
const groups = wanted.length
    ? [...new Set(wanted.map((w) => [...species.values()].find((m) => m.includes(w) || outKey(m) === w))
        .filter((m, i) => m || console.warn(`skip ${wanted[i]}: no art or pokedex entry`)))]
    : [...species.values()];

// node-canvas frees its pixel buffers lazily, so one process rendering every
// card runs out of memory. A full run hands out small batches to child processes.
if (!wanted.length) {
    const { spawnSync } = await import('node:child_process');
    const BATCH = 5;
    for (let i = 0; i < groups.length; i += BATCH) {
        const r = spawnSync(process.execPath,
            [process.argv[1], ...groups.slice(i, i + BATCH).map((m) => m[0])], { stdio: 'inherit' });
        if (r.status !== 0) process.exit(r.status ?? 1);
    }
    process.exit(0);
}

fs.mkdirSync(OUT, { recursive: true });

for (const members of groups) {
    const forms = [];
    for (const key of members) {
        const shinyPath = path.join(ART, `${key}_shiny.png`);
        forms.push({
            key,
            mon: pokedex[key],
            art: await loadImage(artFile(key)),
            shiny: fs.existsSync(shinyPath) ? await loadImage(shinyPath) : null,
        });
    }
    const name = outKey(members);
    const envPath = envPathFor(name) ?? members.map(envPathFor).find(Boolean);
    const scene = envPath ? null : (mappedScene([name, ...members]) ?? pickHabitat(forms[0].mon));
    let photo = envPath ? await loadImage(envPath) : null;
    if (scene && scene !== 'gradient') {
        // Painted small; photoBackground scales and blurs it like a photo.
        photo = paintHabitat(scene, name);
    }
    const sl = {
        forms,
        keys: members,
        base: baseOf(members[0]),
        mon: forms[0].mon,
        art: forms[0].art,
        shiny: forms[0].shiny,
        photo,
        bg: new Map(),
        trigger: formTrigger(forms),
    };

    sl.evo = evoLine(members[0]);
    // A species with forms shows all of them at its stage (Tortarma Solar and Polar).
    if (members.length > 1) sl.evo = sl.evo.map((st) => (st.includes(members[0]) ? members.filter(hasArt) : st));
    const evolves = sl.evo.flat().filter((k) => !members.includes(k)).length > 0;
    if (evolves) {
        sl.evoArt = {};
        for (const k of sl.evo.flat()) sl.evoArt[k] = await loadImage(artFile(k));
    }

    // [draw, form it is about] -- hero slides are one per form.
    const multi = forms.length > 1;
    const slides = [
        ...forms.map((f) => [slideHero, f]),
        ...(multi ? [[slideDexForms]] : [[slideDex]]),
        // Forms with identical stats (Yakoyza) need no comparison.
        [multi && !sameStats(forms) ? slideStatsForms : slideStats],
        ...(multi && sl.trigger ? [[slideForms]] : []),
        ...(evolves ? [[slideEvo]] : []),
    ];
    for (const old of fs.readdirSync(OUT).filter((f) => f.startsWith(`${name}-`))) {
        fs.rmSync(path.join(OUT, old));
    }
    for (const [i, [draw, cur]] of slides.entries()) {
        sl.cur = cur ?? null;
        sl.isLast = i === slides.length - 1;
        sl.index = i;
        sl.count = slides.length;
        fs.writeFileSync(path.join(OUT, `${name}-${i + 1}.jpg`), await render(sl, draw));
    }
    console.log(`${name}: ${slides.length} slides${multi ? ` (${forms.length} forms)` : ''}${envPath ? ` [photo ${path.basename(envPath)}]` : ` [${scene}]`}`);
}
