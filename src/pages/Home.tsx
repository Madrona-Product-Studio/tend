import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Breath, Label, Mark } from '@design/primitives';
import { T } from '@design/tokens';
import { StudioContact, MarketingFooter } from '@components/MadronaContact';
import { NewGardenDialog } from '@components/NewGardenDialog';
import { listGardens, insertGarden, insertGardenContents } from '@/data/repo';
import { DEMO_GARDEN_ID } from '@/data/seed';
import type { GardenTemplateContents } from '@/data/gardenTemplates';
import type { Garden } from '@/domain';

// The product thesis, condensed from the About page. Each pillar is a single
// idea a first-time viewer should leave with.
const PILLARS = [
  {
    title: 'A map, not a list',
    body: 'Most garden apps are spreadsheets wearing leaves. GardenHQ draws zones, beds, and plantings where they actually are, and you drill in the way you walk the garden.',
  },
  {
    title: 'Movable systems',
    body: 'Covers, sensors, and irrigation are a shared, limited inventory that moves between beds as the season demands, like speakers between rooms. Reassign a heat cover, and the map knows.',
  },
  {
    title: 'Live state',
    body: 'Reservoir levels, greenhouse temperature and humidity, irrigation on or off, all on the map. See that the pepper bed is running hot before you put your boots on.',
  },
  {
    title: 'Year over year',
    body: 'Notes, tasks, and observations build into a record of what actually worked, so every season starts smarter than the last.',
  },
];

// The three-beat "how it works" walk: lay it out, wire up the systems, improve.
const STEPS = [
  {
    n: '01',
    title: 'Map your garden',
    body: 'Lay out zones, beds, and what is planted where. Start from a bed preset or draw your own.',
  },
  {
    n: '02',
    title: 'Add the systems',
    body: 'Place sensors, covers, reservoirs, and irrigation, then move them between beds as the season changes.',
  },
  {
    n: '03',
    title: 'Improve every season',
    body: 'Track tasks and observations against each bed, and carry the record forward year over year.',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [building, setBuilding] = useState(false);
  const [gardens, setGardens] = useState<Garden[]>([]);

  // Gardens the user has built here (local-first) — for re-entry. The demo is
  // shown via its own CTA, so it's excluded from this list.
  useEffect(() => {
    void listGardens().then((all) => setGardens(all.filter((g) => g.id !== DEMO_GARDEN_ID)));
  }, []);

  const createGarden = async (garden: Garden, contents: GardenTemplateContents | null) => {
    await insertGarden(garden);
    if (contents) await insertGardenContents(contents);
    navigate(`/garden/${garden.id}`);
  };

  return (
    <>
      {/* React 19 native document metadata (hoisted to <head>) */}
      <title>GardenHQ · map and manage your garden</title>
      <meta
        name="description"
        content="A beautiful, spatially-true map of your food garden: zones, beds, plants, and the systems that serve them."
      />
      <link rel="canonical" href="https://gardenhq.app/" />

      <main>
        <section className="home-hero">
          {/* Decorative garden photograph — desktop wide / mobile portrait.
              WebP preferred, PNG fallback. Above the fold, so eager + high pri. */}
          <picture className="home-hero__media" aria-hidden="true">
            <source
              media="(max-width: 767px)"
              type="image/webp"
              srcSet="/images/gardenhq/gardenhq-hero-mobile.webp"
            />
            <source
              media="(max-width: 767px)"
              srcSet="/images/gardenhq/gardenhq-hero-mobile.png"
            />
            <source
              type="image/webp"
              srcSet="/images/gardenhq/gardenhq-hero-desktop.webp"
            />
            <img
              src="/images/gardenhq/gardenhq-hero-desktop.png"
              alt=""
              fetchPriority="high"
              decoding="async"
            />
          </picture>

          <div className="home-hero__content">
            <Mark id="leaf" size={56} color={T.seal} sw={2.2} />
            <h1 className="mt-6 text-5xl sm:text-7xl font-bold tracking-[-0.035em] text-ink leading-none">
              GardenHQ
            </h1>
            <p className="mt-4 max-w-md text-clay text-[17px] sm:text-xl leading-[1.5]">
              Map, organize, and improve your food garden, year over year.
            </p>
            <p className="mt-3 text-[13px] sm:text-[14px] font-medium text-ink70">
              Every bed, plant, and sensor on one living map.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setBuilding(true)}
                className="cta-seal inline-flex min-h-[48px] items-center rounded-card bg-seal px-7 text-sm font-semibold text-card hover:opacity-90"
              >
                Build a garden
              </button>
              <Link
                to="/garden/demo"
                className="inline-flex min-h-[48px] items-center rounded-card border border-line bg-card px-7 text-sm font-semibold text-ink70 hover:border-ink70 transition-colors"
              >
                View demo
              </Link>
            </div>
            <Link to="/about" className="mt-5 text-[13px] font-semibold text-clay hover:text-ink transition-colors">
              About GardenHQ
            </Link>
          </div>
        </section>

        {gardens.length > 0 && (
          <section className="mx-auto max-w-4xl px-6 pt-14 sm:px-10">
            <Label className="text-clay">Your gardens</Label>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {gardens.map((g) => (
                <Link
                  key={g.id}
                  to={`/garden/${g.id}`}
                  className="tactile rounded-card border border-line bg-card p-4 hover:border-ink70"
                >
                  <div className="text-[15px] font-semibold text-ink">{g.name}</div>
                  <div className="mt-0.5 text-[11px] text-muted">Open your map →</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mx-auto max-w-4xl px-6 py-16 sm:px-10 sm:py-24">
          <Label className="text-clay">Why GardenHQ</Label>
          <h2 className="mt-3 max-w-2xl text-3xl sm:text-4xl font-bold tracking-[-0.03em] leading-[1.05] text-ink">
            The garden is a system, not a spreadsheet.
          </h2>
          <Breath className="mt-4 max-w-2xl">
            Beds, water, covers, sensors: GardenHQ puts the whole thing on one
            living map, and keeps its state in front of you.
          </Breath>

          <div className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2">
            {PILLARS.map((p) => (
              <div key={p.title}>
                <h3 className="m-0 text-[16px] font-semibold tracking-[-0.01em] text-ink">{p.title}</h3>
                <p className="m-0 mt-2 text-[14px] leading-[1.65] text-clay">{p.body}</p>
              </div>
            ))}
          </div>

          {/* Real product UI, sized for the viewer: phones get the bed view
              (portrait, legible); desktop gets the zone map (wide). */}
          <figure className="m-0 mt-14 mx-auto max-w-[420px] sm:max-w-none rounded-card border border-line bg-card p-2 sm:p-3">
            <picture>
              <source media="(max-width: 767px)" srcSet="/images/gardenhq/product-bed-live.png" />
              <img
                src="/images/gardenhq/product-zone-map.png"
                alt="GardenHQ in action: live temperature, humidity, and reservoir readings on the garden map"
                loading="lazy"
                decoding="async"
                className="block w-full rounded-lg"
              />
            </picture>
          </figure>

          <div className="mt-16 border-t border-line pt-12">
            <Label className="text-clay">How it works</Label>
            <div className="mt-8 grid gap-8 sm:grid-cols-3 sm:gap-10">
              {STEPS.map((s) => (
                <div key={s.n}>
                  <span className="text-[13px] font-bold tracking-[0.06em] text-seal">{s.n}</span>
                  <h3 className="m-0 mt-2 text-[16px] font-semibold tracking-[-0.01em] text-ink">{s.title}</h3>
                  <p className="m-0 mt-1.5 text-[14px] leading-[1.65] text-clay">{s.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center gap-5">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setBuilding(true)}
                className="cta-seal inline-flex min-h-[48px] items-center rounded-card bg-seal px-7 text-sm font-semibold text-card hover:opacity-90"
              >
                Build a garden
              </button>
              <Link
                to="/garden/demo"
                className="inline-flex min-h-[48px] items-center rounded-card border border-line bg-card px-7 text-sm font-semibold text-ink70 hover:border-ink70 transition-colors"
              >
                View demo
              </Link>
            </div>
            <Link to="/about" className="text-[13px] font-semibold text-clay hover:text-ink transition-colors">
              About GardenHQ
            </Link>
          </div>

          <WaitlistSignup />

          <StudioContact from="landing" className="mt-16 border-t border-line pt-10" />
        </section>

        <MarketingFooter />
      </main>

      {building && <NewGardenDialog onClose={() => setBuilding(false)} onCreate={createGarden} />}
    </>
  );
}

// Email capture for the v1.5 accounts waitlist. Renders only when a capture
// endpoint (Formspree-compatible JSON POST) is configured — never a form that
// silently drops emails.
function WaitlistSignup() {
  const endpoint = import.meta.env.VITE_WAITLIST_ENDPOINT as string | undefined;
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  if (!endpoint) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || state === 'sending') return;
    setState('sending');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      setState(res.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  };

  return (
    <div className="mt-16 border-t border-line pt-10 text-center">
      <Label className="text-clay">Early access</Label>
      <p className="mx-auto mt-2 max-w-md text-[14px] leading-[1.6] text-clay">
        A garden you build here saves to this device. Leave an email and
        we&rsquo;ll write when accounts open, so you can save and sync it
        everywhere.
      </p>
      {state === 'done' ? (
        <p className="mt-5 text-[14px] font-semibold text-live">You&rsquo;re on the list.</p>
      ) : (
        <form onSubmit={submit} className="mx-auto mt-5 flex max-w-sm gap-2">
          <label className="flex-1">
            <span className="sr-only">Email address</span>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full min-h-[44px] rounded-card border border-line bg-card px-3 text-[14px] text-ink outline-none focus:border-ink"
            />
          </label>
          <button
            type="submit" disabled={state === 'sending'}
            className="cta-seal min-h-[44px] rounded-card bg-seal px-5 text-sm font-semibold text-card hover:opacity-90 disabled:opacity-40"
          >
            {state === 'sending' ? 'Joining…' : 'Join'}
          </button>
        </form>
      )}
      {state === 'error' && (
        <p className="mt-3 text-[12px] text-seal">Something went wrong. Please try again.</p>
      )}
    </div>
  );
}
