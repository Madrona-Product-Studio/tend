// Thin typed repository over Dexie. Views and stores talk to this, never to
// Dexie directly — so the storage layer stays swappable behind the domain.
import { db } from './db';
import type { Bed, BedLayout, BedShape, Cover, EquipmentKind, Garden, GardenTree, ID, IrrigationNode, Observation, Plant, Rect, Sensor, Task, Zone } from '@/domain';

// ── Garden collection (multi-garden: the demo + gardens the user builds) ────────

/** Every garden in local storage, name-sorted. Drives the home "your gardens" list. */
export async function listGardens(): Promise<Garden[]> {
  return db.gardens.orderBy('name').toArray();
}

export async function insertGarden(garden: Garden): Promise<void> {
  await db.gardens.add(garden);
}

export async function renameGarden(gardenId: ID, name: string): Promise<void> {
  await db.gardens.update(gardenId, { name, updatedAt: Date.now() });
}

export async function insertZone(zone: Zone): Promise<void> {
  await db.zones.add(zone);
}

/** Bulk-insert a starter template's contents into a just-created garden. */
export async function insertGardenContents(c: {
  zones?: Zone[]; beds?: Bed[]; plants?: Plant[]; covers?: Cover[]; sensors?: Sensor[]; irrigation?: IrrigationNode[];
}): Promise<void> {
  await db.transaction('rw', [db.zones, db.beds, db.plants, db.covers, db.sensors, db.irrigation], async () => {
    if (c.zones?.length) await db.zones.bulkAdd(c.zones);
    if (c.beds?.length) await db.beds.bulkAdd(c.beds);
    if (c.plants?.length) await db.plants.bulkAdd(c.plants);
    if (c.covers?.length) await db.covers.bulkAdd(c.covers);
    if (c.sensors?.length) await db.sensors.bulkAdd(c.sensors);
    if (c.irrigation?.length) await db.irrigation.bulkAdd(c.irrigation);
  });
}

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

export async function setIrrigationOn(nodeId: ID, on: boolean): Promise<void> {
  await db.irrigation.update(nodeId, { on });
}

export async function addTask(task: Task): Promise<void> {
  await db.tasks.add(task);
}

export async function deleteTask(id: ID): Promise<void> {
  await db.tasks.delete(id);
}

/** Reassign a movable item to a bed, or to storage (undefined). */
export async function setEquipmentAssignment(kind: EquipmentKind, id: ID, assignedBedId?: ID): Promise<void> {
  const table = kind === 'cover' ? db.covers : db.sensors;
  await table.update(id, { assignedBedId });
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

/** Patch a planting (name, variety, attributes, note/issue). Dexie shallow-merges
 *  top-level keys, so pass a fully-formed `attributes` object when editing it. */
export async function updatePlant(id: ID, patch: Partial<Plant>): Promise<void> {
  await db.plants.update(id, patch);
}

// ── Equipment creation (a fresh garden starts with none) ───────────────────────

export async function insertCover(cover: Cover): Promise<void> {
  await db.covers.add(cover);
}

export async function insertSensor(sensor: Sensor): Promise<void> {
  await db.sensors.add(sensor);
}

export async function insertIrrigation(node: IrrigationNode): Promise<void> {
  await db.irrigation.add(node);
}

export async function deleteEquipment(kind: EquipmentKind, id: ID): Promise<void> {
  const table = kind === 'cover' ? db.covers : db.sensors;
  await table.delete(id);
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
