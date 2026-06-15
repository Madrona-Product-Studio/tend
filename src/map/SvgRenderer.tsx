// SVG renderer — the FIRST renderer candidate behind MapRendererProps. Draws
// world-space children only; the host wraps these in the camera transform.
// Renderer choice is OPEN (docs/map-renderer-decision.md); this proves the SVG
// path: crisp vectors, DOM events, easy token styling.
import { useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { plantsInBed, equipmentForBed, BED_TYPE_LABEL, type CropCategory } from '@/domain';
import { SANS, T } from '@design/tokens';
import type { BedNode, MapRendererProps } from './types';

// Data-viz palette for crop categories (intentionally outside the core tokens —
// these are categorical accents, not UI chrome).
const DOT: Record<CropCategory, string> = {
  brassica: '#4a7c59', leafy: '#6b9e6b', fruiting: T.seal, cucurbit: '#c8873a',
  root: '#a06a3a', allium: '#8c7bb0', herb: '#5a8f6a', legume: '#7aa05a',
  berry: '#9a3b6a', 'fruit-tree': '#7a5230', other: T.muted,
};

export function SvgRenderer({ scene, lod, onMoveBed, onCommitBed, getScale }: MapRendererProps) {
  const bedsVisible = lod !== 'garden';
  const plantsVisible = lod === 'bed';

  return (
    <>
      {/* Zone regions + names (always visible) */}
      {scene.zones.map((z) => (
        <g key={z.id}>
          <rect
            x={z.rect.x} y={z.rect.y} width={z.rect.w} height={z.rect.h} rx={14}
            fill={T.paper} stroke={T.line} strokeWidth={1.5}
          />
          <text x={z.rect.x + 20} y={z.rect.y + 32} fontFamily={SANS} fontSize={22} fontWeight={700}
            fill={T.ink} style={{ letterSpacing: '-0.02em' }}>
            {z.zone.name}
          </text>
        </g>
      ))}

      {/* Beds (resolve at zone LOD) */}
      <g style={{ opacity: bedsVisible ? 1 : 0, transition: 'opacity 240ms ease', pointerEvents: bedsVisible ? 'auto' : 'none' }}>
        {scene.beds.map((b) => (
          <BedShape
            key={b.id} node={b} scene={scene} plantsVisible={plantsVisible}
            onMoveBed={onMoveBed} onCommitBed={onCommitBed} getScale={getScale}
          />
        ))}
      </g>
    </>
  );
}

function BedShape({ node, scene, plantsVisible, onMoveBed, onCommitBed, getScale }: {
  node: BedNode;
  scene: MapRendererProps['scene'];
  plantsVisible: boolean;
  onMoveBed: MapRendererProps['onMoveBed'];
  onCommitBed: MapRendererProps['onCommitBed'];
  getScale: MapRendererProps['getScale'];
}) {
  const { rect, bed } = node;
  const drag = useRef<{ x: number; y: number } | null>(null);
  const plants = plantsInBed(scene.tree, bed.id);
  const { irrigation } = equipmentForBed(scene.tree, bed.id);
  const irr = irrigation[0];
  const reservoir = bed.state?.reservoirLevel;

  const onDown = (e: ReactPointerEvent) => {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const onMove = (e: ReactPointerEvent) => {
    if (!drag.current) return;
    const sc = getScale();
    onMoveBed(bed.id, (e.clientX - drag.current.x) / sc, (e.clientY - drag.current.y) / sc);
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = () => { if (drag.current) { onCommitBed(bed.id); drag.current = null; } };

  return (
    <g data-bed={bed.id} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      style={{ cursor: 'grab' }}>
      <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} rx={8} fill={T.card} stroke={T.line} strokeWidth={1.25} />

      <text x={rect.x + 12} y={rect.y + 22} fontFamily={SANS} fontSize={13} fontWeight={600} fill={T.ink}>
        {clip(bed.name, 20)}
      </text>
      <text x={rect.x + 12} y={rect.y + 37} fontFamily={SANS} fontSize={8.5} fontWeight={700} fill={T.muted}
        style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {BED_TYPE_LABEL[bed.type]}
      </text>

      {/* Plant detail (bed LOD) */}
      <g style={{ opacity: plantsVisible ? 1 : 0, transition: 'opacity 200ms ease' }}>
        {plants.slice(0, 6).map((p, i) => (
          <circle key={p.id} cx={rect.x + 15 + i * 13} cy={rect.y + 54} r={4}
            fill={DOT[p.attributes.cropCategory]} />
        ))}
        {plants.length > 0 && (
          <text x={rect.x + 12} y={rect.y + 76} fontFamily={SANS} fontSize={8} fill={T.clay}>
            {clip(plants.map((p) => p.variety ?? p.name).join(', '), 30)}
          </text>
        )}
      </g>

      {/* Reservoir state */}
      {typeof reservoir === 'number' && (
        <>
          <rect x={rect.x + 12} y={rect.y + rect.h - 12} width={rect.w - 24} height={3} rx={1.5} fill={T.lineSoft} />
          <rect x={rect.x + 12} y={rect.y + rect.h - 12} width={(rect.w - 24) * reservoir} height={3} rx={1.5} fill={T.live} />
        </>
      )}

      {/* Irrigation node indicator */}
      {irr && (
        <circle cx={rect.x + rect.w - 12} cy={rect.y + 14} r={3.5} fill={irr.on ? T.live : T.faint} />
      )}
    </g>
  );
}

function clip(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
