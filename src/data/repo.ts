// Thin typed repository over Dexie. Views and stores talk to this, never to
// Dexie directly — so the storage layer stays swappable behind the domain.
import { db } from './db';
import type { GardenTree, ID } from '@/domain';

/** Load everything for one garden in a single pass. */
export async function loadGardenTree(gardenId: ID): Promise<GardenTree | null> {
  const garden = await db.gardens.get(gardenId);
  if (!garden) return null;

  const zones = await db.zones.where('gardenId').equals(gardenId).toArray();
  const zoneIds = zones.map((z) => z.id);
  const beds = await db.beds.where('zoneId').anyOf(zoneIds).toArray();
  const bedIds = beds.map((b) => b.id);
  const plants = await db.plants.where('bedId').anyOf(bedIds).toArray();

  const [covers, sensors, irrigation, tasks] = await Promise.all([
    db.covers.where('gardenId').equals(gardenId).toArray(),
    db.sensors.where('gardenId').equals(gardenId).toArray(),
    db.irrigation.where('gardenId').equals(gardenId).toArray(),
    db.tasks.where('gardenId').equals(gardenId).toArray(),
  ]);

  return { garden, zones, beds, plants, covers, sensors, irrigation, tasks };
}

export async function setTaskDone(taskId: ID, done: boolean): Promise<void> {
  await db.tasks.update(taskId, { done });
}
