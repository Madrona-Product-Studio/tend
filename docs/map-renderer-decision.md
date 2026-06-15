# Map renderer decision (OPEN — needs human sign-off)

The garden map is Tend's hero: a spatially-true, semantic-zoom canvas
(Garden → Zone → Bed → Plant). The renderer is a **deliberately open decision**.
Architect so the renderer sits behind a **swappable interface**, and build the
**camera + gesture + semantic-zoom skeleton first** — that "feel" is the hero
and is largely renderer-independent.

> Status: **spike run; awaiting Charlie's sign-off.** The camera/gesture/LOD
> skeleton is built behind `MapRendererProps`, with **SVG as the first
> candidate** wired to the real seeded garden. Recommendation below — not yet
> committed.

## Spike results (2026-06-14)

Built: a renderer-independent camera (`@use-gesture` + `@react-spring`) with
zoom-to-cursor, clamping, and 3-level LOD; an `SvgRenderer` candidate; drag-to-
place beds (persisted to Dexie); DOM overlay controls + keyboard. Verified by
screenshot at garden / zone / bed LOD.

**SVG candidate — findings**
- ✅ Semantic zoom reads naturally (garden → zone regions → beds → plants+live state).
- ✅ Crisp vector text/strokes at every zoom; styling straight from swiss/zen tokens.
- ✅ DOM pointer events make drag-to-place and a11y trivial; overlays stay in the DOM.
- ✅ Smooth at v1 scale (4 zones / 15 beds / ~30 plantings). No perf concern.
- ⚠️ Watch item: world-space `<text>` scales with zoom (large at bed LOD). Fine now;
  if it bothers, counter-scale labels or move them to a DOM overlay later.
- ⚠️ Unknown ceiling: a garden with *hundreds* of plant nodes visible at bed LOD
  could stress SVG; not a v1 concern.

**Recommendation:** ship **SVG** for v1 — the scale is small, the feel is good,
a11y + token styling are easiest, and the renderer stays behind the interface so
Canvas/WebGL remains a drop-in swap if a future garden needs it. **Needs your
sign-off before we build the rest of the map on it.**

## Candidates

| Option | Strengths | Risks |
| --- | --- | --- |
| **SVG + d3-zoom** | Crisp vectors, DOM accessibility, easy overlays/labels, simple to style with tokens | Perf ceiling with many nodes; manual LOD culling |
| **react-konva (Canvas)** | Strong interaction/perf for many objects, good drag | Overlays/labels not in DOM (a11y work), heavier API |
| **Custom (Canvas/WebGL) behind interface** | Maximum control, can add WebGL flourishes where they earn it | Most effort; only if the above hit a wall |

Shared, renderer-independent layer to build first:
`@use-gesture/react` (pan/zoom/drag) + a spring/motion lib + a `Camera`
abstraction (world↔screen transform, zoom level → semantic LOD). Map-overlay
controls (labels, popovers, buttons) live in the **DOM/SVG layer**, never
trapped in canvas.

## How we'll judge the spike (1–2 days)

1. Pan/zoom **feel** on a phone (inertia, pinch, no jank at 60fps).
2. Semantic-zoom transitions (zone → bed → plant) read naturally.
3. Drag-to-place a bed feels precise.
4. Labels/overlays stay crisp and accessible at every zoom.
5. Token-driven styling is straightforward.

Decision recorded here once the spike runs.
