# Tend — Swiss / Zen style guide

**This file is law.** Read it before building or changing any UI. It is the
single source of truth for color, type, spacing, radii, and the shared
primitives. (Referenced from `CLAUDE.md`.)

Provenance: ported from the studio's **swiss/zen** system
(`lilatravel/src/design/tokens.jsx`), adapted to TypeScript + Tailwind v4 for
Tend. This is a **living component library** — see *Growing the library* below.

---

## Principles (Swiss / International)

Strict grid · clear typographic hierarchy · generous whitespace · restraint ·
precision · flat, tactile surfaces. **No decorative noise.** One true accent.
Warmth comes from the paper grounds, not from ornament.

Mobile-first and responsive: it must feel native on a phone (≥44px touch
targets, real gestures) *and* render beautifully on desktop. Accessibility is
non-negotiable — semantic HTML, labels, visible focus, keyboard support, AA
contrast.

---

## How tokens work

Tokens live in **two synced places**:

1. `src/styles/global.css` `@theme` — Tailwind v4 reads these and generates
   utilities. **Prefer these classes in markup.**
2. `src/design/tokens.ts` (`T`, `SANS`, `hexA`) — a JS mirror for places the
   cascade can't reach: SVG strokes/fills, `<canvas>`, inline gradients,
   keyframes.

**Never hardcode a value that exists as a token.** If you need a value that
isn't here, propose an addition consistent with the system and **ask before
inventing one.**

### Color

| Token | Value | Tailwind | Use |
| --- | --- | --- | --- |
| `card` | `#ffffff` | `bg-card` | lightest surface (cards) |
| `paper` | `#fdfcfa` | `bg-paper` | section / panel ground |
| `bg` | `#f5f1ea` | `bg-bg` | page ground |
| `ink` | `#1a1714` | `text-ink` | primary text |
| `ink70` | `#403a33` | `text-ink70` | body text |
| `clay` | `#6f6657` | `text-clay` | secondary text, breath lines |
| `muted` | `#8c8378` | `text-muted` | labels, captions |
| `faint` | `#b8b0a2` | `text-faint` | faintest text, dividers' siblings |
| `seal` | `#b23a2e` | `bg-seal` `text-seal` | **the one accent** (sumi red) |
| `live` | `#3a7d7b` | `bg-live` `text-live` | live / "right now" state |
| `line` | `rgba(26,23,20,.14)` | `border-line` | hairline rules |
| `line-soft` | `rgba(26,23,20,.08)` | `border-line-soft` | inner hairlines |

The accent is **scarce by design** — seal marks the single most important thing
in a view; `live` is reserved for real-time state (reservoir level, greenhouse
temp/humidity, irrigation on/off).

### Type

One family: **Inter** (`--font-sans`). Display headings are tight
(`tracking-[-0.035em]`, `leading-none`); body is calm (`leading-[1.6]`);
micro-labels are uppercase and tracked (`tracking-[0.16em]`). Serif is retired.

### Radii & surface

`--radius-card: 10px` → `rounded-card`. Surfaces are flat with hairline borders,
not drop shadows. Layer by ground (`bg` → `paper` → `card`), not by elevation.

---

## Primitives (`src/design/primitives.tsx`)

`Mark` (glyph family; `leaf` is Tend's default marker) · `Label` · `VLabel` ·
`Seal` · `Marker` (seal + mark + index — the section signature) · `Breath` (the
one emotional line per section) · `Hairline` · `FactsList` (key/value rows for
bed specs, plant attributes, irrigation facts).

See them all rendered at **`/styleguide`** — and visually QA there at ~390px and
desktop before shipping UI.

> Intentionally **not** ported (travel-domain): `Hero`, `Bento`, `Perspective`,
> `NowPanel`, `DESTINATIONS`. The `NowStrip`/`NowPanel` *pattern* returns as
> Tend's live-state widget (previewed on `/styleguide` §06).

---

## Growing the library (the promote-back loop)

Tend both **consumes and contributes to** swiss/zen. When Tend produces a
polished, reusable primitive (a bed card, a live-state widget, a map control):

1. Add it to `src/design/primitives.tsx` and render it on `/styleguide`.
2. Flag it as a **promotion candidate** for shared swiss/zen.
3. On sign-off, promote it up to the studio library so the next app inherits it
   — the same loop the
   [capabilities registry](https://github.com/Madrona-Product-Studio/madrona-studio-capabilities)
   runs for integrations.

When the system changes, update this file (and `CLAUDE.md` if a rule changes).
