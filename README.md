# Polaris Tool Catalog

A catalog of hand tools and building materials by category, with photos and an AI chat assistant for build advice and tool recommendations.

## Prerequisites

- **Node.js** (v18 or later recommended)
- **npm** (comes with Node.js)

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment (optional for chat)

Create a `.env` file in the project root (same folder as `package.json`):

```env
# Required for the in-app AI chat
OPENAI_API_KEY=your_openai_api_key

# Optional: for updating tool images (npm run update-images)
PEXELS_API_KEY=your_pexels_key
```

- **OPENAI_API_KEY** — Get one at [platform.openai.com](https://platform.openai.com/api-keys). Without it, the catalog still runs but the chat widget will show an error when you send a message.
- **PEXELS_API_KEY** — Only needed if you run the image-update script. Get one at [pexels.com/api](https://www.pexels.com/api/).

### 3. Run the application

```bash
npm start
```

The server starts on **http://localhost:3000** (or the port set in the `PORT` environment variable).

### 4. Open in a browser

Go to **http://localhost:3000**. You’ll see:

- Category tabs and a grid of tools with photos
- A chat widget (bottom-right) for questions about tools and how to use them

## Scripts

| Command | Description |
|--------|-------------|
| `npm start` | Start the server (default port 3000). |
| `npm run update-images` | Refresh tool photos from Pexels/Unsplash/Pixabay. Requires an API key in `.env` (see [docs/TOOL-IMAGE-SOURCES.md](docs/TOOL-IMAGE-SOURCES.md)). |

## Project structure

- `server.js` — Express server; serves the frontend and API.
- `public/` — Static site (HTML, CSS, JS) and chat UI.
- `data/tools.json` — Catalog data (categories and tools).
- `scripts/` — Image-fetch and fix scripts for tool photos.

## Deployment

Set `PORT` in your host’s environment if required (e.g. Railway, Heroku). Set `OPENAI_API_KEY` in the host’s environment so the chat works in production. Do not commit `.env`; it is listed in `.gitignore`.
