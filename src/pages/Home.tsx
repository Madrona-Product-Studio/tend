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

      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
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
            className="inline-flex items-center rounded-card bg-seal px-6 py-3 text-sm font-semibold text-card transition-opacity hover:opacity-90"
          >
            View demo
          </Link>
        </div>
        <p className="mt-4 text-[12px] text-faint">Demo mode · sample garden</p>
      </main>
    </>
  );
}
