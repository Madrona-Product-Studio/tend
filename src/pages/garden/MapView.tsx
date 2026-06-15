import { useParams } from 'react-router-dom';
import { useGarden } from '@/hooks/useGarden';
import { GardenMap } from '@/map/GardenMap';

export default function MapView() {
  const { gardenId = 'demo' } = useParams<{ gardenId: string }>();
  const { tree, status } = useGarden(gardenId);

  return (
    <>
      <title>Map · Tend</title>
      <meta name="robots" content="noindex" />

      {status !== 'ready' && (
        <div className="min-h-screen flex items-center justify-center text-sm text-muted">
          {status === 'error' ? 'Something went wrong loading the garden.' : 'Loading the garden…'}
        </div>
      )}
      {tree && status === 'ready' && <GardenMap key={gardenId} tree={tree} />}
    </>
  );
}
