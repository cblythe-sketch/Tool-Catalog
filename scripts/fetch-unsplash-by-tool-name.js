/**
 * Fetches one photo per tool by searching for the tool name, then updates
 * data/tools.json so each card shows a photo of that specific tool.
 *
 * Sources (set one in .env):
 *   Pexels (recommended): https://www.pexels.com/api/  — PEXELS_API_KEY
 *   Unsplash: https://unsplash.com/developers          — UNSPLASH_ACCESS_KEY
 *   Pixabay: https://pixabay.com/api/docs/              — PIXABAY_API_KEY
 *     (Pixabay does not allow permanent hotlinking; prefer Pexels/Unsplash or
 *      download Pixabay images and host yourself. See docs/TOOL-IMAGE-SOURCES.md)
 *
 * Run: npm run update-images  (or node scripts/fetch-unsplash-by-tool-name.js)
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

// Override search queries so each tool gets a distinct, accurate image (avoids wrong/duplicate results).
const CUSTOM_QUERIES = {
  'Spark Plug Socket': 'spark plug socket wrench automotive tool',
  'Creeper': 'mechanic creeper under car automotive dolly',
  'Oil Drain Pan': 'oil drain pan motor oil change automotive',
  'Breaker Bar': 'breaker bar wrench socket long handle',
  'Fish Tape': 'fish tape electrical wire reel conduit',
  'Post Hole Digger': 'manual post hole digger clamshell two handles hand tool',
  'Hoe': 'garden hoe weeding draw hoe tool soil',
  'Notched Trowel': 'notched trowel tile adhesive spreading tool flooring',
  'Framing Square': 'framing square carpenter L square tool',
  'Torque Wrench': 'torque wrench automotive socket',
  'Ball Peen Hammer': 'ball peen hammer metalworking',
  'Square': 'carpenter square L framing layout',
  'Hand Saw': 'hand saw wood cutting',
  'Table Saw': 'table saw woodworking',
  'Lineman\'s Pliers': 'lineman pliers electrical',
  'Pliers Set': 'pliers set tools assortment',
  'Voltage Tester': 'voltage tester electrical',
  'Circuit Tester': 'circuit tester multimeter electrical',
  'PEX Crimping Tool': 'PEX crimping tool plumbing',
  'Crimping Tool': 'wire crimping tool electrical',
  'Staple Gun (Electric)': 'electric staple gun',
  'Staple Gun (Manual)': 'manual staple gun hand',
  'Pipe Wrench': 'pipe wrench plumbing',
  'Deburring Tool': 'deburring tool pipe',
  'Basin Wrench': 'basin wrench sink faucet',
  'Adjustable Wrench': 'adjustable wrench',
  'Drywall T-Square': 'drywall T-square',
  'Drywall Knife': 'drywall knife putty',
  'Drywall Lift': 'drywall lift panel hoist',
  'Rubber Mallet': 'rubber mallet soft face',
  'Pocket Hole Jig': 'pocket hole jig Kreg woodworking tool product',
  'Nail Set': 'nail set punch tool carpentry close up',
  'Mortar Hoe': 'mortar hoe mixing tool masonry',
  'Pull Bar': 'flooring pull bar laminate installation tool',
  'Knee Pads': 'work knee pads construction flooring product',
};

// Append to every search to favor tool-only / product shots (no people).
const NO_PERSON_SUFFIX = ' product tool';

function getSearchQuery(tool) {
  if (CUSTOM_QUERIES[tool.name]) return CUSTOM_QUERIES[tool.name];
  const name = tool.name;
  const base = name.replace(/\s*\([^)]+\)\s*$/, '').trim();
  const addTool = /^(Level|Creeper|Router|Plunger|Rasp|Edger|Float|Hoe|Shovel|Rake|Clamp|Punch|Vise|Bar|Pull|Knife|Tray|Stick|Cloth|Tape|Magnet|Set|Kit|Ring)$/i;
  const q = addTool.test(base) ? `${base} tool` : base;
  const cat = tool.category && tool.category !== 'general' ? ` ${tool.category}` : '';
  return `${q}${cat}`.trim();
}

const PER_PAGE = 15;
const IMAGE_OPTS = '?auto=compress&w=400&fit=crop';

async function searchPexels(apiKey, query, page = 1) {
  const url = new URL('https://api.pexels.com/v1/search');
  url.searchParams.set('query', query);
  url.searchParams.set('per_page', String(PER_PAGE));
  url.searchParams.set('page', String(page));

  const res = await fetch(url.toString(), {
    headers: { Authorization: apiKey },
  });
  if (!res.ok) throw new Error(`Pexels API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const photos = (data.photos || []).filter((p) => p && p.id && p.src);
  return photos.map((p) => ({
    id: p.id,
    url: `${p.src.medium}${IMAGE_OPTS}`,
  }));
}

async function searchUnsplash(accessKey, query, page = 1) {
  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', query);
  url.searchParams.set('per_page', String(PER_PAGE));
  url.searchParams.set('page', String(page));
  url.searchParams.set('client_id', accessKey);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Unsplash API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const results = (data.results || []).filter((p) => p && p.id && p.urls);
  return results.map((p) => ({
    id: p.id,
    url: `${p.urls.regular}&w=400&h=300&fit=crop`,
  }));
}

async function searchPixabay(apiKey, query, page = 1) {
  const url = new URL('https://pixabay.com/api/');
  url.searchParams.set('key', apiKey);
  url.searchParams.set('q', query);
  url.searchParams.set('per_page', String(PER_PAGE));
  url.searchParams.set('page', String(page));
  url.searchParams.set('image_type', 'photo');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Pixabay API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const hits = (data.hits || []).filter((p) => p && p.id && p.webformatURL);
  return hits.map((p) => ({
    id: `pixabay-${p.id}`,
    url: p.webformatURL,
  }));
}

async function main() {
  const pexelsKey = (process.env.PEXELS_API_KEY || '').trim();
  const unsplashKey = (process.env.UNSPLASH_ACCESS_KEY || '').trim();
  const pixabayKey = (process.env.PIXABAY_API_KEY || '').trim();
  const usePexels = pexelsKey.length > 0;
  const useUnsplash = !usePexels && unsplashKey.length > 0;
  const usePixabay = !usePexels && !useUnsplash && pixabayKey.length > 0;

  if (!usePexels && !useUnsplash && !usePixabay) {
    console.error('No API key found. Set one in .env:');
    console.error('  PEXELS_API_KEY   https://www.pexels.com/api/');
    console.error('  UNSPLASH_ACCESS_KEY  https://unsplash.com/developers');
    console.error('  PIXABAY_API_KEY https://pixabay.com/api/docs/');
    process.exit(1);
  }
  const source = usePexels ? 'Pexels' : useUnsplash ? 'Unsplash' : 'Pixabay';
  console.log('Using', source, '- one unique photo per tool (no duplicates)...\n');

  const search = usePexels
    ? (q, page) => searchPexels(pexelsKey, q, page)
    : useUnsplash
      ? (q, page) => searchUnsplash(unsplashKey, q, page)
      : (q, page) => searchPixabay(pixabayKey, q, page);

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const usedPhotoIds = new Set();
  let updated = 0;
  let failed = [];

  for (let i = 0; i < data.tools.length; i++) {
    const tool = data.tools[i];
    const query = getSearchQuery(tool) + NO_PERSON_SUFFIX;
    let imageUrl = null;
    try {
      for (let page = 1; page <= 3; page++) {
        const photos = await search(query, page);
        if (!photos.length) break;
        const pick = photos.find((p) => !usedPhotoIds.has(p.id));
        if (pick) {
          imageUrl = pick.url;
          usedPhotoIds.add(pick.id);
          break;
        }
      }
      if (!imageUrl) {
        const photos = await search(query, 1);
        if (photos.length) {
          imageUrl = photos[0].url;
          usedPhotoIds.add(photos[0].id);
        }
      }
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
  console.log(`\nDone. Updated ${updated} tool images (all unique). Failed: ${failed.length}`);
  if (failed.length) console.log('Failed:', failed.map((f) => f.name).join(', '));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
