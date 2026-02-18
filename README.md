# Polaris Tool & Building Catalog

A full-stack website that catalogs hand tools and building materials by category. Includes a main page, category tabs (Automotive, Carpentry, Electrical, Plumbing, Masonry, General), and photos for each tool.

## Stack

- **Backend:** Node.js, Express
- **Frontend:** HTML, CSS, JavaScript (vanilla)
- **Data:** JSON file (`data/tools.json`)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Matching each photo to the tool name

So that the image above each tool card shows **that specific tool** (e.g. spark plug socket, tire pressure gauge, multimeter), run the fetch script once with a free API key:

1. Get a free **Pexels** API key: [pexels.com/api](https://www.pexels.com/api/) (recommended; 200 requests/hour).
2. From the project folder run:
   ```bash
   PEXELS_API_KEY=your_key_here node scripts/fetch-unsplash-by-tool-name.js
   ```
   Or use **Unsplash**: get a key at [unsplash.com/developers](https://unsplash.com/developers), then:
   ```bash
   UNSPLASH_ACCESS_KEY=your_key_here node scripts/fetch-unsplash-by-tool-name.js
   ```
3. The script searches for a photo matching each tool name and updates `data/tools.json`. Restart or refresh the app to see the new images.

Copy `.env.example` to `.env` and add your key there if you prefer not to type it in the command.

## API

- `GET /api/categories` — List all categories
- `GET /api/tools` — List all tools (optional: `?category=automotive`)
- `GET /api/tools/:id` — Get one tool by id

## Project structure

```
polaris_ideas_builds_tools/
├── data/
│   └── tools.json      # Categories and tools (with image URLs)
├── public/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── server.js
├── package.json
└── README.md
```

## Adding tools

Edit `data/tools.json`. Each tool needs:

- `id` — unique string (e.g. `"t23"`)
- `name` — display name
- `category` — one of: `automotive`, `carpentry`, `electrical`, `plumbing`, `masonry`, `general`
- `description` — short description
- `image` — full URL to a photo. To have each card show a photo of that specific tool, run `scripts/fetch-unsplash-by-tool-name.js` with a Pexels or Unsplash API key (see above). You can also replace any `image` in `data/tools.json` manually with a direct photo URL.

To add a category, add an object to `categories` with `id`, `name`, and optional `icon` (emoji).
