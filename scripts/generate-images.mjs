// Generates one AI product image per catalog item and saves it to public/products/<id>.jpg
// (the exact path the site already looks for, so nothing else needs to change).
//
// Providers (pick with IMAGE_PROVIDER in .env, or --provider=<name>):
//   gemini      GEMINI_API_KEY   free key: https://aistudio.google.com/apikey   (default if the key is set)
//   openai      OPENAI_API_KEY   https://platform.openai.com/api-keys           (paid)
//   pollinations  no key         free, lower quality, can be rate limited       (default if no key is set)
//
// Run:
//   npm run generate                    all missing images
//   npm run generate -- --only=d-wine,s-heels
//   npm run generate -- --force         regenerate everything
//   npm run generate -- --dry           just print the prompts
import fs from 'node:fs';
import path from 'node:path';
import { CATALOG } from '../src/data/catalog.js';

const env = fs.existsSync('.env')
  ? Object.fromEntries(fs.readFileSync('.env', 'utf8').split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#')).map((l) => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()]))
  : {};
const get = (k) => { const v = process.env[k] || env[k]; return v && !v.startsWith('your_') ? v : ''; };
const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const flag = (name) => process.argv.includes(`--${name}`);

const GEMINI = get('GEMINI_API_KEY');
const OPENAI = get('OPENAI_API_KEY');
const provider = arg('provider') || get('IMAGE_PROVIDER') || (GEMINI ? 'gemini' : OPENAI ? 'openai' : 'pollinations');
const only = arg('only')?.split(',');
const GEMINI_MODEL = get('GEMINI_IMAGE_MODEL') || 'gemini-2.5-flash-image';
const OPENAI_MODEL = get('OPENAI_IMAGE_MODEL') || 'gpt-image-1';

// Pinterest "cool girl" look: candid outfit photos, mirror selfies, styled flat-lays, glossy beauty close-ups.
const MOOD = 'Pinterest aesthetic, candid trendy photo shot on iPhone, soft film grain, natural light, muted warm tones, effortless cool-girl style, realistic skin texture, high detail, no text, no watermark, no logo';
const SCENES = [
  'mirror selfie in a bright bedroom, holding phone',
  'standing in a sunlit hallway next to a wooden door',
  'walking on a city street, candid shot, golden hour',
  'sitting on a cafe chair, candid, moody window light',
  'leaning on a vintage car at sunset, film flash',
  'vintage aesthetic room with warm lamp light',
];
const scene = (n) => SCENES[n % SCENES.length];
const ethnic = (i) => (/kurta|saree/i.test(i.name) ? ', Indian ethnic fashion aesthetic, elegant styling' : '');
const flatlay = (i) => `styled flat lay of a ${i.name} on a neutral bedsheet with accessories (earrings, sunglasses, a small bag), top-down view, Pinterest outfit inspiration`;
const SUBJECT = {
  Top: (i, n) => (n % 3 === 0 ? flatlay(i) : `outfit of the day photo of a stylish young adult woman wearing a ${i.name} with trendy matching pieces, ${scene(n)}${ethnic(i)}`),
  Bottom: (i, n) => (n % 3 === 0 ? flatlay(i) : `outfit of the day photo of a stylish young adult woman wearing ${i.name} with a fitted top, ${scene(n)}`),
  Dress: (i, n) => `outfit photo of a gorgeous young adult woman wearing a ${i.name}, ${scene(n)}${ethnic(i)}`,
  Shoes: (i, n) => `outfit photo focused on the shoes: a woman wearing ${i.name} with a trendy outfit, ${scene(n)}`,
  Lipstick: (i) => `extreme close-up of glossy lips wearing ${i.name}, dewy glowing skin, soft natural light, Pinterest makeup aesthetic`,
  Blush: (i) => `close-up of a young woman's cheek and eyes with ${i.name}, dewy glowing skin, freckles, soft natural light, Pinterest makeup aesthetic`,
  Eyes: (i) => `close-up of a young woman's eye with ${i.name} shimmer eye makeup, glossy skin, long lashes, Pinterest makeup aesthetic`,
  Jewelry: (i) => `close-up of a woman's ear and neck wearing ${i.name}${i.metal ? `, ${i.metal} finish` : ''}, glowing skin, soft natural light, bokeh background`,
};
const promptFor = (item, n = 0) => `${(SUBJECT[item.cat] || ((i) => i.q))(item, n)}. ${MOOD}.`;

async function viaGemini(prompt) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ['IMAGE'] } }),
  });
  if (!r.ok) throw new Error(`gemini ${r.status} ${(await r.text()).slice(0, 200)}`);
  const parts = (await r.json()).candidates?.[0]?.content?.parts || [];
  const data = parts.find((p) => p.inlineData || p.inline_data);
  const b64 = (data?.inlineData || data?.inline_data)?.data;
  if (!b64) throw new Error('gemini returned no image (prompt may have been blocked)');
  return Buffer.from(b64, 'base64');
}

async function viaOpenAI(prompt) {
  const r = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI}` },
    body: JSON.stringify({ model: OPENAI_MODEL, prompt, size: '1024x1536', n: 1 }),
  });
  if (!r.ok) throw new Error(`openai ${r.status} ${(await r.text()).slice(0, 200)}`);
  const d = (await r.json()).data?.[0];
  if (d?.b64_json) return Buffer.from(d.b64_json, 'base64');
  if (d?.url) return Buffer.from(await (await fetch(d.url)).arrayBuffer());
  throw new Error('openai returned no image');
}

async function viaPollinations(prompt, seed) {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=960&nologo=true&model=flux&seed=${seed}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`pollinations ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

const generate = { gemini: viaGemini, openai: viaOpenAI, pollinations: viaPollinations }[provider];
if (!generate) { console.error(`Unknown provider "${provider}". Use gemini, openai or pollinations.`); process.exit(1); }
if (provider === 'gemini' && !GEMINI) { console.error('Set GEMINI_API_KEY in .env (free: https://aistudio.google.com/apikey)'); process.exit(1); }
if (provider === 'openai' && !OPENAI) { console.error('Set OPENAI_API_KEY in .env'); process.exit(1); }

const dir = path.resolve('public/products');
fs.mkdirSync(dir, { recursive: true });
const items = CATALOG.filter((i) => !only || only.includes(i.id));
console.log(`Provider: ${provider}  |  ${items.length} item(s)\n`);

let ok = 0, skipped = 0, failed = 0;
for (const [n, item] of items.entries()) {
  const file = path.join(dir, `${item.id}.jpg`);
  const prompt = promptFor(item, n);
  if (flag('dry')) { console.log(`${item.id}: ${prompt}\n`); continue; }
  if (fs.existsSync(file) && !flag('force')) { skipped++; continue; }
  let done = false;
  for (let attempt = 1; attempt <= 3 && !done; attempt++) {
    try {
      fs.writeFileSync(file, await generate(prompt, n + attempt * 1000));
      ok++; done = true; console.log(`saved   ${item.id}`);
    } catch (e) {
      console.warn(`retry ${attempt}/3 ${item.id}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 2500 * attempt));
    }
  }
  if (!done) failed++;
  await new Promise((r) => setTimeout(r, provider === 'gemini' ? 1500 : 800));
}
if (!flag('dry')) console.log(`\nDone. ${ok} generated, ${skipped} already present, ${failed} failed.`);
