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

/** Level-of-detail — detail resolves as you zoom in. */
export type Lod = 'garden' | 'zone' | 'bed';

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

/** What every concrete renderer receives. Renderer-agnostic: SVG and Canvas
 *  both consume this. The renderer owns its surface and applies `camera`. */
export interface MapRendererProps {
  scene: Scene;
  lod: Lod;
  viewport: Size;
  /** Plain-number camera (screen = world * s + x,y). Re-rendered per frame. */
  camera: Camera;
  /** Move a bed by a world-space delta (live, during drag). */
  onMoveBed: (bedId: string, dxWorld: number, dyWorld: number) => void;
  /** Persist a bed's placement (on drag end). */
  onCommitBed: (bedId: string) => void;
  /** Tell the host a bed drag is in progress, so camera panning yields. */
  onBedDragStart: () => void;
  onBedDragEnd: () => void;
}
