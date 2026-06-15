import { create } from 'zustand';
import type { Bed, BedLayout, BedShape, GardenTree, ID, Observation, Plant, Rect } from '@/domain';
import {
  loadGardenTree, setTaskDone, savePlantArrangement, insertPlant, deletePlant, saveBedLayout, insertBed, saveBedGeometry,
  renameZone, renameBed, addObservation, deleteObservation,
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
  renameZone: (zoneId: ID, name: string) => Promise<void>;
  renameBed: (bedId: ID, name: string) => Promise<void>;
  addObservation: (input: { bedId?: ID; plantId?: ID; zoneId?: ID; text: string }) => Promise<void>;
  removeObservation: (id: ID) => Promise<void>;
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

  renameZone: async (zoneId, name) => {
    const { tree } = get();
    if (!tree) return;
    set({ tree: { ...tree, zones: tree.zones.map((z) => (z.id === zoneId ? { ...z, name } : z)) } });
    await renameZone(zoneId, name);
  },

  renameBed: async (bedId, name) => {
    const { tree } = get();
    if (!tree) return;
    set({ tree: { ...tree, beds: tree.beds.map((b) => (b.id === bedId ? { ...b, name } : b)) } });
    await renameBed(bedId, name);
  },

  addObservation: async (input) => {
    const { tree } = get();
    if (!tree) return;
    const obs: Observation = {
      id: crypto.randomUUID(),
      gardenId: tree.garden.id,
      bedId: input.bedId,
      plantId: input.plantId,
      zoneId: input.zoneId,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      text: input.text,
      createdAt: Date.now(),
    };
    set({ tree: { ...tree, observations: [obs, ...tree.observations] } });
    await addObservation(obs);
  },

  removeObservation: async (id) => {
    const { tree } = get();
    if (!tree) return;
    set({ tree: { ...tree, observations: tree.observations.filter((o) => o.id !== id) } });
    await deleteObservation(id);
  },
}));
