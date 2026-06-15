# Tend

Map, organize, and improve your food garden — year over year. The hero is a
beautiful, spatially-true, semantic-zoom **map** of the garden (zones → beds →
plants) and the systems that serve them.

## Stack

Vite · React 19 · TypeScript (strict) · Tailwind v4 (swiss/zen tokens) ·
Zustand · Dexie (local-first IndexedDB) · installable PWA · Vercel.

v1 is **local-first with no backend**. Supabase (sync/accounts/photos) and voice
ingestion arrive at v1.5 — see [`docs/tend-brief.md`](docs/tend-brief.md).

## Dev

```bash
npm install
npm run dev
```

## Scripts

| Script | Does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check (`tsc -b`) + production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (TS-aware) |
| `npm run preview` | Preview the production build |

## Design

`design/swiss-style-guide.md` is the **single source of truth** for visual
design. The living component library renders at **`/styleguide`** in-app; tokens
live in `src/styles/global.css` (`@theme`) and `src/design/tokens.ts`.

## Studio standards & capabilities

Tend inherits from the [Madrona Studio capabilities & standards
registry](https://github.com/Madrona-Product-Studio/madrona-studio-capabilities):
the **SEO standard** is adopted from day one (per-route meta via React 19 native
metadata, OG/Twitter, sitemap, robots, JSON-LD). Database (Supabase), auth, and
ai-claude (voice) capability playbooks slot in at v1.5.

## TODO before launch

- Real 1200×630 `og.png` (currently referenced but not created).
- PWA PNG icons (192 / 512) — SVG-only for now.
- Set the production domain (placeholder `https://tend.app`).
