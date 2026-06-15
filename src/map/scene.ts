// Scene layout: turn a GardenTree into world-space rectangles for zones + beds.
//
// The walkthrough yields topology + inventory but NOT coordinates (the human
// supplies geometry). So we auto-layout a sensible starting arrangement and let
// the user drag beds to place them; saved positions win on reload.
import type { GardenTree } from '@/domain';
import { bedsInZone } from '@/domain';
import { SCALE_MAX, SCALE_MIN } from './lod';
import type { BedNode, Camera, Rect, Scene, Size, ZoneNode } from './types';

const BED_W = 150;
const BED_H = 100;
const BED_GAP = 26;
const ZONE_PAD = 34;
const ZONE_HEADER = 46;
const ZONE_GAP = 72;
const ZONE_COLS = 2;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function bedCols(n: number): number {
  return Math.min(4, Math.max(1, Math.ceil(Math.sqrt(n))));
}

function bbox(rects: Rect[]): Rect {
  const minX = Math.min(...rects.map((r) => r.x));
  const minY = Math.min(...rects.map((r) => r.y));
  const maxX = Math.max(...rects.map((r) => r.x + r.w));
  const maxY = Math.max(...rects.map((r) => r.y + r.h));
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export function buildScene(tree: GardenTree): Scene {
  const zones = tree.zones;

  // 1) Per-zone content size from an auto grid of its beds.
  const sizes = zones.map((z) => {
    const n = bedsInZone(tree, z.id).length || 1;
    const cols = bedCols(n);
    const rows = Math.ceil(n / cols);
    const contentW = cols * BED_W + (cols - 1) * BED_GAP;
    const contentH = rows * BED_H + (rows - 1) * BED_GAP;
    return { cols, w: contentW + ZONE_PAD * 2, h: contentH + ZONE_HEADER + ZONE_PAD * 2 };
  });

  // 2) Place zones in a fixed-column grid (equal cell width, per-row height).
  const cellW = Math.max(...sizes.map((s) => s.w)) + ZONE_GAP;
  const rowHeights: number[] = [];
  zones.forEach((_, i) => {
    const r = Math.floor(i / ZONE_COLS);
    rowHeights[r] = Math.max(rowHeights[r] ?? 0, sizes[i]!.h);
  });
  const rowY: number[] = [];
  rowHeights.forEach((_, r) => { rowY[r] = r === 0 ? 0 : rowY[r - 1]! + rowHeights[r - 1]! + ZONE_GAP; });

  const bedNodes: BedNode[] = [];
  const zoneNodes: ZoneNode[] = [];

  zones.forEach((zone, zi) => {
    const col = zi % ZONE_COLS;
    const row = Math.floor(zi / ZONE_COLS);
    const ox = col * cellW;
    const oy = rowY[row]!;
    const cols = sizes[zi]!.cols;

    const beds = bedsInZone(tree, zone.id);
    const theseBeds: BedNode[] = beds.map((bed, bi) => {
      const auto = {
        x: ox + ZONE_PAD + (bi % cols) * (BED_W + BED_GAP),
        y: oy + ZONE_HEADER + ZONE_PAD + Math.floor(bi / cols) * (BED_H + BED_GAP),
      };
      // Always auto-layout for now — explicit "arrange" mode (drag-to-place,
      // honoring bed.position) returns in a later pass.
      return { id: bed.id, zoneId: zone.id, bed, rect: { x: auto.x, y: auto.y, w: BED_W, h: BED_H } };
    });

    // Zone region = bbox of its beds, expanded for padding + header.
    const inner = theseBeds.length ? bbox(theseBeds.map((b) => b.rect)) : { x: ox, y: oy, w: 200, h: 120 };
    const rect: Rect = {
      x: inner.x - ZONE_PAD,
      y: inner.y - ZONE_PAD - ZONE_HEADER,
      w: inner.w + ZONE_PAD * 2,
      h: inner.h + ZONE_PAD * 2 + ZONE_HEADER,
    };

    zoneNodes.push({ id: zone.id, zone, rect });
    bedNodes.push(...theseBeds);
  });

  const bounds = bbox(zoneNodes.map((z) => z.rect));
  return { bounds, zones: zoneNodes, beds: bedNodes, tree };
}

/** Camera that fits `bounds` into `viewport` with margin. */
export function fitCamera(bounds: Rect, viewport: Size, pad = 0.82): Camera {
  if (viewport.w === 0 || viewport.h === 0 || bounds.w === 0 || bounds.h === 0) {
    return { x: 0, y: 0, s: 1 };
  }
  const s = clamp(Math.min(viewport.w / bounds.w, viewport.h / bounds.h) * pad, SCALE_MIN, SCALE_MAX);
  const x = viewport.w / 2 - (bounds.x + bounds.w / 2) * s;
  const y = viewport.h / 2 - (bounds.y + bounds.h / 2) * s;
  return { x, y, s };
}

export { BED_W, BED_H, clamp };
