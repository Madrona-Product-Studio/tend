// Level-of-detail thresholds. Tuned so a bed (~BED_W world units) reads
// comfortably on screen before its plant-level detail resolves. Calibrated by
// eye against the spike screenshots; adjust here only.
import type { Lod } from './types';

export const SCALE_MIN = 0.12;
export const SCALE_MAX = 6;

const ZONE_AT = 0.55; // ≥ this: beds resolve into view
const BED_AT = 1.5;   // ≥ this: plants + live state resolve

export function lodForScale(s: number): Lod {
  if (s >= BED_AT) return 'bed';
  if (s >= ZONE_AT) return 'zone';
  return 'garden';
}

export const LOD_LABEL: Record<Lod, string> = {
  garden: 'Garden',
  zone: 'Zone',
  bed: 'Bed',
};
