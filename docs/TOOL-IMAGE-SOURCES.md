# Tool photo sources

Ways to get photos of tools for the catalog (APIs and manual options).

---

## Free stock photo APIs (good for automation)

| Source | API | Rate limit | Commercial use | Notes |
|--------|-----|------------|----------------|-------|
| **Pexels** | [pexels.com/api](https://www.pexels.com/api/) | 200 req/hour (default) | Yes, free | Used by default. Good tool/workshop results. Attribution appreciated. |
| **Unsplash** | [unsplash.com/developers](https://unsplash.com/developers) | 50/hr (demo), 5000/hr (approved) | Yes, with attribution | Set `UNSPLASH_ACCESS_KEY` in `.env`. Alternative when Pexels has no good hit. |
| **Pixabay** | [pixabay.com/api/docs](https://pixabay.com/api/docs/) | 100 req/60 sec | Yes, free | Set `PIXABAY_API_KEY` in `.env`. **No permanent hotlinking**—download and host images if you use Pixabay in production. |

**Script support:** `scripts/fetch-unsplash-by-tool-name.js` uses Pexels first, then Unsplash if no Pexels key. Pixabay can be added as a third option (see script comments).

---

## Manual / one-off sources

- **Manufacturer media**  
  Many tool brands (Milwaukee, DeWalt, Klein, Kreg, etc.) have press or partner pages with official product images. Use per their guidelines (often free for editorial/product use). No API; download and host the image, then set the tool’s `image` URL in `data/tools.json` to your hosted URL.

- **Wikimedia Commons**  
  [commons.wikimedia.org](https://commons.wikimedia.org) has many tool photos (CC licenses). Use the [MediaWiki API](https://commons.wikimedia.org/w/api.php) or search the site, then use the image URL or download and host. Check each file’s license and attribution requirements.

- **Creative Commons search**  
  [search.creativecommons.org](https://search.creativecommons.org) aggregates CC-licensed images. Filter by “use for commercial purposes” and “modify,” then verify the exact license and attribution on the source site.

---

## Summary

- **Automated catalog images:** Use **Pexels** (or **Unsplash**) via the existing fetch script; add **Pixabay** in code if you want, and **download + host** Pixabay images if you use them in production.
- **Best match + tool as main subject:** Prefer **custom search queries** in the script (see `CUSTOM_QUERIES`) or **manual URLs** from manufacturer media / Wikimedia / CC search, with the tool as the main subject and no permanent hotlinking of Pixabay.
