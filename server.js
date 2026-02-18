const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

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

// Serve frontend for any other route (SPA-style)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Tool catalog server running at http://localhost:${PORT}`);
});
