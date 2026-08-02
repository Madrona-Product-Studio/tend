// The vision page — the product story that otherwise lives only in the brief:
// the Sonos model, the living map, year-over-year refinement, and an honest
// roadmap. Marketing surface: quiet, typographic, no app chrome.
import { Link } from 'react-router-dom';
import { Breath, Hairline, Label, Mark } from '@design/primitives';
import { T } from '@design/tokens';
import { StudioContact, MarketingFooter } from '@components/MadronaContact';

const SECTIONS = [
  {
    title: 'A map, not a list',
    body: `Most garden apps are spreadsheets wearing leaves. GardenHQ starts from the way a gardener actually thinks: spatially. Zones, beds, and plantings are drawn where they really are, and you drill in the way you walk the garden: the whole plot, then a zone, then a single bed and what's growing in it.`,
  },
  {
    title: 'The Sonos model',
    body: `A garden isn't a flat list of plants. It's a composable system: covers, sensors, and irrigation nodes are a shared, limited inventory that moves between beds as the season demands, exactly like speakers moving between rooms. GardenHQ treats them as first-class objects. Reassign a heat cover to the pea bed, and the map knows.`,
  },
  {
    title: 'A living map',
    body: `Bed state lives on the map: reservoir levels, greenhouse temperature and humidity, irrigation on or off. That turns a diagram into a spatial dashboard. Open the app and see that the pepper bed is running hot before you've put your boots on.`,
  },
  {
    title: 'Year over year',
    body: `The long game is memory. Notes, tasks, and observations accumulate into a record of what actually worked: which cover made the tomatoes bigger, which bed bolts first, where the soil runs shallow. Every season starts smarter than the last.`,
  },
];

const ROADMAP: { label: string; text: string }[] = [
  { label: 'Today', text: 'The living map: zones, beds, plantings, movable equipment, live state, tasks and observations. Local-first and offline-capable, because gardens have terrible signal.' },
  { label: 'Next', text: 'Accounts and sync, and the voice walkthrough: record yourself walking the garden, and GardenHQ drafts the beds, plants, and punch-list for you. You just arrange the map.' },
  { label: 'Later', text: 'Season history and recommendations, driven by plant attributes and your garden’s own record.' },
];

export default function About() {
  return (
    <>
      <title>About · GardenHQ</title>
      <meta
        name="description"
        content="Why GardenHQ exists: a spatially-true, living map of your food garden, built for year-over-year improvement."
      />
      <link rel="canonical" href="https://gardenhq.app/about" />

      <main className="min-h-screen max-w-2xl mx-auto px-6 py-14 sm:px-10 sm:py-20">
        <Link to="/" aria-label="GardenHQ home" className="inline-block">
          <Mark id="leaf" size={40} color={T.seal} sw={2.4} />
        </Link>

        <div className="mt-10">
          <Label className="text-clay">About GardenHQ</Label>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-[-0.035em] leading-none text-ink">
            The garden is a system.
          </h1>
          <Breath className="mt-5 max-w-xl">
            GardenHQ helps home gardeners and small hobby farms map, organize,
            and improve their gardens, year over year.
          </Breath>
        </div>

        <Hairline className="mt-10 mb-10" />

        <div className="flex flex-col gap-9">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="m-0 text-[17px] font-semibold tracking-[-0.01em] text-ink">{s.title}</h2>
              <p className="m-0 mt-2 text-[15px] leading-[1.7] text-ink70">{s.body}</p>
            </section>
          ))}
        </div>

        <Hairline className="mt-10 mb-10" />

        <section>
          <Label className="text-clay">Where it&rsquo;s going</Label>
          <div className="mt-4 border-t border-line">
            {ROADMAP.map((r, i) => (
              <div key={r.label}
                className={`flex gap-5 py-4 border-b ${i === ROADMAP.length - 1 ? 'border-line' : 'border-line-soft'}`}>
                <span className="w-14 shrink-0 text-[11px] font-bold uppercase tracking-[0.14em] text-clay pt-0.5">{r.label}</span>
                <p className="m-0 text-[14px] leading-[1.65] text-ink70">{r.text}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 flex items-center gap-5">
          <Link
            to="/garden/demo"
            className="cta-seal inline-flex min-h-[48px] items-center rounded-card bg-seal px-7 text-sm font-semibold text-card hover:opacity-90"
          >
            View demo
          </Link>
          <Link to="/" className="text-[13px] font-semibold text-clay hover:text-ink transition-colors">
            Back home
          </Link>
        </div>

        <StudioContact from="about" className="mt-16 border-t border-line pt-10" />
      </main>
      <MarketingFooter />
    </>
  );
}
