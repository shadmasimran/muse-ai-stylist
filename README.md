# Muse by Shadma

**An AI personal stylist.** Muse builds complete looks from the clothes you own, then matches makeup and jewelry to your skin tone, the occasion and the weather.

> Minor project, B.Tech Computer Engineering (SOCET-CE), Silver Oak University. Author: Shaikh Shadma Simran.

<!-- After running the app, add a screenshot at docs/screenshot-home.png and show it here:  ![Muse home page](docs/screenshot-home.png) -->

## Features

| Feature | How it works |
|---|---|
| Color intelligence | Dominant color of each uploaded photo is found with **K-Means clustering** (runs in the browser). |
| Outfit scoring | Every top/bottom/dress + footwear combination is scored on **color harmony** (neutral, analogous, complementary, triadic), **occasion formality**, **weather warmth** and **undertone flattery**. |
| Makeup and jewelry | Lipstick, blush, eye shade and metal are chosen from the catalog by **undertone** and the intensity the occasion calls for. |
| Live weather | Optional geolocation + [Open-Meteo](https://open-meteo.com) (no API key) buckets today's weather into Hot / Mild / Cool / Rainy. |
| Real photography | `npm run images` finds a licensed photo for every catalog item from [Unsplash](https://unsplash.com/developers) (or Pexels), with photographer credits. |
| Pinterest | Official **Pin it** buttons on every product and an optional embedded Pinterest board. |
| Lookbook | Save looks; everything persists in `localStorage`. |

## Tech stack

React 18 · Vite · React Router (HashRouter) · plain CSS · Node 22+ for scripts · GitHub Actions + GitHub Pages.

## Getting started

```bash
git clone https://github.com/<you>/muse-ai-stylist.git
cd muse-ai-stylist
npm install

# 1) Real product photos (one-time, free key from https://unsplash.com/developers)
cp .env.example .env        # then put your Access Key in .env
npm run images              # fills src/data/image-overrides.json + public/credits.json

# 2) Run
npm run dev                 # http://localhost:5173
npm test                    # unit checks for the styling engine
npm run build               # production build in dist/
```

**Automatic on GitHub:** add your key once as a repository secret named `UNSPLASH_ACCESS_KEY` (Settings → Secrets and variables → Actions). The deploy workflow then downloads the photos during every build, so you never have to commit them. Without the key the site still works and shows color-tinted placeholders.

You can also commit `public/products/` and `public/credits.json` yourself. Photos come from Unsplash/Pexels under their free licenses; the footer credits them.

To use your own photos for any item, drop a file at `public/products/<id>.jpg` or map an id to an image URL you have the rights to in `src/data/image-overrides.json`, e.g. `{ "d-wine": "https://example.com/dress.jpg" }`.

Not happy with a photo? Edit that item's `q` search phrase in `src/data/catalog.js`, delete its jpg and run `npm run images` again. You can also drop your own photos into `public/products/<id>.jpg`.

## Pinterest

* **Pin it** buttons use Pinterest's official create-pin URL.
* To show your own board on the Explore page, set `PINTEREST_BOARD` in `src/config.js` to a public board URL. It is rendered with Pinterest's official widget.
* Pinterest's terms do not allow scraping or re-hosting pins, so this project does not download images from Pinterest.

## Deploy to GitHub Pages

1. Push to a GitHub repository (default branch `main`).
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Every push runs `.github/workflows/deploy.yml` (install, test, build, publish).

## Project structure

```
src/
  data/catalog.js      product catalog (clothing, footwear, makeup, jewelry)
  lib/stylist.js       color science, K-Means, scoring, makeup/jewelry matching
  pages/               Home, Explore, Studio, Lookbook
  components.jsx       Nav, Footer, Img (photo with graceful fallback), Pin URL
  state.jsx            closet, profile and lookbook state (localStorage)
scripts/
  fetch-images.mjs     downloads licensed photos + credits
  test-stylist.mjs     unit checks
```

## Roadmap

* MERN backend: user accounts, MongoDB for closets and lookbooks, Cloudinary for uploads.
* Learn from likes and dislikes to personalize scoring.
* Real product links and virtual try-on.

## License

MIT. Product photography belongs to its photographers (see `public/credits.json`) under the Unsplash License / Pexels License.
