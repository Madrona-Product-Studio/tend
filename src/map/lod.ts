// Scale bounds (clamp the fit math) + level labels. Navigation is discrete now
// (Garden → Zone → Bed), so there are no continuous LOD thresholds.
import type { Lod } from './types';

export const SCALE_MIN = 0.05;
export const SCALE_MAX = 6;

export const LOD_LABEL: Record<Lod, string> = {
  garden: 'Garden',
  zone: 'Zone',
  bed: 'Bed',
};
