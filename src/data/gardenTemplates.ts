// Starter templates for "Build a garden" — so a new garden isn't a blank
// canvas. Each template lays down realistic zones, beds, a few plantings, and
// some systems, all with fresh IDs bound to the new garden. Users can edit or
// delete anything afterward; this is just a running start.
import type { Bed, Cover, IrrigationNode, Plant, Sensor, Zone } from '@/domain';

export interface GardenTemplateContents {
  zones: Zone[]; beds: Bed[]; plants: Plant[]; covers: Cover[]; sensors: Sensor[]; irrigation: IrrigationNode[];
}

export interface GardenTemplate {
  id: string;
  label: string;
  blurb: string;
  summary: string;
  /** Blank = no template. `build` is undefined; a fresh empty garden. */
  build?: (gardenId: string) => GardenTemplateContents;
}

const uid = () => crypto.randomUUID();
const plant = (bedId: string, name: string, cropCategory: Plant['attributes']['cropCategory'], extra: Partial<Plant> = {}): Plant =>
  ({ id: uid(), bedId, name, attributes: { cropCategory }, ...extra });

// ── Templates ───────────────────────────────────────────────────────────────

function raisedBeds(gardenId: string): GardenTemplateContents {
  const z = uid();
  const zone: Zone = { id: z, gardenId, name: 'Main Garden', description: 'Raised beds, full sun', sunExposure: 'full-sun' };
  const tomato = uid(), salad = uid(), root = uid();
  const beds: Bed[] = [
    { id: tomato, zoneId: z, name: 'Tomato Bed', type: 'vigo', typeDetail: 'Vigo raised', layout: { kind: 'rows', rows: 2 }, footprint: { x: 8, y: 8, w: 60, h: 46 } },
    { id: salad, zoneId: z, name: 'Salad Bed', type: 'aluminum-raised', typeDetail: 'Aluminum raised', footprint: { x: 76, y: 8, w: 56, h: 46 } },
    { id: root, zoneId: z, name: 'Root Bed', type: 'aluminum-raised', typeDetail: 'Aluminum raised', footprint: { x: 140, y: 8, w: 44, h: 46 } },
  ];
  const plants: Plant[] = [
    plant(tomato, 'Tomato', 'fruiting', { variety: 'San Marzano' }), plant(tomato, 'Tomato', 'fruiting', { variety: 'Sungold' }), plant(tomato, 'Basil', 'herb'),
    plant(salad, 'Lettuce', 'leafy'), plant(salad, 'Arugula', 'leafy'), plant(salad, 'Spinach', 'leafy'),
    plant(root, 'Carrots', 'root'), plant(root, 'Beets', 'root'), plant(root, 'Radishes', 'root'),
  ];
  // Structure only — beds and plantings you can rename. No sensors/covers: those
  // are hardware you own, added yourself on the Equipment screen.
  return { zones: [zone], beds, plants, covers: [], sensors: [], irrigation: [] };
}

function wickingGreenhouse(gardenId: string): GardenTemplateContents {
  const z = uid();
  const zone: Zone = { id: z, gardenId, name: 'Production', description: 'Wicking beds + greenhouse', sunExposure: 'full-sun' };
  const wick = uid(), pepper = uid(), gh = uid();
  const beds: Bed[] = [
    { id: wick, zoneId: z, name: 'Wicking Bed', type: 'vigo-wicking', typeDetail: 'Vigo — wicking floor + reservoir', layout: { kind: 'rows', rows: 2 }, footprint: { x: 8, y: 8, w: 60, h: 46 } },
    { id: pepper, zoneId: z, name: 'Pepper Bed', type: 'vigo-wicking', typeDetail: 'Vigo — wicking floor', footprint: { x: 76, y: 8, w: 56, h: 46 } },
    { id: gh, zoneId: z, name: 'Greenhouse', type: 'greenhouse', typeDetail: 'Greenhouse structure — 8×6', widthFt: 8, lengthFt: 6, footprint: { x: 8, y: 62, w: 124, h: 60 } },
  ];
  const plants: Plant[] = [
    plant(wick, 'Kale', 'brassica'), plant(wick, 'Chard', 'brassica'), plant(wick, 'Broccoli', 'brassica'),
    plant(pepper, 'Jalapeño', 'fruiting'), plant(pepper, 'Bell pepper', 'fruiting'), plant(pepper, 'Shishito', 'fruiting'),
    plant(gh, 'Cucumber', 'fruiting', { variety: 'Suyo' }), plant(gh, 'Tomato', 'fruiting', { variety: 'Tiny Tim' }),
  ];
  // Structure only — the greenhouse and wicking beds are the bed types you chose;
  // sensors and covers are hardware you add yourself on the Equipment screen.
  return { zones: [zone], beds, plants, covers: [], sensors: [], irrigation: [] };
}

function patioHerbs(gardenId: string): GardenTemplateContents {
  const z = uid();
  const zone: Zone = { id: z, gardenId, name: 'Patio', description: 'By the back door, partial shade', sunExposure: 'partial-shade' };
  const herbs = uid(), lettuce = uid();
  const beds: Bed[] = [
    { id: herbs, zoneId: z, name: 'Herb Collection', type: 'container', typeDetail: 'Containers', footprint: { x: 8, y: 8, w: 60, h: 46 } },
    { id: lettuce, zoneId: z, name: 'Lettuce Bed', type: 'vigo', typeDetail: 'Vigo raised', footprint: { x: 76, y: 8, w: 60, h: 46 } },
  ];
  const plants: Plant[] = [
    plant(herbs, 'Basil', 'herb'), plant(herbs, 'Thyme', 'herb'), plant(herbs, 'Rosemary', 'herb'), plant(herbs, 'Mint', 'herb'),
    plant(lettuce, 'Romaine', 'leafy'), plant(lettuce, 'Radicchio', 'leafy'),
  ];
  return { zones: [zone], beds, plants, covers: [], sensors: [], irrigation: [] };
}

export const GARDEN_TEMPLATES: GardenTemplate[] = [
  { id: 'raised', label: 'Raised beds', blurb: 'Three raised beds in full sun, planted with tomatoes, salad, and roots. A common home setup.', summary: '1 zone · 3 beds · 9 plants', build: raisedBeds },
  { id: 'wicking', label: 'Wicking + greenhouse', blurb: 'Two self-watering wicking beds and an 8×6 greenhouse. Rename and rearrange to match yours.', summary: '1 zone · 3 beds · 8 plants', build: wickingGreenhouse },
  { id: 'patio', label: 'Patio & herbs', blurb: 'A container herb collection and a lettuce bed for a shady patio.', summary: '1 zone · 2 beds · 6 plants', build: patioHerbs },
  { id: 'blank', label: 'Blank garden', blurb: 'Start from nothing and lay it out yourself, zone by zone.', summary: 'Empty' },
];
