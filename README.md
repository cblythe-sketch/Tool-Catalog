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
- `image` — full URL to a photo (e.g. Unsplash, or your own host)

To add a category, add an object to `categories` with `id`, `name`, and optional `icon` (emoji).
