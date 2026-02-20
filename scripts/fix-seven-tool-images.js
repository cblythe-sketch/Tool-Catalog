/**
 * Fetches better Pexels images for 7 tools that often get wrong results.
 * Run: node scripts/fix-seven-tool-images.js (uses PEXELS_API_KEY from .env)
 */
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8');
  env.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/\r$/, '').replace(/^["']|["']$/g, '');
  });
}

const dataPath = path.join(__dirname, '..', 'data', 'tools.json');
const apiKey = (process.env.PEXELS_API_KEY || '').trim();
if (!apiKey) {
  console.error('Set PEXELS_API_KEY in .env');
  process.exit(1);
}

const CUSTOM_QUERIES = {
  'Spark Plug Socket': 'spark plug socket wrench automotive tool',
  'Creeper': 'mechanic creeper under car automotive dolly',
  'Oil Drain Pan': 'oil drain pan motor oil change automotive',
  'Breaker Bar': 'breaker bar wrench socket long handle',
  'Fish Tape': 'fish tape electrical wire reel conduit',
  'Post Hole Digger': 'post hole digger tool fence garden',
  'Framing Square': 'framing square carpenter L square tool',
};

async function searchPexels(query) {
  const url = new URL('https://api.pexels.com/v1/search');
  url.searchParams.set('query', query);
  url.searchParams.set('per_page', '1');
  const res = await fetch(url.toString(), { headers: { Authorization: apiKey } });
  if (!res.ok) throw new Error(`Pexels ${res.status}`);
  const data = await res.json();
  const photo = data.photos && data.photos[0];
  return photo && photo.src ? `${photo.src.medium}?auto=compress&w=400&fit=crop` : null;
}

async function main() {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const names = Object.keys(CUSTOM_QUERIES);

  for (const name of names) {
    const tool = data.tools.find((t) => t.name === name);
    if (!tool) continue;
    const query = CUSTOM_QUERIES[name];
    try {
      const url = await searchPexels(query);
      if (url) {
        tool.image = url;
        console.log('OK:', name, '<-', query);
      } else {
        console.log('No result:', name);
      }
    } catch (err) {
      console.error('Error:', name, err.message);
    }
    await new Promise((r) => setTimeout(r, 400));
  }

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log('\nUpdated data/tools.json');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
