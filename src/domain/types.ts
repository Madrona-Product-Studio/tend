// ════════════════════════════════════════════════════════════════════════════
// Tend domain model — the typed core.
//
// Pure types only: no React, no Dexie, no renderer. Storage (src/data) and UI
// (src/pages, src/design) depend on this; it depends on nothing. Keep it that
// way — it's the stable centre the map renderer and storage layer swap around.
//
// Shape: Garden → Zone → Bed → Plant, plus cross-cutting first-class objects
// (covers, sensors, irrigation nodes) that move between beds, à la Sonos.
// ════════════════════════════════════════════════════════════════════════════

export type ID = string;

// ── Enums / unions ────────────────────────────────────────────────────────────

export type BedType =
  | 'vigo-wicking'     // Vigo raised + wicking floor + reservoir + level indicator
  | 'vigo'             // Vigo raised, no wicking
  | 'aluminum-raised'
  | 'greenhouse'
  | 'container'
  | 'in-ground';

export type CropCategory =
  | 'brassica' | 'fruiting' | 'root' | 'allium' | 'herb'
  | 'legume' | 'leafy' | 'cucurbit' | 'fruit-tree' | 'berry' | 'other';

export type Season = 'cool' | 'warm' | 'perennial';

export type CoverKind = 'heat' | 'mesh-shade';

export type SunExposure = 'full-sun' | 'partial-shade' | 'shade' | 'unknown';

export type IrrigationKind = 'emitters' | 'misters' | 'soaker';

// ── Geometry (topological-first; the human supplies real positions later) ──────

export interface Point { x: number; y: number }

/** A placement on the map. `undefined` position = not yet placed by the human. */
export interface Placement {
  position?: Point;   // normalized garden coordinates
  rotation?: number;  // degrees
}

// ── Entities ──────────────────────────────────────────────────────────────────

export interface Garden {
  id: ID;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface Zone extends Placement {
  id: ID;
  gardenId: ID;
  name: string;
  description?: string;
  about?: string;              // longer narrative (e.g. "the shady side of the yard…")
  sunExposure?: SunExposure;   // flagged as the single most important factor
  soilTempF?: number;
}

/** Live, changing state shown on the map — turns a diagram into a dashboard. */
export interface BedState {
  reservoirLevel?: number;   // 0..1, for wicking beds with a reservoir
  irrigationOn?: boolean;
}

export interface Bed extends Placement {
  id: ID;
  zoneId: ID;
  name: string;
  code?: string;          // human locator, e.g. "Z1·B01"
  type: BedType;
  typeDetail?: string;    // freeform descriptor from the audit, e.g. "Vigo — wicking floor + reservoir"
  category?: string;      // crop grouping label, e.g. "Brassicas & roots"
  exposure?: string;      // freeform, e.g. "Full sun · hot"
  structures?: string[];  // non-movable fixtures (e.g. trellis)
  widthFt?: number;
  lengthFt?: number;
  soilNotes?: string;
  state?: BedState;
}

/** Attributes that drive future recommendations (season planning, pollination…). */
export interface PlantAttributes {
  cropCategory: CropCategory;
  season?: Season;
  pollinationRequired?: boolean;
  soilTempNeedF?: number;     // min soil temp for warm crops (~60–70°F)
  boltingRisk?: boolean;
  soilDepthNeedIn?: number;
  waterDemand?: 'low' | 'medium' | 'high';
}

export interface Plant {
  id: ID;
  bedId: ID;
  name: string;        // common name, e.g. "Tomato"
  variety?: string;    // cultivar, e.g. "San Marzano"
  datePlanted?: number;
  attributes: PlantAttributes;
  note?: string;       // neutral note, e.g. "transplanted", "volunteer"
  issue?: string;      // a problem flag, e.g. "bolted", "mold", "failed"
  notes?: string;      // legacy free text (kept for compatibility)
}

// ── Movable equipment (limited quantity, reassigned between beds) ──────────────

export interface Cover {
  id: ID;
  gardenId: ID;
  kind: CoverKind;
  label: string;
  sizeNote?: string;
  assignedBedId?: ID;  // undefined = in storage / unassigned
}

export interface Sensor {
  id: ID;
  gardenId: ID;
  label: string;       // e.g. "Govee #1"
  measures: 'temp-humidity';
  assignedBedId?: ID;
  reliabilityNote?: string;
}

/** Irrigation is a network with state, not a boolean: hose → nodes → per-bed
 *  switch → emitters/misters. `order` carries topology (where the line ends). */
export interface IrrigationNode {
  id: ID;
  gardenId: ID;
  bedId?: ID;
  on: boolean;
  kind?: IrrigationKind;
  emitterCount?: number;
  order?: number;
  notes?: string;
}

/** A walkthrough yields a map *and* a plan — the punch-list lives here. */
export interface Task {
  id: ID;
  gardenId: ID;
  zoneId?: ID;
  bedId?: ID;
  text: string;
  done: boolean;
  createdAt: number;
}

/** Observations (notes) cross-cut: they attach to a garden, zone, bed, or
 *  planting. The heart of year-over-year refinement. */
export interface Observation {
  id: ID;
  gardenId: ID;
  zoneId?: ID;
  bedId?: ID;
  plantId?: ID;
  date: string;        // human label from the audit ("Jun", "Jun 12", "Note")
  text: string;
  createdAt: number;
}

// ── Aggregate ─────────────────────────────────────────────────────────────────

/** Everything for one garden, loaded together for the map/views. */
export interface GardenTree {
  garden: Garden;
  zones: Zone[];
  beds: Bed[];
  plants: Plant[];
  covers: Cover[];
  sensors: Sensor[];
  irrigation: IrrigationNode[];
  tasks: Task[];
  observations: Observation[];
}
