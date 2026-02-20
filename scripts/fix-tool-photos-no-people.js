/**
 * Updates specific tool photos so the tool (not a person) is the main subject.
 * Run: node scripts/fix-tool-photos-no-people.js (uses PEXELS_API_KEY from .env)
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

// Queries chosen to get the tool as main subject (product/tool shot, not person).
// resultIndex: use 2nd or 3rd search result (0-based) when 1st often shows wrong tool.
const TOOLS = [
  { name: 'Pocket Hole Jig', query: 'pocket hole jig Kreg woodworking tool product' },
  { name: 'Nail Set', query: 'nail set punch tool carpentry close up' },
  { name: 'Mortar Hoe', query: 'masonry mixing hoe tool concrete mortar' },
  { name: 'Basin Wrench', query: 'basin wrench plumbing tool long handle faucet nut' },
  { name: 'Funnel Set', query: 'funnel set automotive oil pour' },
  { name: 'Pull Bar', query: 'flooring pull bar laminate installation tool' },
  { name: 'Knee Pads', query: 'work knee pads construction flooring product' },
  { name: 'Hoe', query: 'garden hoe weeding draw hoe tool soil' },
  { name: 'Notched Trowel', query: 'notched trowel tile adhesive spreading tool flooring', resultIndex: 1 },
  { name: 'Pliers Set', query: 'pliers set assortment slip joint needle nose tool product' },
  { name: 'Drywall Lift', query: 'drywall lift panel hoist ceiling installation tool' },
  { name: 'Mud Pan', query: 'drywall mud pan joint compound tool' },
  { name: 'Rasp', query: 'rasp tool file woodworking product' },
];

async function searchPexels(query, perPage = 10) {
  const url = new URL('https://api.pexels.com/v1/search');
  url.searchParams.set('query', query);
  url.searchParams.set('per_page', String(perPage));
  const res = await fetch(url.toString(), { headers: { Authorization: apiKey } });
  if (!res.ok) throw new Error(`Pexels ${res.status}`);
  const data = await res.json();
  const photos = (data.photos || []).filter((p) => p && p.src);
  return photos.map((p) => `${p.src.medium}?auto=compress&w=400&fit=crop`);
}

async function main() {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  for (const { name, query, resultIndex = 0 } of TOOLS) {
    const tool = data.tools.find((t) => t.name === name);
    if (!tool) continue;
    try {
      const urls = await searchPexels(query);
      const idx = Math.min(resultIndex, Math.max(0, urls.length - 1));
      if (urls.length && urls[idx]) {
        tool.image = urls[idx];
        console.log('OK:', name, '<-', query, resultIndex ? `(result #${resultIndex + 1})` : '');
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
