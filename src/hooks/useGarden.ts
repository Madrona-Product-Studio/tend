import { useEffect } from 'react';
import { useGardenStore } from '@/state/gardenStore';
import type { ID } from '@/domain';

/** Loads (and first-run seeds) a garden tree from local storage. */
export function useGarden(gardenId: ID) {
  const tree = useGardenStore((s) => s.tree);
  const status = useGardenStore((s) => s.status);
  const load = useGardenStore((s) => s.load);
  const toggleTask = useGardenStore((s) => s.toggleTask);

  useEffect(() => {
    void load(gardenId);
  }, [gardenId, load]);

  return { tree, status, toggleTask };
}
