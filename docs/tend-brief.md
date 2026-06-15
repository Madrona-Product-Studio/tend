# Tend — Product Brief

*Living document. Working name: **Tend**. Updated after the garden-walkthrough session.*

---

## One-liner

Tend helps home gardeners and small hobby farms **map, organize, and improve their gardens year over year** — starting with a beautiful, spatially-true map of what's growing where, and building toward ongoing maintenance, observation, and data-driven refinement.

## The core idea

The heart of Tend is **visual clarity**: a really nice map of the whole garden — zones, beds, plants, and the systems that serve them — so a grower sees what's happening at a glance. From that foundation, Tend supports the ongoing work of *managing, observing, and refining* the garden, and proactively recommends improvements.

**Guiding analogy — the "Sonos model":** a garden is a composable system of components grouped into zones that work together, not a flat list of plants. The walkthrough showed this is more literal than expected: covers, sensors, and irrigation nodes are **movable components reassigned between beds**, exactly like speakers between Sonos zones.

The long-game purpose: **understand and improve the garden's performance year over year.** Experimentation is a first-class activity.

---

## The map (design direction)

**Semantic zoom / level-of-detail.** One canvas; detail resolves as you move closer:
- **Garden** — all zones, oriented to the real plot.
- **Zone** — beds resolve into view, in their real arrangement.
- **Bed** — plants, the bed's design, its irrigation, and live state (e.g. reservoir level).

**Spatially true.** Beds sit in their real relative positions/orientation — a grounded map, not an abstract diagram.

**To-scale is a later pass.** Decision settled by the walkthrough: start *topological* (correct relative positions), earn your way to *to-scale* (measured footprint) later. See voice ingestion below.

**Live state on the map.** Bed designs have state — reservoir water level, greenhouse temp/humidity, irrigation on/off. Showing it turns the map from a static diagram into a spatial dashboard.

*Parked for later: a property-location/site diagram.*

---

## Domain model (enriched by the walkthrough)

- **Garden** → **Zones** → **Beds** → **Plants**
- **Beds have a type/product:** Vigo raised + wicking floor + reservoir + level indicator · Vigo raised (no wicking) · aluminum raised · greenhouse (structure) · container/pot · in-ground (perimeter).
- **Movable equipment (first-class objects, limited quantity, shared across beds):**
  - *Covers* — greenhouse/heat covers (sizes; pole sets) vs mesh/shade covers (breathable; bug/bird/sun).
  - *Sensors* — Govee Bluetooth temp/humidity (only 2; relocated; unreliable).
  - *Irrigation node* — per-bed connection + on/off switch.
- **Irrigation = a network with state:** hose-fed → nodes → branches → per-bed switch → emitters (~3/bed, adding more) / greenhouse misters / Vigo mister lines / soaker-hose option. Some beds intentionally off (wicking). Topology matters (line "ends" at the potato bed).
- **Plant attributes (drive recommendations):** crop category (brassica, fruiting, root, allium, herb…) · pollination required? (fruiting yes / brassica no) · season (cool/warm) · soil-temp need (~60–70°F for warm crops; PNW limiting factor) · bolting risk · soil-depth need · water/fertilizer demand · variety/cultivar (heavy trialing).
- **Environment dimensions (per zone/location):** sun/shade exposure (*flagged as the single most important factor; no data yet*) · soil temperature · microclimate · bird/pest pressure.

---

## Scope — build sequence

1. **The Map** — beautiful, spatially-true, semantic-zoom map of zones, beds, bed designs, plants, and systems. The foundation.
2. **Management, maintenance & observation** — tasks, notes (present but secondary to the visual), observations log, live state.
3. **Refinement & recommendations** — season-over-season improvement; rules driven by plant attributes + environment. Can surface early, woven throughout.

---

## Key feature: voice / recording → structured garden

Validated by this very walkthrough: ingest a spoken garden tour and auto-extract zones, beds, bed types, plants/varieties, systems (irrigation/covers/sensors), and a task list.

**Key finding:** voice yields a complete *relational/topological model + inventory + tasks*, but **not spatial coordinates**. Flow:
> **record → Tend auto-drafts structure & inventory → human confirms & arranges on the map** (drag to place, or anchor to an overhead photo).

It nails the tedious part (cataloguing 150+ plants); the human supplies geometry.

A walkthrough also generates a **task/punch-list for free** — so the output is *a map **and** a plan*.

## Integrations requested (unprompted, in the walkthrough)

- **Plant / species ID** — for unknown varieties, "question-mark" plants, the mystery plum.
- **Sensor feeds** — Govee temp/humidity (and future sensors).
- **Tend as the canonical plant label / source of truth** — solves physical labels getting knocked out and illegible handwriting. Quietly one of the most valuable: the app is the label the physical garden keeps losing.

---

## Confirmed must-haves

A beautiful spatially-true map (centerpiece) · multiple zones · varied bed designs · plant tracking per bed · irrigation represented (ideally as a network) · movable covers/sensors · notes (secondary) · year-over-year experimentation · recommendations · voice/recording ingestion.

---

## Open questions / to resolve

1. **Platform** — mobile matters (you consult/record *in* the garden); web too? 
2. **Grouping** — strict zone→bed tree, or flexible cross-cutting groups (a temporary "tomato experiment" spanning beds), à la Sonos ad-hoc groups?
3. **Map fidelity path** — confirm topological-first, optional to-scale later; how is to-scale captured (manual measure? photo/overhead anchor?).
4. **Live state source** — hand-logged vs sensor-fed vs none for v1.
5. **Single vs multiple gardens/properties** per user.
6. **Bed creation flow** — manual, guided setup, voice-drafted, or photo-assisted (likely all, with voice as the hero path).
7. **Target user** — does "small hobby farm" change requirements vs. home gardener?

---

## Reference appendix — parsed garden inventory

*Auto-extracted from the walkthrough. Positions approximate.*

### Zone 1 — main production (Vigo raised beds, greenhouse, she-shed; irrigation circuit)
1. **Wicking bed (cruciferous/roots)** — Vigo wicking floor (~1 ft) + reservoir + level indicator; greenhouse cover for winter. Brussels sprouts, broccoli (bolted), carrots (bolted, soil too shallow), beets, transplanted chard, fennel; prior radishes (failed), broccoli rabe. Irrigation often off (wicking).
2. **Trial bed** — newest (former "cold plunge"); 1 tomato + 2 cucumbers; trellis; getting its own irrigation node.
3. **Berry/potato/asparagus** — strawberries (left, moldy) + potatoes (right, surprise volunteers); intended asparagus; random carrots. Needs soil + thinning.
4. **Peppers + eggplant** — Vigo wicking; heat-retaining greenhouse cover; Govee sensor. Peppers (Anaheim, jalapeño, cherry, bell, shishito, ancho, padrone), eggplants (incl. Japanese/long), one Suyo cucumber. Warm/fruiting → need pollination.
5. **Front tomato bed (big)** — many tomatoes (Gold Dust, Manana Orange, Hillbilly heirloom, Early Annie, Roma/Orange Roma/San Marzano?, Moskovich, Isichka, Japanese Black, cherries) + back row of peas (snap/snow/shell — labels lost). Note: plants that sat under the greenhouse cover are markedly larger; cover removed ~June 10–11.
6. **Peas** — long Vigo, **no** wicking floor, has greenhouse cover; shell vs sugar/snap uncertain.
7. **Potatoes + old fennel** — irrigation line ends here (3 emitters; adding a 4th).
8. **She-shed squash bed** — zucchini, butternut, scallop/pattypan, delicata, acorn, winter squash, pumpkins/jack-o-lantern; 2 rhubarb; random + white strawberries; 2 celery; yellow squash.
- **Greenhouse (8×6, ~48 sq ft):** hanging cucumbers (Suyo/Sano, Parisian, Diva), late peppers (ancho, bell, shishito, jalapeño), eggplant, Japanese Black tomato, "Tiny Tim" tomato; misting irrigation.
- **Near patio:** avocado (pot), lime + lemon trees.
- **She-shed top:** strawberry flowerbed + strawberry/tomato pots.

### Zone 2 — brassicas, shade ("other side of yard"; aluminum raised beds; partial shade)
Broccoli rabe, carrots, multiple kales, green/regular onions, spinach (overgrown), broccoli, fennel, sweet potato ("Soup" gift), Brussels sprouts; second bed: celery, potatoes, bolted kale, onions, Brussels sprouts. Candidate for a soaker-hose/sprinkler zone.

### Zone 3 — herbs + lettuce (patio by back door)
- **Herbs:** mint, sage, chives, cilantro/parsley, Thai + regular + purple basil, rosemary (×2), thyme, oregano, arugula, kale, a cucumber.
- **Lettuce bed:** Vigo raised, no reservoir, mesh cover (birds eat seeds): romaine, radicchio, "spiky" lettuces. Mister planned (anti-bolt). Irrigation waiting on tubing (delayed to ~July).

### Perimeter — fruit + berries (fences/edges)
- **Trees:** 2 plum (flowered, no fruit; previously cut back; maybe remove), 2 apple (one little; one multi-graft Honeycrisp/Braeburn/Fuji/Gala, a Braeburn branch dead, fruiting), cherry (prune lower branches), pear (prune/top), fig (dead), camellia (ornamental).
- **Berries:** 2–3 blueberry (different cultivars), 3 raspberry, 1 blackberry; roses (ornamental) by the blueberries.

### Systems & cross-cutting equipment
- **Irrigation network** — hose-fed; multiple nodes; per-bed on/off; bendable nozzles; ~3 emitters/bed (adding more); greenhouse misters; Vigo mister lines; soaker-hose option; wicking beds intentionally off.
- **Covers** — heat/greenhouse vs mesh/shade; sizes; pole sets; shared/movable.
- **Sensors** — 2× Govee Bluetooth temp/humidity (bed 4 + greenhouse); unreliable.

### Recurring problems → tasks
Shallow soil (carrots, asparagus) · bolting (broccoli, kale, lettuce) · mold (strawberries) · lost/illegible labels · surprise volunteers (potatoes).
**Punch-list:** pull bolted broccoli · add soil to beds 1/3 · thin asparagus · add 4th emitter to potato bed · connect Zone 3 irrigation (await tubing ~July) · prune cherry lowers · prune/top pear · decide plum removal · trellis trial-bed cucumber · reduce celery · add mister to lettuce bed · consider soaker hose for Zone 2.

---

## Build decisions (this session)

- **v1 slice:** Map-first, manual/guided entry, single garden. (Voice ingestion → v1.5; recommendations later.)
- **Platform:** Mobile-first responsive web that also renders beautifully on desktop; installable PWA with offline support (garden = bad signal). Not native.
- **Built by:** Solo + AI tools (Claude Code) → plan must be small, well-specified, independently-verifiable chunks on an AI-fluent stack.
- **Mental model for v1:** a lightweight *design canvas for gardens* (Figma-lite), not a Google-Maps clone.

### Recommended stack
- **App:** Vite + React + TypeScript.
- **Styling:** Tailwind + shadcn/ui.
- **Map renderer (the key spike):** SVG + d3-zoom for crisp, beautiful vector + semantic zoom; **react-konva (Canvas)** as the fallback if interaction/perf demands it. De-risk with a 1–2 day spike on zoom + drag feel before committing.
- **State:** Zustand.
- **Storage:** Local-first via Dexie/IndexedDB → Supabase for accounts/sync/photos at v1.5. (Supabase + Vercel connectors already available.)
- **Voice (v1.5):** transcription (browser/Whisper) → Claude API → structured JSON. "Claude in the loop."
- **Deploy:** Vercel.

### Still open before the phased plan
- Timeline & stakes (weekend/portfolio vs. real product vs. business).
- One aesthetic reference app ("make it feel like that").
- Riskiest assumption v1 should prove (working default: "the map is something people love and will maintain").
