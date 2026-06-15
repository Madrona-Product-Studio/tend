# Tend — Claude Code project guide

Tend helps home gardeners and small hobby farms **map, organize, and improve their gardens year over year**. The hero is a beautiful, spatially-true, semantic-zoom **map** of the garden — zones, beds, plants, and the systems (irrigation, covers, sensors) that serve them.

**v1 scope:** map-first, manual/guided entry, a single garden. Bed types, a simple irrigation representation, per-bed notes/tasks. (Voice→structure ingestion is v1.5; recommendations come later.)

---

## Design: the style guide is law

The Swiss style guide is the **single source of truth** for all visual design.

@design/swiss-style-guide.md

Rules:
- **Read the style guide before building or changing any UI.** Use its tokens for color, type, spacing, radii, and shadows.
- **Never hardcode a value that exists as a token.** Reference the token. If a value you need is missing, propose an addition consistent with the guide and ask before inventing one.
- **Honor Swiss / International principles:** strict grid, clear typographic hierarchy, generous whitespace, restraint, precision, flat tactile surfaces. No decorative noise.
- **Mobile-first and responsive.** It must feel native on a phone (touch targets, gestures) *and* render beautifully on desktop.
- Prefer accessible, semantic markup; the design system's polish should never come at the cost of contrast, focus states, or keyboard use.

---

## Stack

- **App:** Vite + React + TypeScript (strict mode).
- **Styling:** Tailwind + shadcn/ui, driven by the style-guide tokens.
- **State:** Zustand.
- **Storage:** local-first via Dexie/IndexedDB. Do **not** add a backend in v1. Supabase slots in at v1.5 for accounts/sync/photos.
- **Offline:** ship as an installable PWA (vite-plugin-pwa); the app must work offline (gardens have poor signal).
- **Deploy:** Vercel.

---

## Navigation: levels × lenses (the connective tissue)

Every level is its **own route**, and each shares one header (`@components/LevelChrome` — home leaf + breadcrumb + lens switch + actions). This consistency is the point; don't reintroduce per-screen bespoke nav.

- **Levels = routes:** `/garden/:id` → `/garden/:id/zone/:zoneId` → `/garden/:id/bed/:bedId`, with a **Planting** detail panel inside the bed. All linkable; browser-back works.
- **Two lenses at every level — `Map` | `List`** (URL-driven via `?lens=`, see `useLens`):
  - **Map** = the spatial/visual view. Garden & Zone use `@components/SpatialLens` (a static viewBox-fit SVG of zones / beds — tap to drill in). Bed's Map = its **row layout** (`BedShape`).
  - **List** = the register. Garden = zones+beds; Zone = its beds + tasks; Bed = plantings + tasks + notes.
- **Edit is a mode** on the Bed's Map lens (drag-drop rows via `@dnd-kit`); arranging zones/beds spatially is a later pass.
- **Spatially true, topological-first:** beds auto-layout for now (no saved coordinates yet); to-scale + drag-to-place on the overview come later.
- Renderer is **SVG/Vector**. (History: a continuous zoom canvas + a Konva spike were tried, then replaced by route-per-level — see `docs/map-renderer-decision.md`.)

---

## Domain model (keep explicit in types)

`Garden → Zone → Bed → Plant`, plus cross-cutting first-class objects:
- **Bed types:** Vigo wicking (+reservoir/level indicator), Vigo non-wicking, aluminum raised, greenhouse, container, in-ground.
- **Movable equipment** (limited, reassigned between beds, à la Sonos): covers (heat vs mesh/shade), sensors (temp/humidity), irrigation nodes.
- **Irrigation as a network with state** (hose → nodes → per-bed switch → emitters/misters), not a boolean.
- **Plant attributes that drive future recommendations:** crop category, pollination-required, season, soil-temp need, bolting risk, soil-depth need, variety.

Full product context + the parsed garden inventory: **docs/tend-brief.md** (read when you need domain detail).

---

## Working conventions

- Functional components and hooks; TypeScript strict; no `any` without a comment justifying it.
- **Build in small, verifiable increments.** Before a new feature, restate the plan in 3–5 steps and confirm before writing code.
- After changes, run typecheck + lint + build; keep the app green.
- Accessibility is non-negotiable: semantic HTML, labels, focus management, keyboard support. Map-overlay controls (labels, popovers, buttons) should live in the DOM/SVG layer, not be trapped in a canvas.
- Keep the domain model in a typed core that's independent of the renderer and the storage layer.
- When a decision changes, update this file and `docs/tend-brief.md`.
