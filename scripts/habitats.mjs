// Painted habitat backdrops. Each scene is drawn small and simple, then the
// caller blurs it up to card size -- the same "blurred photo of where it lives"
// look as a real environment photo, without needing one per Pokemon.
//
// A scene is (ctx, w, h, rnd) => void, drawn at roughly 240x300.

import { createCanvas } from 'canvas';

// ---------------------------------------------------------------- picking

// Words in a Pokemon's kind or flavour text that point at a habitat. First
// match wins, so the more specific places come first.
const KEYWORDS = [
    ['space', /\b(planet|alien|cosmos|cosmic|outer space|star|stars|meteor|galaxy|moon)\b/i],
    ['volcano', /\b(volcan\w*|magma|lava|molten|eruption)\b/i],
    ['ocean', /\b(ocean|sea|deep|reef|underwater|seafloor|depths)\b/i],
    ['snow', /\b(snow\w*|arctic|glacier|frozen|tundra|blizzard|polar)\b/i],
    ['cave', /\b(cave\w*|underground|tunnel|burrow\w*|mine)\b/i],
    ['desert', /\b(desert|sand|dune\w*)\b/i],
    ['storm', /\b(storm\w*|lightning|thunder\w*)\b/i],
    ['graveyard', /\b(grave\w*|tomb\w*|crypt|cemetery|haunt\w*)\b/i],
    ['swamp', /\b(swamp\w*|marsh\w*|bog|murky)\b/i],
    ['city', /\b(city|cities|town|machine\w*|electronic\w*|factory|scrap)\b/i],
    ['sky', /\b(sky|skies|cloud\w*|soar\w*)\b/i],
    ['forest', /\b(forest\w*|tree\w*|jungle|woods)\b/i],
];

const BY_TYPE = {
    Normal: 'meadow', Fire: 'volcano', Water: 'ocean', Electric: 'city',
    Grass: 'forest', Ice: 'snow', Fighting: 'mountains', Poison: 'swamp',
    Ground: 'desert', Flying: 'sky', Psychic: 'aurora', Bug: 'forest',
    Rock: 'cave', Ghost: 'graveyard', Dragon: 'mountains', Dark: 'night',
    Steel: 'city', Fairy: 'blossom',
};

export function pickHabitat(mon) {
    const text = `${mon.kind ?? ''} ${(mon.description ?? []).join(' ')}`;
    for (const [name, re] of KEYWORDS) if (re.test(text)) return name;
    return BY_TYPE[mon.types?.[0]] ?? 'meadow';
}

// ---------------------------------------------------------------- helpers

export function seeded(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 3432918353), h = (h << 13) | (h >>> 19);
    return () => {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return ((h ^= h >>> 16) >>> 0) / 4294967296;
    };
}

function vgrad(ctx, w, h, stops, y0 = 0, y1 = h) {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    for (const [p, c] of stops) g.addColorStop(p, c);
    ctx.fillStyle = g;
    ctx.fillRect(0, y0, w, y1 - y0);
}

function glow(ctx, x, y, r, color, a = 1) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color.replace('A', a));
    g.addColorStop(1, color.replace('A', 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

/** A ragged horizon from baseY down to the bottom. */
function ridge(ctx, w, h, rnd, baseY, amp, color, jag = 0.5) {
    const p = [rnd() * 6, rnd() * 6, rnd() * 6];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 4) {
        const t = x / w;
        const y = baseY
            - amp * (0.55 * Math.sin(t * 3.1 + p[0]) + 0.3 * Math.sin(t * 7.3 + p[1]) + jag * 0.25 * Math.sin(t * 17 + p[2]))
            - amp * jag * 0.15 * rnd();
        ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.fill();
}

function blobs(ctx, rnd, n, color, x0, y0, x1, y1, r0, r1) {
    ctx.fillStyle = color;
    for (let i = 0; i < n; i++) {
        ctx.beginPath();
        ctx.arc(x0 + rnd() * (x1 - x0), y0 + rnd() * (y1 - y0), r0 + rnd() * (r1 - r0), 0, Math.PI * 2);
        ctx.fill();
    }
}

function trunks(ctx, rnd, w, h, n, color, wMin, wMax, top = 0) {
    ctx.fillStyle = color;
    for (let i = 0; i < n; i++) {
        const x = rnd() * w, tw = wMin + rnd() * (wMax - wMin);
        ctx.fillRect(x, top, tw, h - top);
    }
}

function pines(ctx, rnd, w, baseY, n, color, size) {
    ctx.fillStyle = color;
    for (let i = 0; i < n; i++) {
        const x = rnd() * w, s = size * (0.6 + rnd() * 0.6);
        ctx.beginPath();
        ctx.moveTo(x, baseY - s * 2.2);
        ctx.lineTo(x + s * 0.6, baseY);
        ctx.lineTo(x - s * 0.6, baseY);
        ctx.fill();
    }
}

function rays(ctx, w, h, x, color, n = 4, rnd = Math.random) {
    ctx.fillStyle = color;
    for (let i = 0; i < n; i++) {
        const sx = x + (rnd() - 0.5) * w * 0.4, spread = 10 + rnd() * 20, lean = (rnd() - 0.3) * w * 0.5;
        ctx.beginPath();
        ctx.moveTo(sx, 0); ctx.lineTo(sx + spread, 0);
        ctx.lineTo(sx + lean + spread * 3, h); ctx.lineTo(sx + lean, h);
        ctx.fill();
    }
}

// ---------------------------------------------------------------- scenes

const SCENES = {
    forest(ctx, w, h, r) {
        vgrad(ctx, w, h, [[0, '#d9e8a8'], [0.35, '#6f9a52'], [0.7, '#2c4a2a'], [1, '#18291a']]);
        glow(ctx, w * 0.6, h * 0.12, w * 0.5, 'rgba(255,248,200,A)', 0.9);
        trunks(ctx, r, w, h, 14, 'rgba(120,150,100,0.55)', 3, 7);
        rays(ctx, w, h, w * 0.6, 'rgba(255,250,210,0.14)', 5, r);
        trunks(ctx, r, w, h, 7, 'rgba(40,58,34,0.9)', 9, 20);
        blobs(ctx, r, 16, 'rgba(28,52,26,0.9)', 0, -20, w, h * 0.22, 20, 46);
        ridge(ctx, w, h, r, h * 0.86, 10, '#1b2e19', 0.3);
        blobs(ctx, r, 30, 'rgba(255,245,170,0.55)', 0, h * 0.2, w, h * 0.8, 1, 3);
    },
    mountains(ctx, w, h, r) {
        vgrad(ctx, w, h, [[0, '#4d6f9c'], [0.38, '#c4a7a8'], [0.52, '#e8c8a3'], [1, '#e8c8a3']]);
        blobs(ctx, r, 8, 'rgba(255,240,235,0.45)', 0, h * 0.08, w, h * 0.3, 14, 30);
        ridge(ctx, w, h, r, h * 0.48, 55, '#8d93ad', 0.8);
        ridge(ctx, w, h, r, h * 0.6, 45, '#5f6f84', 0.7);
        ridge(ctx, w, h, r, h * 0.74, 35, '#3f5747', 0.5);
        ridge(ctx, w, h, r, h * 0.88, 25, '#2a3a2c', 0.4);
    },
    ocean(ctx, w, h, r) {
        vgrad(ctx, w, h, [[0, '#8fe0f0'], [0.25, '#2f9bc4'], [0.65, '#14507d'], [1, '#0a2443']]);
        rays(ctx, w, h, w * 0.5, 'rgba(210,250,255,0.13)', 6, r);
        glow(ctx, w * 0.5, -10, w * 0.6, 'rgba(230,255,255,A)', 0.7);
        ridge(ctx, w, h, r, h * 0.86, 22, '#0b2a40', 0.9);
        blobs(ctx, r, 6, 'rgba(14,60,70,0.8)', 0, h * 0.78, w, h, 10, 24);
        blobs(ctx, r, 26, 'rgba(220,250,255,0.5)', 0, h * 0.1, w, h * 0.8, 1, 3.5);
    },
    snow(ctx, w, h, r) {
        vgrad(ctx, w, h, [[0, '#9fb6cf'], [0.45, '#dfe8f0'], [1, '#f4f8fb']]);
        ridge(ctx, w, h, r, h * 0.5, 50, '#c3d0de', 0.8);
        ridge(ctx, w, h, r, h * 0.62, 35, '#e6eef5', 0.5);
        pines(ctx, r, w, h * 0.72, 12, 'rgba(60,86,96,0.75)', 14);
        ridge(ctx, w, h, r, h * 0.82, 20, '#f6f9fc', 0.3);
        blobs(ctx, r, 40, 'rgba(255,255,255,0.8)', 0, 0, w, h, 1, 2.5);
    },
    volcano(ctx, w, h, r) {
        vgrad(ctx, w, h, [[0, '#2a0f14'], [0.45, '#7a2414'], [0.62, '#e0632a'], [1, '#3a0f0c']]);
        glow(ctx, w * 0.5, h * 0.38, w * 0.55, 'rgba(255,140,50,A)', 0.8);
        ctx.fillStyle = '#1d0b0c';
        ctx.beginPath();
        ctx.moveTo(w * 0.05, h); ctx.lineTo(w * 0.42, h * 0.4); ctx.lineTo(w * 0.58, h * 0.4); ctx.lineTo(w * 0.98, h);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,120,30,0.8)';
        ctx.fillRect(w * 0.47, h * 0.4, 6, h * 0.5);
        blobs(ctx, r, 6, 'rgba(40,20,22,0.7)', 0, 0, w, h * 0.3, 20, 40);
        ridge(ctx, w, h, r, h * 0.9, 18, '#120707', 0.6);
        blobs(ctx, r, 30, 'rgba(255,170,60,0.75)', 0, h * 0.1, w, h * 0.9, 0.8, 2.5);
    },
    space(ctx, w, h, r) {
        vgrad(ctx, w, h, [[0, '#0b0820'], [0.5, '#1d1840'], [1, '#090614']]);
        glow(ctx, w * 0.25, h * 0.3, w * 0.55, 'rgba(160,60,200,A)', 0.55);
        glow(ctx, w * 0.8, h * 0.6, w * 0.5, 'rgba(40,110,220,A)', 0.5);
        glow(ctx, w * 0.55, h * 0.45, w * 0.3, 'rgba(255,120,170,A)', 0.35);
        ctx.fillStyle = '#2b2350';
        ctx.beginPath(); ctx.arc(w * 0.85, h * 1.05, w * 0.55, 0, Math.PI * 2); ctx.fill();
        glow(ctx, w * 0.85, h * 1.05, w * 0.62, 'rgba(120,180,255,A)', 0.25);
        blobs(ctx, r, 60, 'rgba(255,255,255,0.85)', 0, 0, w, h, 0.4, 1.4);
    },
    cave(ctx, w, h, r) {
        vgrad(ctx, w, h, [[0, '#1a1418'], [0.5, '#3a2c2a'], [1, '#141012']]);
        glow(ctx, w * 0.5, h * 0.45, w * 0.45, 'rgba(255,210,150,A)', 0.35);
        ctx.fillStyle = '#100c0e';
        for (let i = 0; i < 10; i++) {
            const x = r() * w, s = 8 + r() * 18, l = 30 + r() * 70;
            ctx.beginPath(); ctx.moveTo(x - s, 0); ctx.lineTo(x + s, 0); ctx.lineTo(x, l); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x - s, h); ctx.lineTo(x + s, h); ctx.lineTo(x + 6, h - l * 0.8); ctx.fill();
        }
        for (const c of ['rgba(90,220,255,A)', 'rgba(190,110,255,A)']) {
            for (let i = 0; i < 4; i++) glow(ctx, r() * w, h * (0.5 + r() * 0.45), 12 + r() * 14, c, 0.8);
        }
    },
    desert(ctx, w, h, r) {
        vgrad(ctx, w, h, [[0, '#5a8fc4'], [0.35, '#f3cf9a'], [0.5, '#f7d9a6'], [1, '#c77a3c']]);
        glow(ctx, w * 0.7, h * 0.22, w * 0.4, 'rgba(255,250,220,A)', 0.9);
        ridge(ctx, w, h, r, h * 0.55, 18, '#e4a865', 0.1);
        ridge(ctx, w, h, r, h * 0.7, 26, '#d48b4b', 0.1);
        ridge(ctx, w, h, r, h * 0.86, 20, '#b0632f', 0.1);
    },
    storm(ctx, w, h, r) {
        vgrad(ctx, w, h, [[0, '#1d2230'], [0.5, '#3a4258'], [1, '#161a24']]);
        glow(ctx, w * 0.55, h * 0.35, w * 0.45, 'rgba(255,240,150,A)', 0.6);
        blobs(ctx, r, 20, 'rgba(30,34,48,0.85)', -20, -20, w + 20, h * 0.45, 20, 45);
        ctx.strokeStyle = 'rgba(255,250,200,0.9)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        let x = w * 0.5, y = h * 0.3;
        ctx.moveTo(x, y);
        while (y < h * 0.8) { x += (r() - 0.5) * 30; y += 15 + r() * 15; ctx.lineTo(x, y); }
        ctx.stroke();
        ridge(ctx, w, h, r, h * 0.85, 20, '#0e1118', 0.5);
    },
    sky(ctx, w, h, r) {
        vgrad(ctx, w, h, [[0, '#3f8fe0'], [0.6, '#9fd0f5'], [1, '#e9f5ff']]);
        glow(ctx, w * 0.3, h * 0.2, w * 0.45, 'rgba(255,252,230,A)', 0.9);
        for (let i = 0; i < 5; i++) {
            const cy = h * (0.25 + i * 0.16), cx = r() * w;
            blobs(ctx, r, 7, 'rgba(255,255,255,0.85)', cx - 50, cy - 10, cx + 50, cy + 10, 12, 24);
        }
    },
    swamp(ctx, w, h, r) {
        vgrad(ctx, w, h, [[0, '#6f7f6a'], [0.5, '#3d4d3a'], [0.65, '#2b3a32'], [1, '#1b2622']]);
        trunks(ctx, r, w, h * 0.7, 10, 'rgba(90,100,80,0.6)', 3, 7);
        trunks(ctx, r, w, h * 0.72, 5, 'rgba(32,38,30,0.95)', 10, 18);
        vgrad(ctx, w, h, [[0, '#2f4440'], [1, '#121b18']], h * 0.66, h);
        blobs(ctx, r, 10, 'rgba(180,200,170,0.18)', 0, h * 0.4, w, h * 0.7, 25, 50);
        blobs(ctx, r, 18, 'rgba(200,255,140,0.7)', 0, h * 0.3, w, h * 0.8, 1, 2.5);
    },
    meadow(ctx, w, h, r) {
        vgrad(ctx, w, h, [[0, '#6fb2ea'], [0.45, '#cfe8f7'], [0.5, '#a7d17a'], [1, '#4f8a3a']]);
        blobs(ctx, r, 10, 'rgba(255,255,255,0.8)', 0, h * 0.08, w, h * 0.3, 10, 22);
        ridge(ctx, w, h, r, h * 0.55, 18, '#8cc067', 0.1);
        ridge(ctx, w, h, r, h * 0.7, 22, '#6aa64c', 0.1);
        for (const c of ['rgba(255,255,255,0.8)', 'rgba(255,220,90,0.8)', 'rgba(255,150,190,0.8)']) {
            blobs(ctx, r, 25, c, 0, h * 0.7, w, h, 1, 2.5);
        }
    },
    night(ctx, w, h, r) {
        vgrad(ctx, w, h, [[0, '#0b1024'], [0.6, '#22305a'], [1, '#0a0e18']]);
        glow(ctx, w * 0.72, h * 0.2, w * 0.35, 'rgba(230,235,255,A)', 0.7);
        ctx.fillStyle = '#eef0ff';
        ctx.beginPath(); ctx.arc(w * 0.72, h * 0.2, 14, 0, Math.PI * 2); ctx.fill();
        pines(ctx, r, w, h * 0.8, 18, '#0a0d16', 22);
        ctx.fillStyle = '#0a0d16'; ctx.fillRect(0, h * 0.8, w, h * 0.2);
        blobs(ctx, r, 40, 'rgba(255,255,255,0.7)', 0, 0, w, h * 0.6, 0.4, 1.2);
    },
    graveyard(ctx, w, h, r) {
        vgrad(ctx, w, h, [[0, '#2a1f3d'], [0.55, '#5b4a78'], [1, '#1a1426']]);
        glow(ctx, w * 0.5, h * 0.3, w * 0.4, 'rgba(210,190,255,A)', 0.4);
        ctx.strokeStyle = 'rgba(20,14,30,0.9)';
        ctx.lineWidth = 5;
        for (let i = 0; i < 4; i++) {
            const x = r() * w;
            ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x + (r() - 0.5) * 30, h * 0.35);
            ctx.lineTo(x + (r() - 0.5) * 60, h * 0.2); ctx.stroke();
        }
        ctx.fillStyle = '#18121f';
        for (let i = 0; i < 7; i++) {
            const x = r() * w, s = 10 + r() * 8;
            ctx.beginPath(); ctx.roundRect(x, h * 0.78 - s * 1.6, s, s * 2, [s / 2, s / 2, 0, 0]); ctx.fill();
        }
        ctx.fillRect(0, h * 0.8, w, h * 0.2);
        blobs(ctx, r, 10, 'rgba(200,190,230,0.2)', 0, h * 0.6, w, h * 0.85, 25, 50);
        blobs(ctx, r, 8, 'rgba(150,255,230,0.7)', 0, h * 0.3, w, h * 0.75, 1.5, 3);
    },
    city(ctx, w, h, r) {
        vgrad(ctx, w, h, [[0, '#0d1230'], [0.6, '#3a2a5e'], [1, '#120d22']]);
        glow(ctx, w * 0.5, h * 0.7, w * 0.6, 'rgba(255,90,170,A)', 0.35);
        for (let layer = 0; layer < 2; layer++) {
            ctx.fillStyle = layer ? '#0c0a18' : '#1f1a3a';
            for (let x = -10; x < w; x += 18 + r() * 16) {
                const bw = 14 + r() * 18, bh = h * (0.25 + r() * 0.35) * (layer ? 0.7 : 1);
                ctx.fillRect(x, h - bh, bw, bh);
                if (!layer) for (let k = 0; k < 6; k++) {
                    ctx.fillStyle = r() > 0.5 ? 'rgba(255,220,120,0.8)' : 'rgba(110,220,255,0.8)';
                    ctx.fillRect(x + 2 + r() * (bw - 5), h - bh + 4 + r() * (bh - 8), 2, 2);
                    ctx.fillStyle = '#1f1a3a';
                }
            }
        }
    },
    aurora(ctx, w, h, r) {
        vgrad(ctx, w, h, [[0, '#060b1e'], [0.6, '#122648'], [1, '#0b1426']]);
        for (const [c, y] of [['rgba(90,255,170,A)', 0.25], ['rgba(220,110,255,A)', 0.38], ['rgba(110,200,255,A)', 0.3]]) {
            for (let i = 0; i < 6; i++) glow(ctx, w * (i / 5), h * (y + Math.sin(i + r()) * 0.06), 34, c, 0.45);
        }
        ridge(ctx, w, h, r, h * 0.78, 30, '#0a1322', 0.6);
        blobs(ctx, r, 40, 'rgba(255,255,255,0.7)', 0, 0, w, h * 0.6, 0.4, 1.2);
    },
    blossom(ctx, w, h, r) {
        vgrad(ctx, w, h, [[0, '#f7c6dd'], [0.5, '#fbe3ee'], [1, '#d99bb8']]);
        glow(ctx, w * 0.5, h * 0.2, w * 0.45, 'rgba(255,250,240,A)', 0.8);
        trunks(ctx, r, w, h, 6, 'rgba(110,70,80,0.7)', 5, 10, h * 0.25);
        blobs(ctx, r, 22, 'rgba(255,170,205,0.85)', -20, -10, w + 20, h * 0.35, 16, 32);
        ridge(ctx, w, h, r, h * 0.85, 12, '#b98aa2', 0.2);
        blobs(ctx, r, 40, 'rgba(255,215,232,0.9)', 0, 0, w, h, 1, 2.5);
    },
};

export const HABITATS = Object.keys(SCENES);

/** Paint a habitat small; the caller scales and blurs it up. */
export function paintHabitat(name, seed, w = 240, h = 300) {
    const scene = SCENES[name] ?? SCENES.meadow;
    const c = createCanvas(w, h);
    scene(c.getContext('2d'), w, h, seeded(seed));
    return c;
}
