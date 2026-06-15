// ════════════════════════════════════════════════════════════════════════════
// Map types — the renderer-independent contract.
//
// The camera, scene layout, and level-of-detail live here and know nothing about
// SVG/Canvas/WebGL. A concrete renderer (src/map/SvgRenderer.tsx is the first
// candidate) implements `MapRendererProps`. Swapping renderers must not touch
// the camera or scene. Renderer choice is OPEN — see docs/map-renderer-decision.md.
// ════════════════════════════════════════════════════════════════════════════
import type { Bed, GardenTree, Zone } from '@/domain';

export interface Point { x: number; y: number }
export interface Size { w: number; h: number }
export interface Rect { x: number; y: number; w: number; h: number }

/** Camera as the SVG group transform: screen = world * s + (x, y). */
export interface Camera { x: number; y: number; s: number }

/** The three discrete levels — navigation steps, not continuous zoom. */
export type Lod = 'garden' | 'zone' | 'bed';

/** Where the user is in the drill-down. Drives both the camera framing and
 *  the rendered detail. Garden → Zone → Bed; back steps out. */
export type Focus =
  | { level: 'garden' }
  | { level: 'zone'; zoneId: string }
  | { level: 'bed'; zoneId: string; bedId: string };

/** A bed placed in world space, with its source entity for rendering detail. */
export interface BedNode {
  id: string;
  zoneId: string;
  rect: Rect;
  bed: Bed;
}

/** A zone region in world space (its bounding box over its beds). */
export interface ZoneNode {
  id: string;
  rect: Rect;
  zone: Zone;
}

/** The full laid-out scene the renderer draws. */
export interface Scene {
  bounds: Rect;       // world bounding box of everything (for fit-to-view)
  zones: ZoneNode[];
  beds: BedNode[];
  tree: GardenTree;   // for plant/equipment detail at bed LOD
}

/** What a concrete renderer receives. The renderer owns its surface, applies the
 *  `camera`, and renders detail for the current `focus` level. Kept behind this
 *  interface so the renderer stays swappable (we shipped the SVG one). */
export interface MapRendererProps {
  scene: Scene;
  focus: Focus;
  /** Plain-number camera (screen = world * s + x,y). Re-rendered per frame. */
  camera: Camera;
  viewport: Size;
  /** Drill into a zone (from garden level). */
  onSelectZone: (zoneId: string) => void;
  /** Open a bed (from zone level). */
  onSelectBed: (bedId: string) => void;
  /** Click empty space to step back out one level. */
  onBack: () => void;
}
