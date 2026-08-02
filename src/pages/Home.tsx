import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Breath, Label, Mark } from '@design/primitives';
import { T } from '@design/tokens';
import { StudioContact, MarketingFooter } from '@components/MadronaContact';

const WHY = [
  {
    title: 'Spatially true',
    body: 'Zones, beds, and plantings drawn where they actually are. Drill from the whole garden down to a single plant.',
  },
  {
    title: 'Live systems',
    body: 'Sensors, reservoirs, covers, and irrigation are part of the map: 88° in the pepper bed, reservoir at 60%, right now.',
  },
  {
    title: 'Year over year',
    body: 'Notes, tasks, and observations accumulate into a record of what worked, so next season starts smarter.',
  },
];

export default function Home() {
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
            <div className="mt-9">
              <Link
                to="/garden/demo"
                className="cta-seal inline-flex min-h-[48px] items-center rounded-card bg-seal px-7 text-sm font-semibold text-card hover:opacity-90"
              >
                View demo
              </Link>
            </div>
            <Link to="/about" className="mt-5 text-[13px] font-semibold text-clay hover:text-ink transition-colors">
              About GardenHQ
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16 sm:px-10 sm:py-24">
          <Label className="text-clay">Why a map</Label>
          <Breath className="mt-3 max-w-2xl">
            A garden is a system: beds, water, covers, sensors. GardenHQ puts
            the whole thing on one living map.
          </Breath>

          <div className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-10">
            {WHY.map((w) => (
              <div key={w.title}>
                <h2 className="m-0 text-[15px] font-semibold tracking-[-0.01em] text-ink">{w.title}</h2>
                <p className="m-0 mt-1.5 text-[13.5px] leading-[1.6] text-clay">{w.body}</p>
              </div>
            ))}
          </div>

          {/* Real product UI, sized for the viewer: phones get the bed view
              (portrait, legible); desktop gets the zone map (wide). */}
          <figure className="m-0 mt-12 mx-auto max-w-[420px] sm:max-w-none rounded-card border border-line bg-card p-2 sm:p-3">
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

          <div className="mt-12 flex items-center justify-center gap-6">
            <Link
              to="/garden/demo"
              className="cta-seal inline-flex min-h-[48px] items-center rounded-card bg-seal px-7 text-sm font-semibold text-card hover:opacity-90"
            >
              View demo
            </Link>
            <Link to="/about" className="text-[13px] font-semibold text-clay hover:text-ink transition-colors">
              About GardenHQ
            </Link>
          </div>

          <WaitlistSignup />

          <StudioContact from="landing" className="mt-16 border-t border-line pt-10" />
        </section>

        <MarketingFooter />
      </main>
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
        Want a map of your own garden? Leave an email and we&rsquo;ll write
        when accounts open.
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
