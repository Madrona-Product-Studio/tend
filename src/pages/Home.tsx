import { Link } from 'react-router-dom';
import { Mark } from '@design/primitives';
import { T } from '@design/tokens';

export default function Home() {
  return (
    <>
      {/* React 19 native document metadata (hoisted to <head>) */}
      <title>GardenHQ — map and manage your garden</title>
      <meta
        name="description"
        content="A beautiful, spatially-true map of your food garden — zones, beds, plants, and the systems that serve them."
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
              Map, organize, and improve your food garden — year over year.
            </p>
            <div className="mt-9">
              <Link
                to="/garden/demo"
                className="home-hero__cta inline-flex min-h-[48px] items-center rounded-card bg-seal px-7 text-sm font-semibold text-card hover:opacity-90"
              >
                View demo
              </Link>
            </div>
            <p className="mt-4 text-[12px] text-faint">Demo mode · sample garden</p>
          </div>
        </section>
      </main>
    </>
  );
}
