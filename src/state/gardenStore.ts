import { create } from 'zustand';
import type { Bed, BedLayout, BedShape, GardenTree, ID, Plant, Rect } from '@/domain';
import {
  loadGardenTree, setTaskDone, savePlantArrangement, insertPlant, deletePlant, saveBedLayout, insertBed, saveBedGeometry,
} from '@/data/repo';
import { seedIfEmpty } from '@/data/seed';

type Status = 'idle' | 'loading' | 'ready' | 'missing' | 'error';

interface GardenStore {
  tree: GardenTree | null;
  status: Status;
  load: (gardenId: ID) => Promise<void>;
  toggleTask: (taskId: ID, done: boolean) => Promise<void>;
  setPlantArrangement: (updates: { id: ID; row: number; order: number }[]) => Promise<void>;
  addPlant: (plant: Plant) => Promise<void>;
  removePlant: (plantId: ID) => Promise<void>;
  setBedLayout: (bedId: ID, layout: BedLayout) => Promise<void>;
  addBed: (bed: Bed) => Promise<void>;
  setBedGeometry: (bedId: ID, footprint: Rect, shape?: BedShape) => Promise<void>;
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

  setPlantArrangement: async (updates) => {
    const { tree } = get();
    if (!tree) return;
    const byId = new Map(updates.map((u) => [u.id, u]));
    set({
      tree: {
        ...tree,
        plants: tree.plants.map((p) => {
          const u = byId.get(p.id);
          return u ? { ...p, row: u.row, order: u.order } : p;
        }),
      },
    });
    await savePlantArrangement(updates);
  },

  addPlant: async (plant) => {
    const { tree } = get();
    if (!tree) return;
    set({ tree: { ...tree, plants: [...tree.plants, plant] } });
    await insertPlant(plant);
  },

  removePlant: async (plantId) => {
    const { tree } = get();
    if (!tree) return;
    set({
      tree: {
        ...tree,
        plants: tree.plants.filter((p) => p.id !== plantId),
        observations: tree.observations.filter((o) => o.plantId !== plantId),
      },
    });
    await deletePlant(plantId);
  },

  setBedLayout: async (bedId, layout) => {
    const { tree } = get();
    if (!tree) return;
    set({ tree: { ...tree, beds: tree.beds.map((b) => (b.id === bedId ? { ...b, layout } : b)) } });
    await saveBedLayout(bedId, layout);
  },

  addBed: async (bed) => {
    const { tree } = get();
    if (!tree) return;
    set({ tree: { ...tree, beds: [...tree.beds, bed] } });
    await insertBed(bed);
  },

  setBedGeometry: async (bedId, footprint, shape) => {
    const { tree } = get();
    if (!tree) return;
    set({ tree: { ...tree, beds: tree.beds.map((b) => (b.id === bedId ? { ...b, footprint, ...(shape ? { shape } : {}) } : b)) } });
    await saveBedGeometry(bedId, footprint, shape);
  },
}));
