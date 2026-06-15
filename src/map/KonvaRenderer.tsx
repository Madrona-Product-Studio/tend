// Konva (Canvas) renderer — the second candidate behind MapRendererProps. Same
// contract as SvgRenderer; owns a <Stage> and applies the camera to the Layer.
// Built for the renderer spike (docs/map-renderer-decision.md): compare feel/perf.
import { Stage, Layer, Group, Rect, Text, Circle } from 'react-konva';
import type Konva from 'konva';
import { plantsInBed, equipmentForBed, BED_TYPE_LABEL, type CropCategory } from '@/domain';
import { T } from '@design/tokens';
import type { BedNode, MapRendererProps, Scene } from './types';

const FONT = 'Inter, sans-serif';
const DOT: Record<CropCategory, string> = {
  brassica: '#4a7c59', leafy: '#6b9e6b', fruiting: T.seal, cucurbit: '#c8873a',
  root: '#a06a3a', allium: '#8c7bb0', herb: '#5a8f6a', legume: '#7aa05a',
  berry: '#9a3b6a', 'fruit-tree': '#7a5230', other: T.muted,
};

export function KonvaRenderer({
  scene, lod, viewport, camera, onMoveBed, onCommitBed, onBedDragStart, onBedDragEnd,
}: MapRendererProps) {
  const bedsVisible = lod !== 'garden';
  const plantsVisible = lod === 'bed';

  return (
    <Stage width={viewport.w} height={viewport.h}>
      <Layer x={camera.x} y={camera.y} scaleX={camera.s} scaleY={camera.s}>
        {scene.zones.map((z) => (
          <Group key={z.id}>
            <Rect x={z.rect.x} y={z.rect.y} width={z.rect.w} height={z.rect.h} cornerRadius={14}
              fill={T.paper} stroke={T.line} strokeWidth={1.5} />
            <Text x={z.rect.x + 20} y={z.rect.y + 14} text={z.zone.name} fontFamily={FONT}
              fontSize={22} fontStyle="bold" fill={T.ink} letterSpacing={-0.4} />
          </Group>
        ))}

        <Group opacity={bedsVisible ? 1 : 0} listening={bedsVisible}>
          {scene.beds.map((b) => (
            <BedShape
              key={b.id} node={b} scene={scene} scale={camera.s} plantsVisible={plantsVisible}
              onMoveBed={onMoveBed} onCommitBed={onCommitBed}
              onBedDragStart={onBedDragStart} onBedDragEnd={onBedDragEnd}
            />
          ))}
        </Group>
      </Layer>
    </Stage>
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
  const plants = plantsInBed(scene.tree, bed.id);
  const irr = equipmentForBed(scene.tree, bed.id).irrigation[0];
  const reservoir = bed.state?.reservoirLevel;

  // Manual drag via window listeners — reliable even when the pointer leaves the
  // shape; converts screen delta to world units with the current scale.
  const onDown = (e: Konva.KonvaEventObject<PointerEvent>) => {
    e.cancelBubble = true;
    onBedDragStart();
    let last = { x: e.evt.clientX, y: e.evt.clientY };
    const move = (ev: PointerEvent) => {
      onMoveBed(bed.id, (ev.clientX - last.x) / scale, (ev.clientY - last.y) / scale);
      last = { x: ev.clientX, y: ev.clientY };
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      onCommitBed(bed.id);
      onBedDragEnd();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <Group onPointerDown={onDown}>
      <Rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} cornerRadius={8} fill={T.card} stroke={T.line} strokeWidth={1.25} />
      <Text x={rect.x + 12} y={rect.y + 12} text={clip(bed.name, 20)} fontFamily={FONT} fontSize={13} fontStyle="600" fill={T.ink} />
      <Text x={rect.x + 12} y={rect.y + 30} text={BED_TYPE_LABEL[bed.type].toUpperCase()} fontFamily={FONT} fontSize={8.5} fontStyle="bold" fill={T.muted} letterSpacing={0.7} />

      <Group opacity={plantsVisible ? 1 : 0}>
        {plants.slice(0, 6).map((p, i) => (
          <Circle key={p.id} x={rect.x + 15 + i * 13} y={rect.y + 54} radius={4} fill={DOT[p.attributes.cropCategory]} />
        ))}
        {plants.length > 0 && (
          <Text x={rect.x + 12} y={rect.y + 68} text={clip(plants.map((p) => p.variety ?? p.name).join(', '), 30)} fontFamily={FONT} fontSize={8} fill={T.clay} />
        )}
      </Group>

      {typeof reservoir === 'number' && (
        <>
          <Rect x={rect.x + 12} y={rect.y + rect.h - 12} width={rect.w - 24} height={3} cornerRadius={1.5} fill={T.lineSoft} />
          <Rect x={rect.x + 12} y={rect.y + rect.h - 12} width={(rect.w - 24) * reservoir} height={3} cornerRadius={1.5} fill={T.live} />
        </>
      )}
      {irr && <Circle x={rect.x + rect.w - 12} y={rect.y + 14} radius={3.5} fill={irr.on ? T.live : T.faint} />}
    </Group>
  );
}

function clip(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
