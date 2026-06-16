# Tend — backlog

Living list of ideas not yet scheduled (newest at top). Product context: `docs/tend-brief.md`. Strategy: the positioning/moat memory (systems + live state + the serious-home tier).

## Principles

### Every systems feature must answer a real question (not just model data)
Test before building any equipment/irrigation/sensor surface: *what question does this answer for the grower?* If it's just an editable list, it reads as data entry and confuses ("not sure what this adds" — feedback 2026-06-15).

## Features / ideas

### Make equipment "earn its place" (rework the Equipment screen)
The standalone Equipment screen shows data (list + reassign dropdowns) without communicating value. Movable-equipment tracking is worth it only if it answers:
- **Where's my gear?** (limited, shared, physically moved → app = source of truth)
- **What's exposed / unmonitored?** (beds with no cover before a cold snap; beds with no sensor)
- **Do I have enough + where should it go?** (3 covers, 8 beds → scarcity/reallocation = the Sonos tension)
- **Live data needs a location** (a reading means nothing without its bed; moving the sensor moves the live map)
- **Explains outcomes** (cover until Jun 10 → bigger tomatoes; placement is a variable in the year-over-year experiment → ties to notes + recommendations)
- **Direction:** surface equipment *in context* (on the bed/map, assignable there — where the decision happens) + a lean inventory for "what's free / what's uncovered," instead of an abstract list.
- **Added:** 2026-06-15.



### Temperature → crop-production insight
- **Idea:** Use temperature for an area (zone/bed) to show how its thermal conditions influence what grows well there and crop production/yield.
- **Why it fits the moat:** turns the **live temperature** data (sensors) into an actual **recommendation** — the refinement layer. The brief flags soil temperature + microclimate as key environment dimensions, and warm crops need ~60–70°F soil temp (the PNW limiting factor). Plantings already carry a `soilTempNeedF` attribute, so the data hooks exist.
- **Rough shape:** track temperature over time per area → compute a thermal profile (highs/lows, time spent in warm-crop range, maybe growing-degree-days) → compare against the soil-temp needs of the crops planted there → surface insight: *"this bed runs hot — great for peppers"* / *"this shady zone rarely reaches warm-crop soil temp — why the eggplant struggles."*
- **Depends on:** real/continuous temperature history (currently readings are a single hand-seeded value; needs sensor feeds or logging over time — v1.5 integration territory).
- **Added:** 2026-06-15.
