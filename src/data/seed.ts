// ════════════════════════════════════════════════════════════════════════════
// Seed data — the real garden, transcribed from the audit
// (docs/reference/tend-register.jsx, itself auto-compiled from a spoken
// walkthrough). This is the canonical inventory: 16 beds, full plant lists with
// issues/notes, systems (as first-class equipment), tasks, and an observations
// log. Positions are omitted — topological-first; placement is a later pass.
// ════════════════════════════════════════════════════════════════════════════
import { db } from './db';
import type {
  Bed, BedType, Cover, CropCategory, Garden, IrrigationNode, Observation,
  Plant, Sensor, Task, Zone,
} from '@/domain';

export const DEMO_GARDEN_ID = 'demo';
const SEED_VERSION = 6; // bump to force a clean reseed in dev
const now = Date.now();

// ── builders ──────────────────────────────────────────────────────────────────
let pc = 0;
type PlantOpts = { issue?: string; note?: string; variety?: string };
type Entry = string | [string, PlantOpts];
const mkPlants = (bedId: string, cat: CropCategory, entries: Entry[]): Plant[] =>
  entries.map((e) => {
    const [name, opts] = Array.isArray(e) ? e : [e, {} as PlantOpts];
    return { id: `p${++pc}`, bedId, name, note: opts.note, issue: opts.issue, variety: opts.variety, attributes: { cropCategory: cat } };
  });

const B = (
  id: string, zoneId: string, code: string, name: string, type: BedType,
  typeDetail: string, exposure: string, category: string, extra: Partial<Bed> = {},
): Bed => ({ id, zoneId, code, name, type, typeDetail, exposure, category, ...extra });

// ── Garden + Zones ─────────────────────────────────────────────────────────────
const garden: Garden = { id: DEMO_GARDEN_ID, name: 'Home garden', createdAt: now, updatedAt: now };

const zones: Zone[] = [
  { id: 'z1', gardenId: DEMO_GARDEN_ID, name: 'Main Production', description: 'Vigo raised beds · greenhouse · she-shed', sunExposure: 'full-sun' },
  { id: 'z2', gardenId: DEMO_GARDEN_ID, name: 'Brassicas', description: 'Aluminum raised beds', sunExposure: 'partial-shade', about: 'The shady side of the yard. Sun/shade is the limiting factor here — and there’s no data on it yet.' },
  { id: 'z3', gardenId: DEMO_GARDEN_ID, name: 'Herbs & Lettuce', description: 'Patio, by the back door', sunExposure: 'partial-shade' },
  { id: 'z4', gardenId: DEMO_GARDEN_ID, name: 'Fruit & Berries', description: 'Fences & edges', sunExposure: 'unknown' },
];

// ── Beds ──────────────────────────────────────────────────────────────────────
const beds: Bed[] = [
  B('b01', 'z1', 'Z1·B01', 'Wicking Bed', 'vigo-wicking', 'Vigo — wicking floor + reservoir', 'Full sun', 'Brassicas & roots', { state: { reservoirLevel: 0.8, irrigationOn: false }, footprint: { x: 14, y: 58, w: 30, h: 90 } }),
  B('b02', 'z1', 'Z1·B02', 'Trial Bed', 'vigo', 'Vigo raised — newest', 'Full sun', 'Fruiting (trial)', { structures: ['Trellis'], soilNotes: 'The former “cold plunge.” Fully experimental this season.', footprint: { x: 14, y: 14, w: 28, h: 30 } }),
  B('b03', 'z1', 'Z1·B03', 'Berry & Potato', 'vigo', 'Vigo raised', 'Full sun', 'Mixed', { footprint: { x: 50, y: 14, w: 34, h: 30 } }),
  B('b04', 'z1', 'Z1·B04', 'Peppers & Eggplant', 'vigo-wicking', 'Vigo — wicking floor', 'Full sun · hot', 'Fruiting', { state: { reservoirLevel: 0.6, irrigationOn: false }, layout: { kind: 'rows', rows: 2 }, footprint: { x: 92, y: 10, w: 58, h: 34 } }),
  B('b05', 'z1', 'Z1·B05', 'Front Tomato Bed', 'vigo', 'Vigo raised — large', 'Full sun', 'Fruiting', { footprint: { x: 54, y: 58, w: 92, h: 46 } }),
  B('b06', 'z1', 'Z1·B06', 'Pea Bed', 'vigo', 'Vigo raised — no wicking', 'Full sun', 'Legumes', { footprint: { x: 158, y: 14, w: 30, h: 30 } }),
  B('b07', 'z1', 'Z1·B07', 'Potato Bed', 'vigo', 'Vigo raised', 'Full sun', 'Roots', { footprint: { x: 196, y: 14, w: 30, h: 30 } }),
  B('b08', 'z1', 'Z1·B08', 'She-shed Squash', 'vigo', 'Raised bed', 'Full sun', 'Squash & mixed', { footprint: { x: 54, y: 114, w: 60, h: 40 }, shape: 'ellipse' }),
  B('b09', 'z1', 'Z1·GH', 'Greenhouse', 'greenhouse', 'Greenhouse structure — 8×6', 'Warm', 'Fruiting', { widthFt: 8, lengthFt: 6, footprint: { x: 158, y: 54, w: 86, h: 86 } }),
  B('b10', 'z2', 'Z2·B01', 'Brassica Bed A', 'aluminum-raised', 'Aluminum raised', 'Partial shade', 'Brassicas & roots'),
  B('b11', 'z2', 'Z2·B02', 'Brassica Bed B', 'aluminum-raised', 'Aluminum raised', 'Partial shade', 'Brassicas & roots'),
  B('b12', 'z3', 'Z3·B01', 'Herb Collection', 'container', 'Containers', 'Partial sun', 'Herbs'),
  B('b13', 'z3', 'Z3·B02', 'Lettuce Bed', 'vigo', 'Vigo raised — mesh cover, no reservoir', 'Partial sun', 'Greens'),
  B('b14', 'z4', 'Z4·B01', 'Fruit Trees', 'in-ground', 'In-ground / edges', 'Varies', 'Fruit & berries'),
  B('b15', 'z4', 'Z4·B02', 'Berries', 'in-ground', 'In-ground / edges', 'Varies', 'Fruit & berries'),
  B('b16', 'z4', 'Z4·B03', 'Citrus & Avocado', 'container', 'Containers, by the patio', 'Full sun', 'Fruit & berries'),
];

// ── Plantings ───────────────────────────────────────────────────────────────────
const plants: Plant[] = [
  ...mkPlants('b01', 'brassica', ['Brussels sprouts', ['Broccoli', { issue: 'bolted' }], ['Carrots', { issue: 'bolted · shallow soil' }], 'Beets', ['Chard', { note: 'transplanted' }], 'Fennel', ['Radishes', { issue: 'failed' }], 'Broccoli rabe']),
  ...mkPlants('b02', 'fruiting', ['Tomato', 'Cucumber', 'Cucumber']),
  ...mkPlants('b03', 'root', [['Strawberries', { issue: 'mold' }], ['Potatoes', { note: 'volunteers' }], ['Asparagus', { note: 'intended' }], ['Carrots', { note: 'volunteer' }]]),
  ...mkPlants('b04', 'fruiting', ['Anaheim', 'Jalapeño', 'Cherry pepper', 'Bell pepper', 'Shishito', 'Ancho', 'Padrone', ['Eggplant', { note: 'Japanese / long' }], 'Suyo cucumber']),
  ...mkPlants('b05', 'fruiting', ['Gold Dust', 'Manana Orange', 'Hillbilly', 'Early Annie', 'Roma', 'Orange Roma', ['Moskovich', { note: 'Russian cultivar' }], ['Isichka', { note: 'Russian cultivar' }], 'Japanese Black', 'Cherry', 'Cherry', ['San Marzano', { note: 'uncertain' }], ['Peas', { issue: 'labels lost' }]]),
  ...mkPlants('b06', 'legume', [['Peas', { issue: 'shell vs. sugar snap — unverified' }]]),
  ...mkPlants('b07', 'root', ['Potatoes', ['Fennel', { note: 'old' }]]),
  ...mkPlants('b08', 'cucurbit', ['Zucchini', 'Yellow squash', 'Butternut', 'Pattypan', 'Delicata', 'Acorn', 'Winter squash', 'Pumpkins', 'Rhubarb', 'Rhubarb', ['Strawberries', { note: 'incl. white' }], 'Celery', 'Celery']),
  ...mkPlants('b09', 'fruiting', ['Suyo cucumber', 'Sano cucumber', 'Parisian cucumber', 'Diva cucumber', 'Ancho', 'Bell pepper', 'Shishito', 'Jalapeño', 'Eggplant', 'Japanese Black tomato', 'Tiny Tim tomato']),
  ...mkPlants('b10', 'brassica', ['Broccoli rabe', 'Carrots', ['Kale', { note: 'several kinds' }], ['Onions', { note: 'green + regular' }], ['Spinach', { issue: 'overgrown' }], 'Broccoli', 'Fennel', 'Sweet potato', 'Brussels sprouts']),
  ...mkPlants('b11', 'brassica', ['Celery', 'Potatoes', ['Kale', { issue: 'bolted' }], 'Onions', 'Brussels sprouts']),
  ...mkPlants('b12', 'herb', ['Mint', 'Sage', 'Chives', 'Cilantro / parsley', 'Thai basil', 'Basil', 'Purple basil', 'Rosemary', 'Rosemary', 'Thyme', 'Oregano', 'Arugula', 'Kale', 'Cucumber']),
  ...mkPlants('b13', 'leafy', ['Romaine', 'Radicchio', 'Spiky lettuces']),
  ...mkPlants('b14', 'fruit-tree', [['Plum', { issue: 'flowered, no fruit' }], ['Plum', { issue: 'flowered, no fruit' }], ['Apple', { note: 'young' }], ['Apple', { note: 'multi-graft: Honeycrisp / Braeburn / Fuji / Gala' }], 'Cherry', 'Pear', ['Fig', { issue: 'dead' }], ['Camellia', { note: 'ornamental' }]]),
  ...mkPlants('b15', 'berry', [['Blueberry', { note: '2–3 cultivars' }], 'Raspberry', 'Raspberry', 'Raspberry', 'Blackberry', ['Roses', { note: 'ornamental' }]]),
  ...mkPlants('b16', 'fruit-tree', ['Avocado', 'Lime', 'Lemon']),
];

// ── Equipment (first-class, derived from the audit's per-bed systems) ───────────
const covers: Cover[] = [
  { id: 'cover-b01', gardenId: DEMO_GARDEN_ID, kind: 'heat', label: 'Greenhouse cover (winter)', assignedBedId: 'b01' },
  { id: 'cover-b04', gardenId: DEMO_GARDEN_ID, kind: 'heat', label: 'Greenhouse cover (heat)', assignedBedId: 'b04' },
  { id: 'cover-b06', gardenId: DEMO_GARDEN_ID, kind: 'heat', label: 'Greenhouse cover', assignedBedId: 'b06' },
  { id: 'cover-b13', gardenId: DEMO_GARDEN_ID, kind: 'mesh-shade', label: 'Mesh / shade cover', assignedBedId: 'b13' },
];

const sensors: Sensor[] = [
  { id: 'govee-b04', gardenId: DEMO_GARDEN_ID, label: 'Govee temp / humidity', measures: 'temp-humidity', assignedBedId: 'b04', reading: { tempF: 88, humidityPct: 54, updatedAt: now } },
  { id: 'govee-b09', gardenId: DEMO_GARDEN_ID, label: 'Govee temp / humidity', measures: 'temp-humidity', assignedBedId: 'b09', reading: { tempF: 82, humidityPct: 71, updatedAt: now } },
];

const irrigation: IrrigationNode[] = [
  { id: 'irr-b01', gardenId: DEMO_GARDEN_ID, bedId: 'b01', on: false, kind: 'emitters', notes: 'Own node — often off (wicking)' },
  { id: 'irr-b02', gardenId: DEMO_GARDEN_ID, bedId: 'b02', on: false, kind: 'emitters', notes: 'Own node — in progress' },
  { id: 'irr-b07', gardenId: DEMO_GARDEN_ID, bedId: 'b07', on: true, kind: 'emitters', emitterCount: 3, order: 99, notes: 'Line ends here' },
  { id: 'irr-b09', gardenId: DEMO_GARDEN_ID, bedId: 'b09', on: true, kind: 'misters' },
  { id: 'irr-b13', gardenId: DEMO_GARDEN_ID, bedId: 'b13', on: false, kind: 'misters', notes: 'Awaiting tubing (~Jul)' },
];

// ── Tasks ───────────────────────────────────────────────────────────────────────
const task = (id: string, text: string, bedId: string): Task => ({ id, gardenId: DEMO_GARDEN_ID, text, bedId, done: false, createdAt: now });
const tasks: Task[] = [
  task('t1', 'Pull the bolted broccoli', 'b01'),
  task('t2', 'Top up soil depth', 'b01'),
  task('t3', 'Finish the irrigation hookup', 'b02'),
  task('t4', 'Add soil', 'b03'),
  task('t5', 'Thin the asparagus', 'b03'),
  task('t6', 'Treat strawberry mold', 'b03'),
  task('t7', 'Add a 4th emitter', 'b07'),
  task('t8', 'Consider a soaker hose for this zone', 'b11'),
  task('t9', 'Connect irrigation', 'b13'),
  task('t10', 'Add a mister (anti-bolt)', 'b13'),
  task('t11', 'Prune the cherry’s lower branches', 'b14'),
  task('t12', 'Prune / top the pear', 'b14'),
  task('t13', 'Decide whether the plums stay', 'b14'),
];

// ── Observations (notes log) ────────────────────────────────────────────────────
let oc = 0;
const obs = (bedId: string, date: string, text: string): Observation => ({ id: `o${++oc}`, gardenId: DEMO_GARDEN_ID, bedId, date, text, createdAt: now });
const observations: Observation[] = [
  obs('b01', 'Jun', 'Broccoli bolted — not enough sun while it’s still cool. Recurring.'),
  obs('b02', 'Jun', 'The former “cold plunge.” Fully experimental this season.'),
  obs('b03', 'Jun', 'Strawberries molding on the fruit. Potatoes showed up on their own and took over.'),
  obs('b04', 'Jun', 'Runs hot — the smaller cover heats faster than the others.'),
  obs('b04', 'Note', 'Fruiting, so it needs pollination; can’t stay sealed under a closed cover.'),
  obs('b05', 'Jun 12', 'Cover came off ~Jun 10. Plants that sat under it are clearly bigger. Clear data — repeat next year.'),
  obs('b13', 'Jun', 'Birds eat the seeds without the mesh. Considering a mister to stop summer bolting.'),
];

// ── Seed ────────────────────────────────────────────────────────────────────────
// Memoized so concurrent callers share one transaction. Reseeds when the stored
// SEED_VERSION is older than the current one (dev convenience; no user data yet).
let seeding: Promise<void> | null = null;

export function seedIfEmpty(): Promise<void> {
  seeding ??= db.transaction(
    'rw',
    [db.gardens, db.zones, db.beds, db.plants, db.covers, db.sensors, db.irrigation, db.tasks, db.observations, db.meta],
    async () => {
      const stored = (await db.meta.get('seedVersion'))?.value ?? 0;
      const hasGarden = (await db.gardens.count()) > 0;
      if (hasGarden && stored === SEED_VERSION) return;

      await Promise.all([
        db.gardens.clear(), db.zones.clear(), db.beds.clear(), db.plants.clear(),
        db.covers.clear(), db.sensors.clear(), db.irrigation.clear(), db.tasks.clear(), db.observations.clear(),
      ]);
      await db.gardens.add(garden);
      await db.zones.bulkAdd(zones);
      await db.beds.bulkAdd(beds);
      await db.plants.bulkAdd(plants);
      await db.covers.bulkAdd(covers);
      await db.sensors.bulkAdd(sensors);
      await db.irrigation.bulkAdd(irrigation);
      await db.tasks.bulkAdd(tasks);
      await db.observations.bulkAdd(observations);
      await db.meta.put({ key: 'seedVersion', value: SEED_VERSION });
    },
  );
  return seeding;
}
