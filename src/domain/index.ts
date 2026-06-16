// Public surface of the domain core: types + pure selectors/labels.
export * from './types';

import type { Bed, BedLayout, BedShape, BedType, CropCategory, GardenTree, ID, Plant, Rect, SensorReading, SunExposure } from './types';

// ── Display labels (UI-facing, but pure & dependency-free) ─────────────────────

export const BED_TYPE_LABEL: Record<BedType, string> = {
  'vigo-wicking': 'Vigo wicking + reservoir',
  vigo: 'Vigo raised',
  'aluminum-raised': 'Aluminum raised',
  greenhouse: 'Greenhouse',
  container: 'Container',
  'in-ground': 'In-ground',
};

export const SUN_LABEL: Record<SunExposure, string> = {
  'full-sun': 'Full sun',
  'partial-shade': 'Partial shade',
  shade: 'Shade',
  unknown: 'Sun: unknown',
};

export const CROP_LABEL: Record<CropCategory, string> = {
  brassica: 'Brassica', fruiting: 'Fruiting', root: 'Root', allium: 'Allium',
  herb: 'Herb', legume: 'Legume', leafy: 'Leafy', cucurbit: 'Cucurbit',
  'fruit-tree': 'Fruit tree', berry: 'Berry', other: 'Other',
};

// ── Selectors over a loaded tree (cheap; views can call freely) ────────────────

export const bedsInZone = (t: GardenTree, zoneId: ID) => t.beds.filter((b) => b.zoneId === zoneId);
export const plantsInBed = (t: GardenTree, bedId: ID) => t.plants.filter((p) => p.bedId === bedId);

export const equipmentForBed = (t: GardenTree, bedId: ID) => ({
  covers: t.covers.filter((c) => c.assignedBedId === bedId),
  sensors: t.sensors.filter((s) => s.assignedBedId === bedId),
  irrigation: t.irrigation.filter((n) => n.bedId === bedId),
});

export const tasksForBed = (t: GardenTree, bedId: ID) => t.tasks.filter((tk) => tk.bedId === bedId);

// ── Movable equipment (the "Sonos model") ───────────────────────────────────────
// Covers and sensors are a shared, limited inventory relocated between beds.
export type EquipmentKind = 'cover' | 'sensor';
export interface EquipmentItem {
  kind: EquipmentKind;
  id: ID;
  title: string;
  detail?: string;
  assignedBedId?: ID;
}

export function movableEquipment(t: GardenTree): EquipmentItem[] {
  const covers: EquipmentItem[] = t.covers.map((c) => ({
    kind: 'cover', id: c.id, title: c.kind === 'heat' ? 'Heat cover' : 'Mesh / shade cover',
    detail: c.label, assignedBedId: c.assignedBedId,
  }));
  const sensors: EquipmentItem[] = t.sensors.map((s) => ({
    kind: 'sensor', id: s.id, title: s.label,
    detail: s.reading ? `${s.reading.tempF}°F · ${s.reading.humidityPct}%` : 'temp / humidity',
    assignedBedId: s.assignedBedId,
  }));
  return [...covers, ...sensors];
}
export const observationsForBed = (t: GardenTree, bedId: ID) => t.observations.filter((o) => o.bedId === bedId && !o.plantId);
export const observationsForPlant = (t: GardenTree, plantId: ID) => t.observations.filter((o) => o.plantId === plantId);

/** A unified, display-ready list of a bed's systems, derived from the
 *  first-class equipment + bed state + fixtures. */
export type SystemKind = 'reservoir' | 'irrigation' | 'cover' | 'sensor' | 'trellis';
export interface SystemRow { kind: SystemKind; label: string; on?: boolean }

// ── Bed layout (row-based; configurable) ───────────────────────────────────────

/** A sensible default row layout when a bed hasn't been configured. */
export function defaultLayout(plantCount: number): BedLayout {
  const rows = plantCount <= 4 ? 1 : plantCount <= 10 ? 2 : 3;
  return { kind: 'rows', rows, sideBySide: false };
}

/** Distribute a bed's plantings into rows. Honors explicit `plant.row` if any
 *  plant has it; otherwise fills rows sequentially and evenly. */
export function bedRowsOf(plants: Plant[], layout?: BedLayout): { layout: BedLayout; rows: Plant[][] } {
  const lay = layout ?? defaultLayout(plants.length);
  const rows: Plant[][] = Array.from({ length: Math.max(1, lay.rows) }, () => []);
  const hasExplicit = plants.some((p) => typeof p.row === 'number');
  if (hasExplicit) {
    plants.forEach((p) => { rows[Math.min(rows.length - 1, Math.max(0, p.row ?? 0))]!.push(p); });
    rows.forEach((r) => r.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
  } else {
    const perRow = Math.ceil(plants.length / rows.length);
    plants.forEach((p, i) => { rows[Math.min(rows.length - 1, Math.floor(i / perRow))]!.push(p); });
  }
  return { layout: lay, rows };
}

// ── Zone diagram (spatial bed layout) ───────────────────────────────────────────

export interface ZoneLayoutItem { id: ID; label: string; rect: Rect; shape: BedShape; accent: boolean; live?: boolean; liveLabel?: string }

const bboxOf = (rects: Rect[]): Rect => {
  if (!rects.length) return { x: 0, y: 0, w: 100, h: 60 };
  const minX = Math.min(...rects.map((r) => r.x));
  const minY = Math.min(...rects.map((r) => r.y));
  const maxX = Math.max(...rects.map((r) => r.x + r.w));
  const maxY = Math.max(...rects.map((r) => r.y + r.h));
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
};

const bedAccent = (b: Bed) => typeof b.state?.reservoirLevel === 'number';

/** Place a zone's beds for the diagram: honor each bed's footprint if every bed
 *  has one; otherwise auto-arrange into a tidy wrapping row. */
export function zoneLayout(beds: Bed[]): { items: ZoneLayoutItem[]; bounds: Rect } {
  const allPlaced = beds.length > 0 && beds.every((b) => b.footprint);
  let items: ZoneLayoutItem[];
  if (allPlaced) {
    items = beds.map((b) => ({ id: b.id, label: b.name, rect: b.footprint!, shape: b.shape ?? 'rect', accent: bedAccent(b) }));
  } else {
    const W = 64, H = 50, GAP = 16, COLS = 4;
    items = beds.map((b, i) => ({
      id: b.id, label: b.name, shape: b.shape ?? 'rect', accent: bedAccent(b),
      rect: b.footprint ?? { x: (i % COLS) * (W + GAP), y: Math.floor(i / COLS) * (H + GAP), w: W, h: H },
    }));
  }
  return { items, bounds: bboxOf(items.map((i) => i.rect)) };
}

// ── Live state (the spatial-dashboard layer) ────────────────────────────────────

export interface BedLive {
  reading?: SensorReading;     // from an assigned sensor
  reservoirLevel?: number;     // 0..1
  irrigationOn?: boolean;      // undefined = no irrigation node
}

export function bedLive(t: GardenTree, bedId: ID): BedLive {
  const { sensors, irrigation } = equipmentForBed(t, bedId);
  const bed = t.beds.find((b) => b.id === bedId);
  return {
    reading: sensors.find((s) => s.reading)?.reading,
    reservoirLevel: bed?.state?.reservoirLevel,
    irrigationOn: irrigation.length ? irrigation.some((n) => n.on) : undefined,
  };
}

/** A bed's water situation, framed to answer "is it watered, and if not why?" */
export interface BedWater {
  node?: { id: ID; on: boolean; kind?: string; emitterCount?: number; note?: string };
  selfWatering: boolean;   // wicking bed: watered from its reservoir, no drip line
}

export function bedWater(t: GardenTree, bedId: ID): BedWater {
  const node = equipmentForBed(t, bedId).irrigation[0];
  const bed = t.beds.find((b) => b.id === bedId);
  return {
    node: node ? { id: node.id, on: node.on, kind: node.kind, emitterCount: node.emitterCount, note: node.notes } : undefined,
    selfWatering: bed?.type === 'vigo-wicking',
  };
}

export const hasLive = (l: BedLive) =>
  l.reading?.tempF !== undefined || l.reading?.humidityPct !== undefined ||
  typeof l.reservoirLevel === 'number' || l.irrigationOn !== undefined;

export function bedSystems(t: GardenTree, bedId: ID): SystemRow[] {
  const { covers, sensors, irrigation } = equipmentForBed(t, bedId);
  const bed = t.beds.find((b) => b.id === bedId);
  const rows: SystemRow[] = [];

  if (typeof bed?.state?.reservoirLevel === 'number') {
    rows.push({ kind: 'reservoir', label: `Reservoir · ${Math.round(bed.state.reservoirLevel * 100)}%` });
  }
  for (const n of irrigation) {
    const kindLabel = n.kind === 'misters' ? 'Misting' : n.kind === 'soaker' ? 'Soaker hose' : `${n.emitterCount ?? ''} emitters`.trim();
    rows.push({ kind: 'irrigation', label: kindLabel, on: n.on });
  }
  for (const c of covers) rows.push({ kind: 'cover', label: c.label });
  for (const s of sensors) rows.push({ kind: 'sensor', label: s.label });
  for (const fixture of bed?.structures ?? []) rows.push({ kind: 'trellis', label: fixture });
  return rows;
}
