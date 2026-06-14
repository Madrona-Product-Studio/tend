# CLAUDE.md

## What this is
Tend is a web app for home gardeners to map and manage their food gardens — vegetables, fruits, herbs. Users create gardens, define zones and beds, track what's planted, and log tending activity (watering, fertilizing, harvesting).

## Stack
- React + Vite 6
- Tailwind CSS v4 (`@tailwindcss/vite` plugin)
- Supabase (auth + database)
- react-router-dom v6
- Deployed on Vercel

## Path aliases
`@components`, `@pages`, `@data`, `@services`, `@hooks`, `@utils` all resolve to their `src/` subdirectory.

## Data model (planned)
- **Gardens** — top-level container (a user's property or plot)
- **Zones** — named areas within a garden (e.g. "Back raised beds", "Orchard corner")
- **Beds** — individual planting areas within a zone, with type (raised/in-ground/container), dimensions, soil notes
- **Plantings** — what's in a bed: plant variety, date planted, expected harvest window
- **Tend logs** — activity records: watering, fertilizing, pruning, harvesting

## Env vars
Copy `.env.example` → `.env` and fill in Supabase credentials.

## Dev
`npm run dev`
