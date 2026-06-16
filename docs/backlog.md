# Tend — backlog

Living list of ideas not yet scheduled (newest at top). Product context: `docs/tend-brief.md`. Strategy: the positioning/moat memory (systems + live state + the serious-home tier).

## Features / ideas

### Temperature → crop-production insight
- **Idea:** Use temperature for an area (zone/bed) to show how its thermal conditions influence what grows well there and crop production/yield.
- **Why it fits the moat:** turns the **live temperature** data (sensors) into an actual **recommendation** — the refinement layer. The brief flags soil temperature + microclimate as key environment dimensions, and warm crops need ~60–70°F soil temp (the PNW limiting factor). Plantings already carry a `soilTempNeedF` attribute, so the data hooks exist.
- **Rough shape:** track temperature over time per area → compute a thermal profile (highs/lows, time spent in warm-crop range, maybe growing-degree-days) → compare against the soil-temp needs of the crops planted there → surface insight: *"this bed runs hot — great for peppers"* / *"this shady zone rarely reaches warm-crop soil temp — why the eggplant struggles."*
- **Depends on:** real/continuous temperature history (currently readings are a single hand-seeded value; needs sensor feeds or logging over time — v1.5 integration territory).
- **Added:** 2026-06-15.
