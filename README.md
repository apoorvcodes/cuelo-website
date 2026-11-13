# cuelo.website

The landing page for [Cuelo](https://github.com/apoorvcodes/cuelo), open-source infrastructure for building speech-to-speech systems.

Built with [Astro](https://astro.build). No images for the artwork: the stippled garden, flowers and stars are generated in code and drawn to canvas.

## Develop

```sh
npm install
npx astro dev
```

Build with `npx astro build`; the static site lands in `dist/`.

## Where things live

| Path | What |
| --- | --- |
| `src/pages/index.astro` | The page: hero and the six sections, plus their small animations |
| `src/layouts/Layout.astro` | `<head>`: title, description, social previews, structured data |
| `src/components/Garden.astro` | Draws a garden (hero, section margins, footer) and sways it |
| `src/scripts/garden.ts` | Generates the thickets and flowers: compositions, shading, dither |
| `src/scripts/stars.ts` | The ink stars, tails and arcs |
| `src/styles/global.css` | All styles, plain CSS |
| `public/og.png` | Social preview image (1200×630) |

## Before deploying

Set the real domain in `astro.config.mjs` (`site`) and in `public/robots.txt`. Canonical URLs, the sitemap, the OG image URL and structured data all follow `site`.
