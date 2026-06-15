// Public surface of the domain core: types + pure selectors/labels.
export * from './types';

import type { BedType, CropCategory, GardenTree, ID, SunExposure } from './types';

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
