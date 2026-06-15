// Thin typed repository over Dexie. Views and stores talk to this, never to
// Dexie directly — so the storage layer stays swappable behind the domain.
import { db } from './db';
import type { Bed, BedLayout, BedShape, GardenTree, ID, Observation, Plant, Rect, Task } from '@/domain';

/** Load everything for one garden in a single pass. */
export async function loadGardenTree(gardenId: ID): Promise<GardenTree | null> {
  const garden = await db.gardens.get(gardenId);
  if (!garden) return null;

  const zones = await db.zones.where('gardenId').equals(gardenId).toArray();
  const zoneIds = zones.map((z) => z.id);
  const beds = await db.beds.where('zoneId').anyOf(zoneIds).toArray();
  const bedIds = beds.map((b) => b.id);
  const plants = await db.plants.where('bedId').anyOf(bedIds).toArray();

  const [covers, sensors, irrigation, tasks, observations] = await Promise.all([
    db.covers.where('gardenId').equals(gardenId).toArray(),
    db.sensors.where('gardenId').equals(gardenId).toArray(),
    db.irrigation.where('gardenId').equals(gardenId).toArray(),
    db.tasks.where('gardenId').equals(gardenId).toArray(),
    db.observations.where('gardenId').equals(gardenId).toArray(),
  ]);

  return { garden, zones, beds, plants, covers, sensors, irrigation, tasks, observations };
}

export async function setTaskDone(taskId: ID, done: boolean): Promise<void> {
  await db.tasks.update(taskId, { done });
}

export async function addTask(task: Task): Promise<void> {
  await db.tasks.add(task);
}

export async function deleteTask(id: ID): Promise<void> {
  await db.tasks.delete(id);
}

export async function setBedPosition(bedId: ID, position: { x: number; y: number }): Promise<void> {
  await db.beds.update(bedId, { position });
}

/** Persist a row+order arrangement for a set of plantings. */
export async function savePlantArrangement(updates: { id: ID; row: number; order: number }[]): Promise<void> {
  await db.transaction('rw', db.plants, async () => {
    for (const u of updates) await db.plants.update(u.id, { row: u.row, order: u.order });
  });
}

export async function insertPlant(plant: Plant): Promise<void> {
  await db.plants.add(plant);
}

export async function deletePlant(plantId: ID): Promise<void> {
  await db.transaction('rw', db.plants, db.observations, async () => {
    await db.plants.delete(plantId);
    await db.observations.where('plantId').equals(plantId).delete();
  });
}

export async function saveBedLayout(bedId: ID, layout: BedLayout): Promise<void> {
  await db.beds.update(bedId, { layout });
}

export async function insertBed(bed: Bed): Promise<void> {
  await db.beds.add(bed);
}

export async function saveBedGeometry(bedId: ID, footprint: Rect, shape?: BedShape): Promise<void> {
  await db.beds.update(bedId, shape ? { footprint, shape } : { footprint });
}

export async function renameZone(zoneId: ID, name: string): Promise<void> {
  await db.zones.update(zoneId, { name });
}

export async function renameBed(bedId: ID, name: string): Promise<void> {
  await db.beds.update(bedId, { name });
}

export async function addObservation(obs: Observation): Promise<void> {
  await db.observations.add(obs);
}

export async function deleteObservation(id: ID): Promise<void> {
  await db.observations.delete(id);
}
