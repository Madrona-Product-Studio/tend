// SVG renderer (the shipped renderer, behind MapRendererProps). Renders the
// three discrete levels — Garden overview, Zone, Bed — with the camera framing
// the focused element. Garden: zones are tappable cards. Zone: beds resolve and
// are tappable. Bed: the focused bed shows plants, reservoir level, and the
// irrigation emitter bar (per docs diagram).
import type { MouseEvent } from 'react';
import { plantsInBed, equipmentForBed, BED_TYPE_LABEL, type CropCategory } from '@/domain';
import { SANS, T } from '@design/tokens';
import type { BedNode, Focus, MapRendererProps, Scene } from './types';

const DOT: Record<CropCategory, string> = {
  brassica: '#4a7c59', leafy: '#6b9e6b', fruiting: T.seal, cucurbit: '#c8873a',
  root: '#a06a3a', allium: '#8c7bb0', herb: '#5a8f6a', legume: '#7aa05a',
  berry: '#9a3b6a', 'fruit-tree': '#7a5230', other: T.muted,
};

const focusZoneId = (f: Focus) => (f.level === 'garden' ? undefined : f.zoneId);

export function SvgRenderer({ scene, focus, camera, viewport, onSelectZone, onSelectBed, onBack }: MapRendererProps) {
  const level = focus.level;
  const zoneId = focusZoneId(focus);
  const bedsVisible = level !== 'garden';

  const swallow = (e: MouseEvent, fn: () => void) => { e.stopPropagation(); fn(); };

  return (
    <svg width={viewport.w} height={viewport.h} className="block">
      {/* Background: click empty space to step out one level */}
      <rect x={0} y={0} width={viewport.w} height={viewport.h} fill="transparent"
        onClick={() => { if (level !== 'garden') onBack(); }} />

      <g transform={`translate(${camera.x} ${camera.y}) scale(${camera.s})`}>
        {scene.zones.map((z) => {
          const current = zoneId === z.id;
          const clickable = level === 'garden';
          return (
            <g key={z.id} style={{ cursor: clickable ? 'pointer' : 'default' }}
              onClick={clickable ? (e) => swallow(e, () => onSelectZone(z.id)) : undefined}>
              <rect x={z.rect.x} y={z.rect.y} width={z.rect.w} height={z.rect.h} rx={16}
                fill={T.paper} stroke={current ? T.seal : T.line} strokeWidth={current ? 2 : 1.5} />
              <text x={z.rect.x + 22} y={z.rect.y + 34} fontFamily={SANS} fontSize={22} fontWeight={700}
                fill={T.ink} style={{ letterSpacing: '-0.02em' }}>{z.zone.name}</text>
            </g>
          );
        })}

        <g style={{ opacity: bedsVisible ? 1 : 0, transition: 'opacity 220ms ease', pointerEvents: bedsVisible ? 'auto' : 'none' }}>
          {scene.beds.map((b) => {
            const inFocusZone = b.zoneId === zoneId;
            const isDetail = level === 'bed' && focus.bedId === b.id;
            const clickable = level === 'zone' && inFocusZone;
            return (
              <BedShape
                key={b.id} node={b} scene={scene} mode={isDetail ? 'detail' : 'preview'}
                dim={!inFocusZone} highlight={clickable}
                onClick={clickable ? (e) => swallow(e, () => onSelectBed(b.id)) : undefined}
              />
            );
          })}
        </g>
      </g>
    </svg>
  );
}

function BedShape({ node, scene, mode, dim, highlight, onClick }: {
  node: BedNode;
  scene: Scene;
  mode: 'preview' | 'detail';
  dim: boolean;
  highlight: boolean;
  onClick?: (e: MouseEvent) => void;
}) {
  const { rect, bed } = node;
  const plants = plantsInBed(scene.tree, bed.id);
  const irr = equipmentForBed(scene.tree, bed.id).irrigation[0];
  const reservoir = bed.state?.reservoirLevel;
  const hasReservoir = typeof reservoir === 'number';

  return (
    <g opacity={dim ? 0.18 : 1} style={{ cursor: onClick ? 'pointer' : 'default', transition: 'opacity 220ms ease' }} onClick={onClick}>
      <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} rx={8}
        fill={T.card} stroke={highlight ? T.seal : T.line} strokeWidth={highlight ? 1.75 : 1.25} />

      <text x={rect.x + 12} y={rect.y + 21} fontFamily={SANS} fontSize={12} fontWeight={600} fill={T.ink}>{clip(bed.name, 22)}</text>
      <text x={rect.x + 12} y={rect.y + 34} fontFamily={SANS} fontSize={7.5} fontWeight={700} fill={T.muted}
        style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>{BED_TYPE_LABEL[bed.type]}</text>

      {mode === 'preview' ? (
        <PreviewBody node={node} plants={plants} hasReservoir={hasReservoir} reservoir={reservoir} irrOn={irr?.on} />
      ) : (
        <DetailBody node={node} plants={plants} reservoir={reservoir} emitters={irr?.emitterCount} irrKind={irr?.kind} />
      )}
    </g>
  );
}

// Zone-level: a compact card — a few plant dots, a thin reservoir bar, irrigation pip.
function PreviewBody({ node, plants, hasReservoir, reservoir, irrOn }: {
  node: BedNode; plants: ReturnType<typeof plantsInBed>; hasReservoir: boolean; reservoir?: number; irrOn?: boolean;
}) {
  const { rect } = node;
  return (
    <>
      {plants.slice(0, 6).map((p, i) => (
        <circle key={p.id} cx={rect.x + 15 + i * 12} cy={rect.y + 50} r={3.5} fill={DOT[p.attributes.cropCategory]} />
      ))}
      {hasReservoir && (
        <>
          <rect x={rect.x + 12} y={rect.y + rect.h - 11} width={rect.w - 24} height={3} rx={1.5} fill={T.lineSoft} />
          <rect x={rect.x + 12} y={rect.y + rect.h - 11} width={(rect.w - 24) * (reservoir ?? 0)} height={3} rx={1.5} fill={T.live} />
        </>
      )}
      {irrOn !== undefined && <circle cx={rect.x + rect.w - 12} cy={rect.y + 13} r={3.5} fill={irrOn ? T.live : T.faint} />}
    </>
  );
}

// Bed-level: the diagram — plant grid (left), reservoir level indicator (right),
// irrigation emitter bar (bottom).
function DetailBody({ node, plants, reservoir, emitters, irrKind }: {
  node: BedNode; plants: ReturnType<typeof plantsInBed>; reservoir?: number; emitters?: number; irrKind?: string;
}) {
  const { rect } = node;
  const hasReservoir = typeof reservoir === 'number';
  const gridLeft = rect.x + 18;
  const gridTop = rect.y + 46;
  const cols = 3;
  const cell = 17;
  const cellsAreaRight = hasReservoir ? rect.x + rect.w - 30 : rect.x + rect.w - 14;

  return (
    <>
      {/* Plant grid */}
      {plants.slice(0, 9).map((p, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        return (
          <circle key={p.id} cx={gridLeft + col * cell} cy={gridTop + row * cell} r={5}
            fill="none" stroke={DOT[p.attributes.cropCategory]} strokeWidth={2} />
        );
      })}

      {/* Irrigation emitter bar */}
      {emitters && emitters > 0 && (
        <g>
          <line x1={gridLeft - 4} y1={rect.y + rect.h - 14} x2={cellsAreaRight} y2={rect.y + rect.h - 14}
            stroke={T.live} strokeWidth={1.5} strokeLinecap="round" />
          {Array.from({ length: emitters }).map((_, i) => {
            const x = gridLeft + ((cellsAreaRight - gridLeft) * (i + 0.5)) / emitters;
            return <line key={i} x1={x} y1={rect.y + rect.h - 17} x2={x} y2={rect.y + rect.h - 11} stroke={T.live} strokeWidth={1.5} strokeLinecap="round" />;
          })}
        </g>
      )}
      {irrKind === 'misters' && (
        <text x={gridLeft - 4} y={rect.y + rect.h - 6} fontFamily={SANS} fontSize={6} fill={T.live}>misters</text>
      )}

      {/* Reservoir level indicator (vertical) */}
      {hasReservoir && (
        <g>
          <rect x={rect.x + rect.w - 24} y={rect.y + 44} width={12} height={rect.h - 60} rx={3} fill={T.lineSoft} stroke={T.line} strokeWidth={0.75} />
          <rect
            x={rect.x + rect.w - 24}
            y={rect.y + 44 + (rect.h - 60) * (1 - (reservoir ?? 0))}
            width={12}
            height={(rect.h - 60) * (reservoir ?? 0)}
            rx={3}
            fill={T.live}
          />
        </g>
      )}
    </>
  );
}

function clip(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
