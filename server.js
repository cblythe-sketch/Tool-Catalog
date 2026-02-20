const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai').default;

// Load .env if present
const envPath = path.join(__dirname, '.env');
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

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const dataPath = path.join(__dirname, 'data', 'tools.json');

function loadData() {
  const raw = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(raw);
}

// Get all categories
app.get('/api/categories', (req, res) => {
  try {
    const data = loadData();
    res.json(data.categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

// Get all tools, optionally filtered by category
app.get('/api/tools', (req, res) => {
  try {
    const data = loadData();
    let tools = data.tools;
    const category = req.query.category;
    if (category) {
      tools = tools.filter(t => t.category === category);
    }
    res.json(tools);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load tools' });
  }
});

// Get single tool by id
app.get('/api/tools/:id', (req, res) => {
  try {
    const data = loadData();
    const tool = data.tools.find(t => t.id === req.params.id);
    if (!tool) return res.status(404).json({ error: 'Tool not found' });
    res.json(tool);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load tool' });
  }
});

// Build catalog summary for AI context
function getCatalogSummary() {
  const data = loadData();
  const byCat = {};
  data.tools.forEach((t) => {
    if (!byCat[t.category]) byCat[t.category] = [];
    byCat[t.category].push(t.name);
  });
  const catNames = (data.categories || []).map((c) => c.name).join(', ');
  const toolList = Object.entries(byCat)
    .map(([cat, names]) => `${cat}: ${names.slice(0, 12).join(', ')}${names.length > 12 ? '...' : ''}`)
    .join('\n');
  return { catNames, toolList };
}

// AI chat: tool questions + build/how-to instructions
app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Chat is not configured. Add OPENAI_API_KEY to .env.' });
  }

  const { message, history = [] } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const { catNames, toolList } = getCatalogSummary();
  const systemPrompt = `You are the assistant for Polaris Tool Catalog, a site that lists hand tools and building materials by category.

Your role:
1) Answer questions about hand tools and building materials. When relevant, mention that the user can browse our catalog (we have categories: ${catNames}). You can reference specific tools we list when helpful.
2) When users ask for build or how-to instructions (e.g. "I want to build a table", "How do I change the oil in my car?", "How do I hang drywall?"), give clear instructions. Use this structure (no images or icons):
- Start with "## Tools needed" and list tools by name (use only tools from our catalog when suggesting tools).
- If the task involves parts/materials, add "## Parts" or "## Parts / materials" and list items.
- Use "## Assembly" or "## Steps" with numbered steps: **Step 1.** one short action, **Step 2.** next action, etc. One clear action per step.

Example structure:
## Tools needed
- Tool A (from our catalog when relevant)
- Tool B

## Parts
- 4x screws, 2x boards

## Assembly
**Step 1.** Lay the base flat.
**Step 2.** Attach side A to the base with two screws.

Catalog summary (tools we have):
${toolList}

Rules: Use markdown (##, **, lists). Do not include any image tags or pictures. Keep each step to one clear action. Do not make up tool names; use only tools from the catalog when suggesting tools.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: message.trim() },
  ];

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 1024,
    });
    const reply = completion.choices?.[0]?.message?.content || 'I couldn’t generate a response. Try again.';
    res.json({ reply });
  } catch (err) {
    console.error('OpenAI error:', err.message);
    let message = err.message || 'Chat request failed.';
    if (err.status === 429) {
      message = 'Your OpenAI account is out of credits or over the usage limit. Add a payment method or check usage at https://platform.openai.com/account/billing';
    } else if (err.status === 401) {
      message = 'Invalid OpenAI API key. Check your key in .env';
    }
    const status = err.status === 401 ? 503 : err.status === 429 ? 503 : 500;
    res.status(status).json({ error: message });
  }
});

// Serve frontend for any other route (SPA-style)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Tool catalog server running at http://localhost:${PORT}`);
});
