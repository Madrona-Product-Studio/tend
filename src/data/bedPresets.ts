// "Build a bed" catalog — the small set of real configurations in use. Picking a
// preset pre-fills a new bed's type, dimensions, default row layout, and systems;
// the user then arranges plantings via the edit mode.
//
// NOTE: dimensions are STUBS pending Charlie's exact specs (Vigo models, aluminum
// sizes, in-ground plot dims). Marked TODO; refine without touching the flow.
import type { BedLayout, BedType } from '@/domain';

export interface BedPreset {
  id: string;
  label: string;
  group: 'Raised' | 'Structure' | 'In-ground' | 'Container';
  type: BedType;
  typeDetail: string;
  widthFt?: number;   // TODO: confirm
  lengthFt?: number;  // TODO: confirm
  layout: BedLayout;
  hasReservoir?: boolean;
  blurb: string;
}

export const BED_PRESETS: BedPreset[] = [
  {
    id: 'vigo-wicking',
    label: 'Vigo — wicking + reservoir',
    group: 'Raised',
    type: 'vigo-wicking',
    typeDetail: 'Vigo — wicking floor + reservoir',
    widthFt: 3, lengthFt: 6,
    layout: { kind: 'rows', rows: 2 },
    hasReservoir: true,
    blurb: 'Self-watering raised bed with a wicking floor and water-level reservoir.',
  },
  {
    id: 'vigo-standard',
    label: 'Vigo — raised',
    group: 'Raised',
    type: 'vigo',
    typeDetail: 'Vigo raised',
    widthFt: 3, lengthFt: 6,
    layout: { kind: 'rows', rows: 2 },
    blurb: 'Standard Vigo raised bed, no wicking floor.',
  },
  {
    id: 'aluminum-standard',
    label: 'Aluminum — standard',
    group: 'Raised',
    type: 'aluminum-raised',
    typeDetail: 'Aluminum raised — standard',
    widthFt: 4, lengthFt: 8,
    layout: { kind: 'rows', rows: 3 },
    blurb: 'Standard aluminum raised bed.',
  },
  {
    id: 'greenhouse-8x6',
    label: 'Greenhouse — 8×6',
    group: 'Structure',
    type: 'greenhouse',
    typeDetail: 'Greenhouse structure — 8×6 ft',
    widthFt: 8, lengthFt: 6,
    layout: { kind: 'rows', rows: 2 },
    blurb: 'Walk-in greenhouse structure.',
  },
  {
    id: 'in-ground-plot',
    label: 'In-ground plot',
    group: 'In-ground',
    type: 'in-ground',
    typeDetail: 'In-ground / edges',
    widthFt: 4, lengthFt: 10,
    layout: { kind: 'rows', rows: 3 },
    blurb: 'A bordered plot or edge planted directly in the ground.',
  },
  {
    id: 'containers',
    label: 'Containers',
    group: 'Container',
    type: 'container',
    typeDetail: 'Containers',
    layout: { kind: 'rows', rows: 1 },
    blurb: 'A cluster of pots or containers.',
  },
];
