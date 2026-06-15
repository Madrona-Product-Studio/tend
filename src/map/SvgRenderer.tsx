// SVG renderer — one candidate behind MapRendererProps. Owns its <svg> surface
// and applies the camera as a group transform. Crisp vectors, DOM events, token
// styling. Renderer choice is OPEN (docs/map-renderer-decision.md).
import { useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { plantsInBed, equipmentForBed, BED_TYPE_LABEL, type CropCategory } from '@/domain';
import { SANS, T } from '@design/tokens';
import type { BedNode, MapRendererProps, Scene } from './types';

// Categorical accents for crop types (deliberately outside core UI tokens).
const DOT: Record<CropCategory, string> = {
  brassica: '#4a7c59', leafy: '#6b9e6b', fruiting: T.seal, cucurbit: '#c8873a',
  root: '#a06a3a', allium: '#8c7bb0', herb: '#5a8f6a', legume: '#7aa05a',
  berry: '#9a3b6a', 'fruit-tree': '#7a5230', other: T.muted,
};

export function SvgRenderer({
  scene, lod, viewport, camera, onMoveBed, onCommitBed, onBedDragStart, onBedDragEnd,
}: MapRendererProps) {
  const bedsVisible = lod !== 'garden';
  const plantsVisible = lod === 'bed';

  return (
    <svg width={viewport.w} height={viewport.h} className="block">
      <g transform={`translate(${camera.x} ${camera.y}) scale(${camera.s})`}>
        {scene.zones.map((z) => (
          <g key={z.id}>
            <rect x={z.rect.x} y={z.rect.y} width={z.rect.w} height={z.rect.h} rx={14}
              fill={T.paper} stroke={T.line} strokeWidth={1.5} />
            <text x={z.rect.x + 20} y={z.rect.y + 32} fontFamily={SANS} fontSize={22} fontWeight={700}
              fill={T.ink} style={{ letterSpacing: '-0.02em' }}>
              {z.zone.name}
            </text>
          </g>
        ))}

        <g style={{ opacity: bedsVisible ? 1 : 0, transition: 'opacity 240ms ease', pointerEvents: bedsVisible ? 'auto' : 'none' }}>
          {scene.beds.map((b) => (
            <BedShape
              key={b.id} node={b} scene={scene} scale={camera.s} plantsVisible={plantsVisible}
              onMoveBed={onMoveBed} onCommitBed={onCommitBed}
              onBedDragStart={onBedDragStart} onBedDragEnd={onBedDragEnd}
            />
          ))}
        </g>
      </g>
    </svg>
  );
}

function BedShape({ node, scene, scale, plantsVisible, onMoveBed, onCommitBed, onBedDragStart, onBedDragEnd }: {
  node: BedNode;
  scene: Scene;
  scale: number;
  plantsVisible: boolean;
  onMoveBed: MapRendererProps['onMoveBed'];
  onCommitBed: MapRendererProps['onCommitBed'];
  onBedDragStart: MapRendererProps['onBedDragStart'];
  onBedDragEnd: MapRendererProps['onBedDragEnd'];
}) {
  const { rect, bed } = node;
  const drag = useRef<{ x: number; y: number } | null>(null);
  const plants = plantsInBed(scene.tree, bed.id);
  const irr = equipmentForBed(scene.tree, bed.id).irrigation[0];
  const reservoir = bed.state?.reservoirLevel;

  const onDown = (e: ReactPointerEvent) => {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY };
    onBedDragStart();
  };
  const onMove = (e: ReactPointerEvent) => {
    if (!drag.current) return;
    onMoveBed(bed.id, (e.clientX - drag.current.x) / scale, (e.clientY - drag.current.y) / scale);
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = () => { if (drag.current) { onCommitBed(bed.id); drag.current = null; onBedDragEnd(); } };

  return (
    <g onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} style={{ cursor: 'grab' }}>
      <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} rx={8} fill={T.card} stroke={T.line} strokeWidth={1.25} />
      <text x={rect.x + 12} y={rect.y + 22} fontFamily={SANS} fontSize={13} fontWeight={600} fill={T.ink}>{clip(bed.name, 20)}</text>
      <text x={rect.x + 12} y={rect.y + 37} fontFamily={SANS} fontSize={8.5} fontWeight={700} fill={T.muted}
        style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>{BED_TYPE_LABEL[bed.type]}</text>

      <g style={{ opacity: plantsVisible ? 1 : 0, transition: 'opacity 200ms ease' }}>
        {plants.slice(0, 6).map((p, i) => (
          <circle key={p.id} cx={rect.x + 15 + i * 13} cy={rect.y + 54} r={4} fill={DOT[p.attributes.cropCategory]} />
        ))}
        {plants.length > 0 && (
          <text x={rect.x + 12} y={rect.y + 76} fontFamily={SANS} fontSize={8} fill={T.clay}>
            {clip(plants.map((p) => p.variety ?? p.name).join(', '), 30)}
          </text>
        )}
      </g>

      {typeof reservoir === 'number' && (
        <>
          <rect x={rect.x + 12} y={rect.y + rect.h - 12} width={rect.w - 24} height={3} rx={1.5} fill={T.lineSoft} />
          <rect x={rect.x + 12} y={rect.y + rect.h - 12} width={(rect.w - 24) * reservoir} height={3} rx={1.5} fill={T.live} />
        </>
      )}
      {irr && <circle cx={rect.x + rect.w - 12} cy={rect.y + 14} r={3.5} fill={irr.on ? T.live : T.faint} />}
    </g>
  );
}

function clip(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
