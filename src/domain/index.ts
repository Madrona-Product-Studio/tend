// Public surface of the domain core: types + pure selectors/labels.
export * from './types';

import type { BedLayout, BedType, CropCategory, GardenTree, ID, Plant, SunExposure } from './types';

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
