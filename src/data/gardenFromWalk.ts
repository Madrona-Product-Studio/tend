// Map a parsed garden-walk draft (from /api/parse-walk) into real domain
// entities with fresh IDs, so the client can review and then build the garden
// with insertGarden + insertGardenContents. Geometry isn't in a spoken walk, so
// beds auto-layout topologically (the human arranges later) — same as templates.
import type {
  Bed, Cover, CoverKind, CropCategory, IrrigationKind, IrrigationNode,
  Plant, Sensor, SunExposure, Task, Zone,
} from '@/domain';
import { categoryForPlant } from '@/data/plantCatalog';

// The shape /api/parse-walk returns (schema-validated by structured output).
export interface WalkDraft {
  gardenName: string | null;
  zones: WalkZone[];
  tasks: { text: string; bed: string | null }[];
}
export interface WalkZone {
  name: string;
  description: string | null;
  sunExposure: SunExposure | null;
  beds: WalkBed[];
}
export interface WalkBed {
  name: string;
  type: Bed['type'] | null;
  typeDetail: string | null;
  plants: { name: string; variety: string | null; cropCategory: CropCategory | null; note: string | null; issue: string | null }[];
  hasReservoir: boolean;
  irrigation: IrrigationKind | null;
  cover: CoverKind | null;
  hasSensor: boolean;
}

export interface WalkContents {
  zones: Zone[]; beds: Bed[]; plants: Plant[];
  covers: Cover[]; sensors: Sensor[]; irrigation: IrrigationNode[]; tasks: Task[];
}

const uid = () => crypto.randomUUID();

// Lay a zone's beds in a tidy wrapping row (topological; to-scale comes later).
const footprintFor = (i: number) => {
  const W = 60, H = 46, GAP = 8, COLS = 3;
  return { x: 8 + (i % COLS) * (W + GAP), y: 8 + Math.floor(i / COLS) * (H + GAP), w: W, h: H };
};

export function contentsFromDraft(gardenId: string, draft: WalkDraft): WalkContents {
  const zones: Zone[] = [];
  const beds: Bed[] = [];
  const plants: Plant[] = [];
  const covers: Cover[] = [];
  const sensors: Sensor[] = [];
  const irrigation: IrrigationNode[] = [];
  const bedIdByName = new Map<string, string>();   // lowercased bed name -> id (for task linking)

  for (const z of draft.zones) {
    const zoneId = uid();
    zones.push({
      id: zoneId, gardenId, name: z.name.trim() || 'Zone',
      description: z.description?.trim() || undefined,
      sunExposure: z.sunExposure ?? undefined,
    });

    z.beds.forEach((b, i) => {
      const bedId = uid();
      // A described reservoir implies a wicking bed; never fabricate its level.
      const type = b.type ?? (b.hasReservoir ? 'vigo-wicking' : 'in-ground');
      beds.push({
        id: bedId, zoneId, name: b.name.trim() || 'Bed',
        type, typeDetail: b.typeDetail?.trim() || undefined,
        footprint: footprintFor(i),
      });
      const key = b.name.trim().toLowerCase();
      if (key && !bedIdByName.has(key)) bedIdByName.set(key, bedId);

      for (const p of b.plants) {
        const name = p.name.trim();
        if (!name) continue;
        plants.push({
          id: uid(), bedId, name,
          variety: p.variety?.trim() || undefined,
          note: p.note?.trim() || undefined,
          issue: p.issue?.trim() || undefined,
          attributes: { cropCategory: p.cropCategory ?? categoryForPlant(name) ?? 'other' },
        });
      }

      // Real hardware the person described — created without any fabricated readings.
      if (b.cover) {
        covers.push({ id: uid(), gardenId, kind: b.cover, label: b.cover === 'heat' ? 'Heat cover' : 'Mesh / shade cover', assignedBedId: bedId });
      }
      if (b.hasSensor) {
        sensors.push({ id: uid(), gardenId, label: 'Temp / humidity', measures: 'temp-humidity', assignedBedId: bedId });
      }
      if (b.irrigation) {
        irrigation.push({ id: uid(), gardenId, bedId, on: false, kind: b.irrigation });
      }
    });
  }

  const now = Date.now();
  const tasks: Task[] = draft.tasks
    .filter((t) => t.text.trim())
    .map((t) => ({
      id: uid(), gardenId,
      bedId: t.bed ? bedIdByName.get(t.bed.trim().toLowerCase()) : undefined,
      text: t.text.trim(), done: false, createdAt: now,
    }));

  return { zones, beds, plants, covers, sensors, irrigation, tasks };
}
