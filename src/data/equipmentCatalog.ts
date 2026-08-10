// Common covers and sensors to pick from when adding equipment — so "add a
// cover / sensor" offers ideas, not just a blank field. Each is a starting
// point; the label stays editable. Kept generic/brand-light; real product
// identity (Vigo, Govee, etc.) can deepen later.
import type { CoverKind } from '@/domain';

export interface CoverPreset { id: string; label: string; kind: CoverKind }
export interface SensorPreset { id: string; label: string }

export const COVER_PRESETS: CoverPreset[] = [
  // Warmth
  { id: 'row-cover', label: 'Frost blanket / row cover', kind: 'heat' },
  { id: 'gh-winter', label: 'Greenhouse cover (winter)', kind: 'heat' },
  { id: 'cold-frame', label: 'Cold frame', kind: 'heat' },
  { id: 'cloche', label: 'Cloche / heat dome', kind: 'heat' },
  // Shade / mesh
  { id: 'shade-30', label: 'Shade cloth (30%)', kind: 'mesh-shade' },
  { id: 'shade-50', label: 'Shade cloth (50%)', kind: 'mesh-shade' },
  { id: 'insect-mesh', label: 'Insect mesh', kind: 'mesh-shade' },
  { id: 'bird-net', label: 'Bird netting', kind: 'mesh-shade' },
];

export const SENSOR_PRESETS: SensorPreset[] = [
  { id: 'govee', label: 'Govee thermo-hygrometer' },
  { id: 'sensorpush', label: 'SensorPush HT.w' },
  { id: 'ecowitt', label: 'Ecowitt WH31' },
  { id: 'acurite', label: 'AcuRite' },
  { id: 'thermopro', label: 'ThermoPro' },
  { id: 'generic', label: 'Temp / humidity sensor' },
];
