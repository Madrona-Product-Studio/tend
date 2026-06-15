// ════════════════════════════════════════════════════════════════════════════
// Seed data — the real parsed garden from the walkthrough (docs/tend-brief.md
// appendix), used as the v1 fixture. A faithful, representative subset: every
// zone and named bed with its true type + equipment + irrigation + punch-list;
// plant lists are representative rather than exhaustive (the brief catalogues
// 150+). Positions are intentionally omitted — topological-first; the human
// places beds on the map later.
// ════════════════════════════════════════════════════════════════════════════
import { db } from './db';
import type {
  Bed, Cover, Garden, IrrigationNode, Plant, PlantAttributes, Sensor, Task, Zone,
} from '@/domain';

export const DEMO_GARDEN_ID = 'demo';

// ── tiny builders to keep the data readable ───────────────────────────────────
let pc = 0;
const plant = (
  bedId: string, name: string, attrs: PlantAttributes, variety?: string, notes?: string,
): Plant => ({ id: `p${++pc}`, bedId, name, variety, attributes: attrs, notes });

// attribute shorthands
const A = {
  brassica: { cropCategory: 'brassica', season: 'cool', boltingRisk: true } satisfies PlantAttributes,
  root: { cropCategory: 'root', season: 'cool', soilDepthNeedIn: 12 } satisfies PlantAttributes,
  leafy: { cropCategory: 'leafy', season: 'cool', boltingRisk: true } satisfies PlantAttributes,
  allium: { cropCategory: 'allium', season: 'cool' } satisfies PlantAttributes,
  legume: { cropCategory: 'legume', season: 'cool', pollinationRequired: false } satisfies PlantAttributes,
  herb: { cropCategory: 'herb' } satisfies PlantAttributes,
  fruiting: { cropCategory: 'fruiting', season: 'warm', pollinationRequired: true, soilTempNeedF: 65 } satisfies PlantAttributes,
  cucurbit: { cropCategory: 'cucurbit', season: 'warm', pollinationRequired: true, soilTempNeedF: 65 } satisfies PlantAttributes,
  berry: { cropCategory: 'berry', season: 'perennial' } satisfies PlantAttributes,
  tree: { cropCategory: 'fruit-tree', season: 'perennial', pollinationRequired: true } satisfies PlantAttributes,
  other: { cropCategory: 'other' } satisfies PlantAttributes,
};

const bed = (id: string, zoneId: string, name: string, type: Bed['type'], extra: Partial<Bed> = {}): Bed =>
  ({ id, zoneId, name, type, ...extra });

// ── Zones ─────────────────────────────────────────────────────────────────────
const zones: Zone[] = [
  { id: 'z1', gardenId: DEMO_GARDEN_ID, name: 'Main production', description: 'Vigo raised beds, greenhouse, she-shed; irrigation circuit.', sunExposure: 'full-sun' },
  { id: 'z2', gardenId: DEMO_GARDEN_ID, name: 'Brassicas (other side of yard)', description: 'Aluminum raised beds; candidate for a soaker-hose zone.', sunExposure: 'partial-shade' },
  { id: 'z3', gardenId: DEMO_GARDEN_ID, name: 'Herbs + lettuce (patio)', description: 'By the back door.', sunExposure: 'partial-shade' },
  { id: 'z4', gardenId: DEMO_GARDEN_ID, name: 'Perimeter — fruit + berries', description: 'Fences and edges.', sunExposure: 'full-sun' },
];

// ── Beds ──────────────────────────────────────────────────────────────────────
const beds: Bed[] = [
  bed('z1b1', 'z1', 'Wicking bed', 'vigo-wicking', { state: { reservoirLevel: 0.8, irrigationOn: false }, soilNotes: 'Shallow soil — carrots bolted; needs topping up.' }),
  bed('z1b2', 'z1', 'Trial bed', 'vigo', { soilNotes: 'Newest (former cold plunge); getting its own irrigation node.' }),
  bed('z1b3', 'z1', 'Berry / potato / asparagus', 'vigo', { soilNotes: 'Needs soil + thinning; surprise volunteer potatoes.' }),
  bed('z1b4', 'z1', 'Peppers + eggplant', 'vigo-wicking', { state: { reservoirLevel: 0.6, irrigationOn: false } }),
  bed('z1b5', 'z1', 'Front tomato bed', 'vigo', { soilNotes: 'Greenhouse cover removed ~Jun 10–11; covered plants markedly larger.' }),
  bed('z1b6', 'z1', 'Peas', 'vigo', { soilNotes: 'No wicking floor; has greenhouse cover.' }),
  bed('z1b7', 'z1', 'Potatoes + old fennel', 'vigo', { soilNotes: 'Irrigation line ends here.' }),
  bed('z1b8', 'z1', 'She-shed squash bed', 'vigo'),
  bed('z1gh', 'z1', 'Greenhouse', 'greenhouse', { widthFt: 8, lengthFt: 6, soilNotes: 'Misting irrigation.' }),
  bed('z2b1', 'z2', 'Brassica bed A', 'aluminum-raised'),
  bed('z2b2', 'z2', 'Brassica bed B', 'aluminum-raised'),
  bed('z3b1', 'z3', 'Herb bed', 'container'),
  bed('z3b2', 'z3', 'Lettuce bed', 'vigo', { soilNotes: 'No reservoir; mesh cover (birds eat seeds). Mister planned (anti-bolt).' }),
  bed('z4b1', 'z4', 'Fruit trees', 'in-ground'),
  bed('z4b2', 'z4', 'Berry row', 'in-ground'),
];

// ── Plants (representative) ───────────────────────────────────────────────────
const plants: Plant[] = [
  // z1b1 wicking — cruciferous/roots
  plant('z1b1', 'Brussels sprouts', A.brassica),
  plant('z1b1', 'Broccoli', A.brassica, undefined, 'Bolted — pull.'),
  plant('z1b1', 'Carrots', A.root, undefined, 'Bolted; soil too shallow.'),
  plant('z1b1', 'Beets', A.root),
  plant('z1b1', 'Chard', A.leafy, undefined, 'Transplanted.'),
  plant('z1b1', 'Fennel', A.herb),
  // z1b2 trial
  plant('z1b2', 'Tomato', A.fruiting),
  plant('z1b2', 'Cucumber', A.cucurbit, undefined, 'On trellis (×2).'),
  // z1b3 berry/potato/asparagus
  plant('z1b3', 'Strawberries', A.berry, undefined, 'Left side, moldy.'),
  plant('z1b3', 'Potatoes', A.root, undefined, 'Surprise volunteers.'),
  plant('z1b3', 'Asparagus', { cropCategory: 'other', season: 'perennial', soilDepthNeedIn: 18 }, undefined, 'Intended; needs thinning.'),
  // z1b4 peppers + eggplant
  plant('z1b4', 'Pepper', A.fruiting, 'Anaheim'),
  plant('z1b4', 'Pepper', A.fruiting, 'Jalapeño'),
  plant('z1b4', 'Pepper', A.fruiting, 'Shishito'),
  plant('z1b4', 'Pepper', A.fruiting, 'Bell'),
  plant('z1b4', 'Eggplant', A.fruiting, 'Japanese (long)'),
  plant('z1b4', 'Cucumber', A.cucurbit, 'Suyo'),
  // z1b5 front tomatoes + peas
  plant('z1b5', 'Tomato', A.fruiting, 'San Marzano'),
  plant('z1b5', 'Tomato', A.fruiting, 'Hillbilly heirloom'),
  plant('z1b5', 'Tomato', A.fruiting, 'Japanese Black'),
  plant('z1b5', 'Tomato', A.fruiting, 'Gold Dust'),
  plant('z1b5', 'Peas', A.legume, undefined, 'Back row; snap/snow/shell labels lost.'),
  // z1b6 peas
  plant('z1b6', 'Peas', A.legume, undefined, 'Shell vs sugar/snap uncertain.'),
  // z1b7 potatoes + fennel
  plant('z1b7', 'Potatoes', A.root),
  plant('z1b7', 'Fennel', A.herb, undefined, 'Old.'),
  // z1b8 squash
  plant('z1b8', 'Zucchini', A.cucurbit),
  plant('z1b8', 'Butternut squash', A.cucurbit),
  plant('z1b8', 'Pattypan squash', A.cucurbit),
  plant('z1b8', 'Pumpkin', A.cucurbit),
  plant('z1b8', 'Rhubarb', { cropCategory: 'other', season: 'perennial' }),
  plant('z1b8', 'Celery', A.other, undefined, 'Reduce.'),
  // greenhouse
  plant('z1gh', 'Cucumber', A.cucurbit, 'Suyo (hanging)'),
  plant('z1gh', 'Tomato', A.fruiting, 'Tiny Tim'),
  plant('z1gh', 'Pepper', A.fruiting, 'Ancho'),
  plant('z1gh', 'Eggplant', A.fruiting),
  // z2 brassicas/shade
  plant('z2b1', 'Kale', A.brassica),
  plant('z2b1', 'Onions', A.allium),
  plant('z2b1', 'Spinach', A.leafy, undefined, 'Overgrown.'),
  plant('z2b1', 'Broccoli', A.brassica),
  plant('z2b1', 'Sweet potato', { cropCategory: 'root', season: 'warm' }, 'Soup (gift)'),
  plant('z2b2', 'Celery', A.other),
  plant('z2b2', 'Potatoes', A.root),
  plant('z2b2', 'Kale', A.brassica, undefined, 'Bolted.'),
  plant('z2b2', 'Brussels sprouts', A.brassica),
  // z3 herbs + lettuce
  plant('z3b1', 'Basil', A.herb, 'Thai / regular / purple'),
  plant('z3b1', 'Rosemary', A.herb, undefined, '×2.'),
  plant('z3b1', 'Mint', A.herb),
  plant('z3b1', 'Thyme', A.herb),
  plant('z3b1', 'Oregano', A.herb),
  plant('z3b1', 'Sage', A.herb),
  plant('z3b2', 'Romaine', A.leafy),
  plant('z3b2', 'Radicchio', A.leafy),
  plant('z3b2', 'Lettuce', A.leafy, 'Spiky mix'),
  // z4 perimeter
  plant('z4b1', 'Plum', A.tree, undefined, '×2; flowered, no fruit — maybe remove.'),
  plant('z4b1', 'Apple', A.tree, 'Multi-graft (Honeycrisp/Braeburn/Fuji/Gala)', 'A Braeburn branch is dead.'),
  plant('z4b1', 'Cherry', A.tree, undefined, 'Prune lower branches.'),
  plant('z4b1', 'Pear', A.tree, undefined, 'Prune / top.'),
  plant('z4b2', 'Blueberry', A.berry, undefined, '2–3 cultivars.'),
  plant('z4b2', 'Raspberry', A.berry, undefined, '×3.'),
  plant('z4b2', 'Blackberry', A.berry),
];

// ── Equipment ─────────────────────────────────────────────────────────────────
const covers: Cover[] = [
  { id: 'cover-heat-1', gardenId: DEMO_GARDEN_ID, kind: 'heat', label: 'Heat cover — peppers', assignedBedId: 'z1b4' },
  { id: 'cover-heat-2', gardenId: DEMO_GARDEN_ID, kind: 'heat', label: 'Heat cover — peas', assignedBedId: 'z1b6' },
  { id: 'cover-heat-3', gardenId: DEMO_GARDEN_ID, kind: 'heat', label: 'Heat cover — front toms', sizeNote: 'Removed ~Jun 10; in storage.' },
  { id: 'cover-mesh-1', gardenId: DEMO_GARDEN_ID, kind: 'mesh-shade', label: 'Mesh cover — lettuce', assignedBedId: 'z3b2' },
];

const sensors: Sensor[] = [
  { id: 'govee-1', gardenId: DEMO_GARDEN_ID, label: 'Govee #1', measures: 'temp-humidity', assignedBedId: 'z1b4', reliabilityNote: 'Unreliable.' },
  { id: 'govee-2', gardenId: DEMO_GARDEN_ID, label: 'Govee #2', measures: 'temp-humidity', assignedBedId: 'z1gh' },
];

const irrigation: IrrigationNode[] = [
  { id: 'irr-z1b2', gardenId: DEMO_GARDEN_ID, bedId: 'z1b2', on: true, kind: 'emitters', emitterCount: 3, order: 1, notes: 'New node for the trial bed.' },
  { id: 'irr-z1b3', gardenId: DEMO_GARDEN_ID, bedId: 'z1b3', on: true, kind: 'emitters', emitterCount: 3, order: 2 },
  { id: 'irr-z1b4', gardenId: DEMO_GARDEN_ID, bedId: 'z1b4', on: true, kind: 'emitters', emitterCount: 3, order: 3 },
  { id: 'irr-z1b5', gardenId: DEMO_GARDEN_ID, bedId: 'z1b5', on: true, kind: 'emitters', emitterCount: 3, order: 4 },
  { id: 'irr-z1b7', gardenId: DEMO_GARDEN_ID, bedId: 'z1b7', on: true, kind: 'emitters', emitterCount: 3, order: 5, notes: 'Line ends here — adding a 4th emitter.' },
  { id: 'irr-z1gh', gardenId: DEMO_GARDEN_ID, bedId: 'z1gh', on: true, kind: 'misters', order: 6 },
  { id: 'irr-z3b2', gardenId: DEMO_GARDEN_ID, bedId: 'z3b2', on: false, kind: 'misters', notes: 'Waiting on tubing (~July).' },
];

const now = Date.now();
const task = (id: string, text: string, ref: { zoneId?: string; bedId?: string } = {}): Task =>
  ({ id, gardenId: DEMO_GARDEN_ID, text, done: false, createdAt: now, ...ref });

const tasks: Task[] = [
  task('t1', 'Pull bolted broccoli', { bedId: 'z1b1' }),
  task('t2', 'Add soil to wicking bed', { bedId: 'z1b1' }),
  task('t3', 'Thin asparagus + add soil', { bedId: 'z1b3' }),
  task('t4', 'Add 4th emitter to the potato bed', { bedId: 'z1b7' }),
  task('t5', 'Trellis the trial-bed cucumber', { bedId: 'z1b2' }),
  task('t6', 'Reduce celery', { bedId: 'z1b8' }),
  task('t7', 'Connect Zone 3 irrigation (await tubing)', { bedId: 'z3b2' }),
  task('t8', 'Add mister to the lettuce bed', { bedId: 'z3b2' }),
  task('t9', 'Prune cherry lower branches', { bedId: 'z4b1' }),
  task('t10', 'Prune / top the pear', { bedId: 'z4b1' }),
  task('t11', 'Decide on plum removal', { bedId: 'z4b1' }),
  task('t12', 'Consider a soaker hose for Zone 2', { zoneId: 'z2' }),
];

const garden: Garden = {
  id: DEMO_GARDEN_ID, name: 'Home garden', createdAt: now, updatedAt: now,
};

// Memoize so concurrent callers (e.g. React StrictMode's double-invoked effect)
// share a single seeding transaction instead of racing to insert duplicates.
let seeding: Promise<void> | null = null;

/** Populate IndexedDB on first run. Idempotent: no-op if a garden already exists. */
export function seedIfEmpty(): Promise<void> {
  seeding ??= db.transaction(
    'rw',
    [db.gardens, db.zones, db.beds, db.plants, db.covers, db.sensors, db.irrigation, db.tasks],
    async () => {
      if ((await db.gardens.count()) > 0) return;
      await db.gardens.add(garden);
      await db.zones.bulkAdd(zones);
      await db.beds.bulkAdd(beds);
      await db.plants.bulkAdd(plants);
      await db.covers.bulkAdd(covers);
      await db.sensors.bulkAdd(sensors);
      await db.irrigation.bulkAdd(irrigation);
      await db.tasks.bulkAdd(tasks);
    },
  );
  return seeding;
}
