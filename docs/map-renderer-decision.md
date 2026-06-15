# Map renderer decision (OPEN — needs human sign-off)

The garden map is Tend's hero: a spatially-true, semantic-zoom canvas
(Garden → Zone → Bed → Plant). The renderer is a **deliberately open decision**.
Architect so the renderer sits behind a **swappable interface**, and build the
**camera + gesture + semantic-zoom skeleton first** — that "feel" is the hero
and is largely renderer-independent.

> Status: **not yet decided.** Do not commit a renderer without Charlie's
> sign-off. This doc gets fleshed out and a recommendation added when we reach
> the Phase 2 spike.

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
