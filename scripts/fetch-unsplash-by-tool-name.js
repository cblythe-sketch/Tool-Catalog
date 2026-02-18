/**
 * Fetches one photo per tool by searching for the tool name (Pexels or Unsplash),
 * then updates data/tools.json so each card shows a photo of that specific tool.
 *
 * Use either:
 *   Pexels (recommended, 200 req/hour): https://www.pexels.com/api/
 *   Unsplash: https://unsplash.com/developers
 *
 * Run:
 *   PEXELS_API_KEY=your_key node scripts/fetch-unsplash-by-tool-name.js
 *   or
 *   UNSPLASH_ACCESS_KEY=your_key node scripts/fetch-unsplash-by-tool-name.js
 */

const fs = require('fs');
const path = require('path');

// Load .env from project root if it exists (so you can put PEXELS_API_KEY=... there)
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8');
  env.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m) {
      const val = m[2].trim().replace(/\r$/, '').replace(/^["']|["']$/g, '');
      process.env[m[1].trim()] = val;
    }
  });
}

const dataPath = path.join(__dirname, '..', 'data', 'tools.json');
const DELAY_MS = 800; // Pexels 200/hour => ~1 req every 18s; use 800ms to be safe and allow Unsplash

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function getSearchQuery(tool) {
  const name = tool.name;
  const base = name.replace(/\s*\([^)]+\)\s*$/, '').trim();
  const addTool = /^(Level|Square|Creeper|Router|Plunger|Rasp|Edger|Float|Hoe|Shovel|Rake|Clamp|Punch|Vise|Bar|Pull|Knife|Tray|Stick|Cloth|Tape|Magnet|Set|Kit|Ring)$/i;
  if (addTool.test(base)) return `${base} tool`;
  return base;
}

async function searchPexels(apiKey, query) {
  const url = new URL('https://api.pexels.com/v1/search');
  url.searchParams.set('query', query);
  url.searchParams.set('per_page', '1');

  const res = await fetch(url.toString(), {
    headers: { Authorization: apiKey },
  });
  if (!res.ok) throw new Error(`Pexels API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const photo = data.photos && data.photos[0];
  if (!photo || !photo.src) return null;
  return `${photo.src.medium}?auto=compress&w=400&fit=crop`;
}

async function searchUnsplash(accessKey, query) {
  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', query);
  url.searchParams.set('per_page', '1');
  url.searchParams.set('client_id', accessKey);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Unsplash API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const photo = data.results && data.results[0];
  if (!photo || !photo.urls) return null;
  return `${photo.urls.regular}&w=400&h=300&fit=crop`;
}

async function main() {
  const pexelsKey = (process.env.PEXELS_API_KEY || '').trim();
  const unsplashKey = (process.env.UNSPLASH_ACCESS_KEY || '').trim();
  const usePexels = pexelsKey.length > 0;

  if (!pexelsKey && !unsplashKey) {
    console.error('No API key found. Set PEXELS_API_KEY or UNSPLASH_ACCESS_KEY in .env (same folder as package.json).');
    console.error('Get Pexels key: https://www.pexels.com/api/  Get Unsplash key: https://unsplash.com/developers');
    process.exit(1);
  }
  console.log('Using', usePexels ? 'Pexels' : 'Unsplash', '- fetching one photo per tool by name...\n');

  const search = usePexels
    ? (q) => searchPexels(pexelsKey, q)
    : (q) => searchUnsplash(unsplashKey, q);
  const source = usePexels ? 'Pexels' : 'Unsplash';

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  let updated = 0;
  let failed = [];

  for (let i = 0; i < data.tools.length; i++) {
    const tool = data.tools[i];
    const query = getSearchQuery(tool);
    try {
      const imageUrl = await search(query);
      if (imageUrl) {
        tool.image = imageUrl;
        updated++;
        console.log(`[${i + 1}/${data.tools.length}] ${tool.name} <- "${query}" (${source})`);
      } else {
        failed.push({ name: tool.name, query });
        console.log(`[${i + 1}/${data.tools.length}] ${tool.name} (no result for "${query}")`);
      }
    } catch (err) {
      failed.push({ name: tool.name, error: err.message });
      console.error(`[${i + 1}/${data.tools.length}] ${tool.name} error:`, err.message);
    }

    if (i < data.tools.length - 1) await sleep(DELAY_MS);
  }

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log(`\nDone. Updated ${updated} tool images. Failed: ${failed.length}`);
  if (failed.length) console.log('Failed:', failed.map((f) => f.name).join(', '));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
