import { create } from 'zustand';
import type { Bed, BedLayout, BedShape, Cover, EquipmentKind, GardenTree, ID, IrrigationNode, Observation, Plant, Rect, Sensor, Task, Zone } from '@/domain';
import {
  loadGardenTree, setTaskDone, savePlantArrangement, insertPlant, deletePlant, saveBedLayout, insertBed, saveBedGeometry,
  renameZone, renameBed, addObservation, deleteObservation, addTask, deleteTask, setEquipmentAssignment, setIrrigationOn,
  insertZone, renameGarden, updatePlant, insertCover, insertSensor, insertIrrigation, deleteEquipment,
} from '@/data/repo';
import { seedIfEmpty } from '@/data/seed';

type Status = 'idle' | 'loading' | 'ready' | 'missing' | 'error';

interface GardenStore {
  tree: GardenTree | null;
  status: Status;
  load: (gardenId: ID) => Promise<void>;
  toggleTask: (taskId: ID, done: boolean) => Promise<void>;
  addTask: (input: { bedId?: ID; zoneId?: ID; text: string }) => Promise<void>;
  removeTask: (id: ID) => Promise<void>;
  setPlantArrangement: (updates: { id: ID; row: number; order: number }[]) => Promise<void>;
  addPlant: (plant: Plant) => Promise<void>;
  removePlant: (plantId: ID) => Promise<void>;
  updatePlant: (id: ID, patch: Partial<Plant>) => Promise<void>;
  addCover: (cover: Cover) => Promise<void>;
  addSensor: (sensor: Sensor) => Promise<void>;
  addIrrigation: (node: IrrigationNode) => Promise<void>;
  removeEquipment: (kind: EquipmentKind, id: ID) => Promise<void>;
  setBedLayout: (bedId: ID, layout: BedLayout) => Promise<void>;
  addBed: (bed: Bed) => Promise<void>;
  addZone: (zone: Zone) => Promise<void>;
  renameGarden: (name: string) => Promise<void>;
  setBedGeometry: (bedId: ID, footprint: Rect, shape?: BedShape) => Promise<void>;
  renameZone: (zoneId: ID, name: string) => Promise<void>;
  renameBed: (bedId: ID, name: string) => Promise<void>;
  addObservation: (input: { bedId?: ID; plantId?: ID; zoneId?: ID; text: string }) => Promise<void>;
  removeObservation: (id: ID) => Promise<void>;
  reassignEquipment: (kind: EquipmentKind, id: ID, assignedBedId?: ID) => Promise<void>;
  setIrrigationOn: (nodeId: ID, on: boolean) => Promise<void>;
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

  updatePlant: async (id, patch) => {
    const { tree } = get();
    if (!tree) return;
    set({ tree: { ...tree, plants: tree.plants.map((p) => (p.id === id ? { ...p, ...patch } : p)) } });
    await updatePlant(id, patch);
  },

  addCover: async (cover) => {
    const { tree } = get();
    if (!tree) return;
    set({ tree: { ...tree, covers: [...tree.covers, cover] } });
    await insertCover(cover);
  },

  addSensor: async (sensor) => {
    const { tree } = get();
    if (!tree) return;
    set({ tree: { ...tree, sensors: [...tree.sensors, sensor] } });
    await insertSensor(sensor);
  },

  addIrrigation: async (node) => {
    const { tree } = get();
    if (!tree) return;
    set({ tree: { ...tree, irrigation: [...tree.irrigation, node] } });
    await insertIrrigation(node);
  },

  removeEquipment: async (kind, id) => {
    const { tree } = get();
    if (!tree) return;
    set({
      tree: {
        ...tree,
        covers: kind === 'cover' ? tree.covers.filter((c) => c.id !== id) : tree.covers,
        sensors: kind === 'sensor' ? tree.sensors.filter((s) => s.id !== id) : tree.sensors,
      },
    });
    await deleteEquipment(kind, id);
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

  addZone: async (zone) => {
    const { tree } = get();
    if (!tree) return;
    set({ tree: { ...tree, zones: [...tree.zones, zone] } });
    await insertZone(zone);
  },

  renameGarden: async (name) => {
    const { tree } = get();
    if (!tree) return;
    set({ tree: { ...tree, garden: { ...tree.garden, name } } });
    await renameGarden(tree.garden.id, name);
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

  addTask: async (input) => {
    const { tree } = get();
    if (!tree) return;
    const task: Task = {
      id: crypto.randomUUID(),
      gardenId: tree.garden.id,
      bedId: input.bedId,
      zoneId: input.zoneId,
      text: input.text,
      done: false,
      createdAt: Date.now(),
    };
    set({ tree: { ...tree, tasks: [...tree.tasks, task] } });
    await addTask(task);
  },

  removeTask: async (id) => {
    const { tree } = get();
    if (!tree) return;
    set({ tree: { ...tree, tasks: tree.tasks.filter((t) => t.id !== id) } });
    await deleteTask(id);
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

  reassignEquipment: async (kind, id, assignedBedId) => {
    const { tree } = get();
    if (!tree) return;
    set({
      tree: {
        ...tree,
        covers: kind === 'cover' ? tree.covers.map((c) => (c.id === id ? { ...c, assignedBedId } : c)) : tree.covers,
        sensors: kind === 'sensor' ? tree.sensors.map((s) => (s.id === id ? { ...s, assignedBedId } : s)) : tree.sensors,
      },
    });
    await setEquipmentAssignment(kind, id, assignedBedId);
  },

  setIrrigationOn: async (nodeId, on) => {
    const { tree } = get();
    if (!tree) return;
    set({ tree: { ...tree, irrigation: tree.irrigation.map((n) => (n.id === nodeId ? { ...n, on } : n)) } });
    await setIrrigationOn(nodeId, on);
  },
}));
