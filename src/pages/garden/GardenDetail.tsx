import { useParams, Link } from 'react-router-dom';
import { Label, Breath } from '@design/primitives';

export default function GardenDetail() {
  const { gardenId } = useParams<{ gardenId: string }>();

  return (
    <>
      <title>{`Garden · Tend`}</title>
      <meta name="robots" content="noindex" />

      <main className="min-h-screen px-6 py-12 sm:px-12 sm:py-16 max-w-3xl mx-auto">
        <Link to="/" className="text-sm text-muted hover:text-ink70 transition-colors">← Tend</Link>
        <div className="mt-8">
          <Label className="text-clay">Garden</Label>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-[-0.025em] text-ink">
            {gardenId}
          </h1>
          <Breath className="mt-4 max-w-xl">
            The map lives here. Next we build the typed garden model and the
            semantic-zoom canvas — zones resolve into beds, beds into plants.
          </Breath>
        </div>
      </main>
    </>
  );
}
