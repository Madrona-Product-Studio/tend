import { create } from 'zustand';
import type { GardenTree, ID } from '@/domain';
import { loadGardenTree, setTaskDone } from '@/data/repo';
import { seedIfEmpty } from '@/data/seed';

type Status = 'idle' | 'loading' | 'ready' | 'missing' | 'error';

interface GardenStore {
  tree: GardenTree | null;
  status: Status;
  load: (gardenId: ID) => Promise<void>;
  toggleTask: (taskId: ID, done: boolean) => Promise<void>;
}

export const useGardenStore = create<GardenStore>((set, get) => ({
  tree: null,
  status: 'idle',

  load: async (gardenId) => {
    set({ status: 'loading' });
    try {
      await seedIfEmpty();
      const tree = await loadGardenTree(gardenId);
      set({ tree, status: tree ? 'ready' : 'missing' });
    } catch (err) {
      console.error('Failed to load garden', err);
      set({ status: 'error' });
    }
  },

  toggleTask: async (taskId, done) => {
    await setTaskDone(taskId, done);
    const { tree } = get();
    if (!tree) return;
    set({
      tree: { ...tree, tasks: tree.tasks.map((t) => (t.id === taskId ? { ...t, done } : t)) },
    });
  },
}));
