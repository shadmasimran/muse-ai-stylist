// Pure styling logic: color science, K-Means, outfit scoring, makeup/jewelry matching.
export const TONES = [['Fair', '#F6D5C0'], ['Light', '#EBBF9F'], ['Medium', '#D9A57C'], ['Tan', '#BE8A5F'], ['Deep', '#8D5A3B'], ['Rich', '#5C3A26']];
export const UNDERTONES = [['warm', 'Warm', 'Golden or peachy; veins look greenish; gold jewelry suits you.'], ['cool', 'Cool', 'Pink or rosy; veins look bluish; silver jewelry suits you.'], ['neutral', 'Neutral', 'A mix of both; most shades and metals work.']];
export const OCCASIONS = [['Casual', 1], ['College', 1.4], ['Office', 2], ['Party', 2.6], ['Wedding', 3]];
export const WEATHER = { Hot: 1, Mild: 1.6, Cool: 2.4, Rainy: 2.2 };

const HUE = { warm: [0, 60], cool: [200, 340], neutral: [0, 360] };
export const REC = {
  warm: { lip: ['l-coral', 'l-coral', 'l-red'], blush: 'bl-peach', eyes: 'e-bronze', metal: 'Gold' },
  cool: { lip: ['l-rose', 'l-berry', 'l-berry'], blush: 'bl-pink', eyes: 'e-plum', metal: 'Silver' },
  neutral: { lip: ['l-rose', 'l-rose', 'l-red'], blush: 'bl-rose', eyes: 'e-neutral', metal: 'Rose gold' },
};
// Jewelry by metal, indexed by occasion order [Casual, College, Office, Party, Wedding]
const JEWEL = {
  Gold: ['j-gold-hoops', 'j-gold-hoops', 'j-pearl', 'j-gold-statement', 'j-gold-statement'],
  Silver: ['j-silver-pendant', 'j-silver-pendant', 'j-pearl', 'j-silver-statement', 'j-silver-statement'],
  'Rose gold': ['j-rose-bracelet', 'j-rose-bracelet', 'j-pearl', 'j-gold-statement', 'j-gold-statement'],
};

export function toHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  let s = 0, h = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
  }
  return [h, s, l];
}
const neutral = ([, s, l]) => s < 0.15 || l > 0.85 || l < 0.18;

export function harmony(a, b) {
  const A = toHsl(a), B = toHsl(b);
  if (neutral(A) || neutral(B)) return [0.88, 'a neutral base lets the color stand out'];
  let d = Math.abs(A[0] - B[0]); if (d > 180) d = 360 - d;
  if (d < 35) return [0.92, 'an analogous, tonal pairing'];
  if (d > 150) return [0.86, 'a complementary, high-contrast pairing'];
  if (d > 95) return [0.7, 'a playful triadic pairing'];
  return [0.55, 'hues that compete slightly'];
}

export function scoreLook(parts, { occasion, weather, undertone }) {
  const shoe = parts.find((p) => p.cat === 'Shoes');
  const body = parts.filter((p) => p.cat !== 'Shoes');
  const hs = []; let note = '';
  if (body.length > 1) { const h = harmony(body[0].color, body[1].color); hs.push(h[0]); note = h[1]; }
  if (shoe) { const h = harmony(body[0].color, shoe.color); hs.push(h[0]); if (!note) note = h[1]; }
  const hv = hs.length ? hs.reduce((a, b) => a + b) / hs.length : 0.8;
  const f = parts.reduce((a, p) => a + p.f, 0) / parts.length;
  const w = parts.reduce((a, p) => a + p.w, 0) / parts.length;
  const of = Math.max(0, 1 - Math.abs(f - occasion) / 2);
  const wf = Math.max(0, 1 - Math.abs(w - weather) / 2);
  const hu = toHsl(body[0].color), r = HUE[undertone];
  const tb = hu[1] < 0.15 || (hu[0] >= r[0] && hu[0] <= r[1]) ? 1 : 0.6;
  return {
    pct: Math.round((0.4 * hv + 0.3 * of + 0.2 * wf + 0.1 * tb) * 100),
    note: `${note}; ${of > 0.75 ? 'right formality' : 'a little off in formality'} and ${wf > 0.7 ? 'comfortable' : 'less ideal'} for the weather`,
  };
}

export function buildLooks(closet, ctx, limit = 3) {
  const by = (c) => closet.filter((i) => i.cat === c);
  const base = [];
  by('Top').forEach((t) => by('Bottom').forEach((b) => base.push([t, b])));
  by('Dress').forEach((d) => base.push([d]));
  const shoes = by('Shoes');
  return base
    .map((c) => {
      let best = null;
      (shoes.length ? shoes : [null]).forEach((s) => {
        const parts = s ? [...c, s] : c, sc = scoreLook(parts, ctx);
        if (!best || sc.pct > best.pct) best = { parts, ...sc };
      });
      return best;
    })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, limit);
}

export function finishLook(look, { occasionIndex, undertone }, byId) {
  const rec = REC[undertone];
  const bold = occasionIndex >= 3 ? 2 : occasionIndex === 2 ? 1 : 0;
  return {
    lipstick: byId[rec.lip[bold]], blush: byId[rec.blush], eyes: byId[rec.eyes],
    jewelry: byId[JEWEL[rec.metal][occasionIndex]], metal: rec.metal,
  };
}

// K-Means on [r,g,b] pixels; returns the hex of the largest cluster.
export function dominantColor(pixels, k = 3, iters = 8) {
  const n = pixels.length;
  let c = Array.from({ length: k }, (_, i) => pixels[Math.floor((i * n) / k)].slice());
  let groups = [];
  for (let it = 0; it < iters; it++) {
    groups = c.map(() => []);
    for (const p of pixels) {
      let bi = 0, bd = Infinity;
      c.forEach((q, qi) => { const d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2; if (d < bd) { bd = d; bi = qi; } });
      groups[bi].push(p);
    }
    c = c.map((q, qi) => groups[qi].length ? [0, 1, 2].map((z) => groups[qi].reduce((s, p) => s + p[z], 0) / groups[qi].length) : q);
  }
  let big = 0; groups.forEach((g, gi) => { if (g.length > groups[big].length) big = gi; });
  return '#' + c[big].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
}

export const weatherBucket = (tempC, rainMm) => (rainMm > 0.1 ? 'Rainy' : tempC >= 30 ? 'Hot' : tempC >= 22 ? 'Mild' : 'Cool');
