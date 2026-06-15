// The zone layout tool: arrange beds on a canvas — drag to move, a corner handle
// to resize, a toolbar to switch shape (rect ⇄ ellipse) and add a bed. Each
// change persists the bed's footprint/shape. Pointer-based (works on touch).
import { useEffect, useRef, useState, type PointerEvent as RPE } from 'react';
import { SANS, T } from '@design/tokens';
import { zoneLayout, type Bed, type BedShape, type Rect, type ZoneLayoutItem } from '@/domain';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function ZoneLayoutEditor({ beds, onSave, onAddBed }: {
  beds: Bed[];
  onSave: (id: string, footprint: Rect, shape?: BedShape) => void;
  onAddBed: () => void;
}) {
  const [items, setItems] = useState<ZoneLayoutItem[]>(() => zoneLayout(beds).items);
  const [canvas] = useState<Rect>(() => {
    const b = zoneLayout(beds).bounds;
    return { x: 0, y: 0, w: Math.max(280, b.x + b.w + 30), h: Math.max(170, b.y + b.h + 30) };
  });
  const [selId, setSelId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const drag = useRef<{ mode: 'move' | 'resize'; id: string; sx: number; sy: number; start: Rect; scale: number } | null>(null);
  const liveRect = useRef<Rect | null>(null);

  // Merge in beds added externally (via the build-a-bed dialog) without
  // disturbing already-placed ones. Only fires when a new bed appears.
  useEffect(() => {
    const incoming = zoneLayout(beds).items;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- external add, not a render cascade
    setItems((prev) => {
      const have = new Set(prev.map((i) => i.id));
      const add = incoming.filter((i) => !have.has(i.id));
      return add.length ? [...prev, ...add] : prev;
    });
  }, [beds]);

  const fs = Math.max(8, canvas.w * 0.024);
  const sw = Math.max(0.5, fs * 0.085);
  const handle = fs * 1.1;

  const scaleNow = () => canvas.w / (svgRef.current?.getBoundingClientRect().width ?? canvas.w);

  const onMove = (e: PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = (e.clientX - d.sx) * d.scale;
    const dy = (e.clientY - d.sy) * d.scale;
    setItems((prev) => prev.map((it) => {
      if (it.id !== d.id) return it;
      const rect = d.mode === 'move'
        ? { ...it.rect, x: clamp(d.start.x + dx, 0, canvas.w - it.rect.w), y: clamp(d.start.y + dy, 0, canvas.h - it.rect.h) }
        : { ...it.rect, w: clamp(d.start.w + dx, 16, canvas.w - it.rect.x), h: clamp(d.start.h + dy, 16, canvas.h - it.rect.y) };
      liveRect.current = rect;
      return { ...it, rect };
    }));
  };

  const onUp = () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    const d = drag.current;
    drag.current = null;
    if (d && liveRect.current) onSave(d.id, liveRect.current);
    liveRect.current = null;
  };

  const start = (e: RPE, it: ZoneLayoutItem, mode: 'move' | 'resize') => {
    e.stopPropagation();
    setSelId(it.id);
    drag.current = { mode, id: it.id, sx: e.clientX, sy: e.clientY, start: it.rect, scale: scaleNow() };
    liveRect.current = it.rect;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const setShape = (id: string, shape: BedShape) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, shape } : it)));
    const it = items.find((i) => i.id === id);
    if (it) onSave(id, it.rect, shape);
  };

  const sel = items.find((i) => i.id === selId) ?? null;

  return (
    <div>
      <div className="rounded-xl border-2 border-dashed border-line p-3 sm:p-4" style={{ background: 'var(--color-bg)' }}>
        <svg ref={svgRef} viewBox={`${canvas.x} ${canvas.y} ${canvas.w} ${canvas.h}`} width="100%"
          className="block" style={{ maxHeight: '64vh', touchAction: 'none' }}
          onPointerDown={() => setSelId(null)} role="application" aria-label="Zone layout editor">
          {items.map((it) => {
            const s = it.id === selId;
            const r = it.rect;
            const common = { fill: T.card, stroke: s ? T.ink : it.accent ? T.seal : T.line, strokeWidth: s ? sw * 1.7 : sw, style: { cursor: 'move' } as const };
            return (
              <g key={it.id} onPointerDown={(e) => start(e, it, 'move')}>
                {it.shape === 'ellipse'
                  ? <ellipse cx={r.x + r.w / 2} cy={r.y + r.h / 2} rx={r.w / 2} ry={r.h / 2} {...common} />
                  : <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={fs * 0.45} {...common} />}
                <text x={r.x + r.w / 2} y={r.y + r.h / 2} textAnchor="middle" dominantBaseline="central"
                  fontFamily={SANS} fontSize={fs} fontWeight={600} fill={T.ink} style={{ pointerEvents: 'none' }}>
                  {clip(it.label, Math.floor(r.w / (fs * 0.54)))}
                </text>
                {s && (
                  <rect x={r.x + r.w - handle / 2} y={r.y + r.h - handle / 2} width={handle} height={handle} rx={handle * 0.25}
                    fill={T.ink} style={{ cursor: 'nwse-resize' }} onPointerDown={(e) => start(e, it, 'resize')} />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {sel ? (
          <>
            <span className="text-[12px] text-clay">{sel.label}</span>
            <div className="inline-flex rounded-card border border-line overflow-hidden text-[12px] font-semibold">
              {(['rect', 'ellipse'] as BedShape[]).map((sh) => (
                <button key={sh} type="button" onClick={() => setShape(sel.id, sh)} aria-pressed={sel.shape === sh}
                  className={`px-3 py-1.5 transition-colors ${sel.shape === sh ? 'bg-ink text-card' : 'text-muted hover:text-ink70'}`}>
                  {sh === 'rect' ? '▭ Rect' : '⬭ Oval'}
                </button>
              ))}
            </div>
          </>
        ) : (
          <span className="text-[12px] text-muted">Drag to move · drag the corner to resize · tap a bed to set its shape</span>
        )}
        <button type="button" onClick={onAddBed} className="ml-auto rounded-card border border-line px-3 py-1.5 text-[12px] font-semibold text-ink70 hover:border-ink70 transition-colors">+ Add bed</button>
      </div>
    </div>
  );
}

function clip(s: string, n: number): string {
  return n > 1 && s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
