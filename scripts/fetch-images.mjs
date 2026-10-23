// Finds one real, licensed photo per catalog item and wires it into the site.
//
// Option A (recommended): Unsplash  ->  UNSPLASH_ACCESS_KEY in .env   (https://unsplash.com/developers)
//   Follows Unsplash API guidelines: photos are hotlinked from Unsplash's CDN, the photographer is
//   credited, and a download event is reported. URLs are saved to src/data/image-overrides.json.
// Option B: Pexels  ->  PEXELS_API_KEY in .env   (https://www.pexels.com/api/, new keys may be paused)
//   Photos are downloaded to public/products/<id>.jpg.
//
// Run:  npm run images        (add `-- --optional` to skip quietly when no key is set)
import fs from 'node:fs';
import path from 'node:path';
import { CATALOG } from '../src/data/catalog.js';

const env = fs.existsSync('.env')
  ? Object.fromEntries(fs.readFileSync('.env', 'utf8').split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#')).map((l) => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()]))
  : {};
const get = (k) => { const v = process.env[k] || env[k]; return v && !v.startsWith('your_') ? v : ''; };
const UNSPLASH = get('UNSPLASH_ACCESS_KEY');
const PEXELS = get('PEXELS_API_KEY');

if (!UNSPLASH && !PEXELS) {
  if (process.argv.includes('--optional')) { console.log('No photo API key set, skipping (placeholders will be shown).'); process.exit(0); }
  console.error('No key found. Add UNSPLASH_ACCESS_KEY (or PEXELS_API_KEY) to .env. See .env.example');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const readJson = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8') || 'null') ?? d : d);
const overridesFile = path.resolve('src/data/image-overrides.json');
const creditsFile = path.resolve('public/credits.json');
fs.mkdirSync(path.dirname(creditsFile), { recursive: true });
const overrides = readJson(overridesFile, {});
const credits = readJson(creditsFile, {});
let ok = 0, skipped = 0, failed = 0;

if (UNSPLASH) {
  console.log('Using Unsplash (hotlinked photos, photographers credited)...');
  const H = { Authorization: `Client-ID ${UNSPLASH}`, 'Accept-Version': 'v1' };
  for (const item of CATALOG) {
    if (overrides[item.id]) { skipped++; continue; }
    try {
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(item.q)}&per_page=1&orientation=portrait`, { headers: H });
      if (!res.ok) throw new Error(`search ${res.status}`);
      const photo = (await res.json()).results?.[0];
      if (!photo) throw new Error('no result');
      overrides[item.id] = `${photo.urls.raw}&w=900&q=80&fit=crop&auto=format`;
      credits[item.id] = { photographer: photo.user.name, photographer_url: `${photo.user.links.html}?utm_source=muse_by_shadma&utm_medium=referral`, source: `${photo.links.html}?utm_source=muse_by_shadma&utm_medium=referral`, provider: 'Unsplash' };
      fetch(photo.links.download_location, { headers: H }).catch(() => {}); // required download event
      ok++; console.log(`saved  ${item.id}  (${photo.user.name})`);
    } catch (e) { failed++; console.warn(`failed ${item.id}: ${e.message}`); }
    await sleep(400);
  }
  fs.writeFileSync(overridesFile, JSON.stringify(overrides, null, 2) + '\n');
} else {
  console.log('Using Pexels (photos downloaded to public/products)...');
  const dir = path.resolve('public/products');
  fs.mkdirSync(dir, { recursive: true });
  for (const item of CATALOG) {
    const file = path.join(dir, `${item.id}.jpg`);
    if (fs.existsSync(file)) { skipped++; continue; }
    try {
      const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(item.q)}&per_page=1&orientation=portrait`, { headers: { Authorization: PEXELS } });
      if (!res.ok) throw new Error(`search ${res.status}`);
      const photo = (await res.json()).photos?.[0];
      if (!photo) throw new Error('no result');
      const img = await fetch(photo.src.large);
      if (!img.ok) throw new Error(`download ${img.status}`);
      fs.writeFileSync(file, Buffer.from(await img.arrayBuffer()));
      credits[item.id] = { photographer: photo.photographer, photographer_url: photo.photographer_url, source: photo.url, provider: 'Pexels' };
      ok++; console.log(`saved  ${item.id}  (${photo.photographer})`);
    } catch (e) { failed++; console.warn(`failed ${item.id}: ${e.message}`); }
    await sleep(350);
  }
}
fs.writeFileSync(creditsFile, JSON.stringify(credits, null, 2));
console.log(`\nDone. ${ok} added, ${skipped} already present, ${failed} failed.`);
console.log('Tip: not happy with a photo? Edit its `q` in src/data/catalog.js, remove its line from src/data/image-overrides.json (or delete its jpg) and run again.');
