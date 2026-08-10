// A spatially-true diagram of a zone's beds — each bed drawn at its footprint
// with its shape (rectangle or ellipse). Used as the Zone Map lens, as a mini
// preview inside Garden zone cards, and as the base for the layout editor.
//
// Optional `overlay='irrigation'` turns it into a live irrigation map: beds on
// the drip network get a node marker (teal when watering, faint when off),
// connected by a schematic line, and tapping a bed toggles its water.
import { SANS, T, hexA } from '@design/tokens';
import type { Rect, ZoneLayoutItem } from '@/domain';

export interface IrrigationNodeView { on: boolean; kind?: string }

export function ZoneDiagram({ items, bounds, onSelect, selectedId, mini = false, maxHeight, overlay, nodes, path, onToggleNode }: {
  items: ZoneLayoutItem[];
  bounds: Rect;
  onSelect?: (id: string) => void;
  selectedId?: string | null;
  mini?: boolean;
  maxHeight?: string;
  overlay?: 'irrigation';
  nodes?: Record<string, IrrigationNodeView>;   // per-bed irrigation node (by bed id)
  path?: string[];                               // ordered bed ids for the schematic line
  onToggleNode?: (id: string) => void;
}) {
  const pad = Math.max(bounds.w, bounds.h) * 0.06;
  const vb = `${bounds.x - pad} ${bounds.y - pad} ${bounds.w + pad * 2} ${bounds.h + pad * 2}`;
  const fs = mini ? Math.max(5, bounds.w * 0.05) : Math.max(6, bounds.w * 0.013);
  const sw = Math.max(0.5, fs * (mini ? 0.16 : 0.085));

  const irrig = overlay === 'irrigation';
  const rectById = new Map(items.map((i) => [i.id, i.rect]));
  // Irrigation node marker sits at the bed's top-right corner (where the live dot is).
  const nodePos = (r: Rect) => ({ x: r.x + r.w - fs * 0.9, y: r.y + fs * 0.9 });
  const linePts = irrig && path
    ? path.map((id) => rectById.get(id)).filter(Boolean).map((r) => nodePos(r!))
    : [];

  const clickable = (id: string) => !!onSelect || (irrig && !!nodes?.[id] && !!onToggleNode);
  const handleClick = (id: string) => {
    if (irrig && nodes?.[id] && onToggleNode) { onToggleNode(id); return; }
    onSelect?.(id);
  };

  return (
    <svg viewBox={vb} width="100%" className="block" style={{ maxHeight: maxHeight ?? (mini ? '150px' : '62vh') }} role="group" aria-label="Zone bed layout">
      {/* Schematic drip line connecting beds on the network (drawn under the markers). */}
      {linePts.length > 1 && (
        <polyline
          points={linePts.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none" stroke={hexA(T.clay, 0.55)} strokeWidth={sw * 1.4}
          strokeDasharray={`${fs * 0.5} ${fs * 0.4}`} strokeLinecap="round" strokeLinejoin="round"
        />
      )}
      {items.map((it) => {
        const sel = selectedId === it.id;
        const node = irrig ? nodes?.[it.id] : undefined;
        const onNet = !!node;
        // In irrigation mode, beds on the network read as ink; others recede.
        const stroke = sel ? T.ink : it.accent && !irrig ? T.seal : irrig && !onNet ? T.line : T.line;
        const r = it.rect;
        const common = { fill: T.card, stroke, strokeWidth: sel ? sw * 1.6 : sw, opacity: irrig && !onNet ? 0.55 : 1 };
        const cpl = Math.max(4, Math.floor((r.w - fs) / (fs * 0.55)));
        // Mini gets one concise (clipped) line so beds are readable, not anonymous
        // rectangles; full size wraps to two. Skip if the bed is too small to fit.
        const lines = mini ? (cpl >= 3 ? [clip(it.label, cpl)] : []) : wrapLabel(it.label, cpl);
        const np = nodePos(r);
        return (
          <g key={it.id} className={clickable(it.id) ? 'zbed' : undefined}
            onClick={clickable(it.id) ? () => handleClick(it.id) : undefined}
            style={{ cursor: clickable(it.id) ? 'pointer' : 'default' }}>
            {it.shape === 'ellipse'
              ? <ellipse cx={r.x + r.w / 2} cy={r.y + r.h / 2} rx={r.w / 2} ry={r.h / 2} {...common} />
              : <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={fs * 0.45} {...common} />}
            {/* Faint crop-category wash — data-viz, not chrome (see cropColors). */}
            {!irrig && it.tint && (it.shape === 'ellipse'
              ? <ellipse cx={r.x + r.w / 2} cy={r.y + r.h / 2} rx={r.w / 2} ry={r.h / 2} fill={hexA(it.tint, 0.12)} stroke="none" />
              : <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={fs * 0.45} fill={hexA(it.tint, 0.12)} stroke="none" />)}
            {lines.map((ln, li) => (
              <text key={li} x={r.x + r.w / 2}
                y={r.y + r.h / 2 + (li - (lines.length - 1) / 2) * fs * 1.15}
                textAnchor="middle" dominantBaseline="central"
                fontFamily={SANS} fontSize={fs} fontWeight={600} fill={T.ink}
                opacity={irrig && !onNet ? 0.55 : 1}>
                {ln}
              </text>
            ))}
            {/* Live dot (normal mode) vs irrigation node marker (irrigation overlay). */}
            {!irrig && it.live && <circle cx={r.x + r.w - fs * 0.85} cy={r.y + fs * 0.85} r={fs * 0.3} fill={T.live} />}
            {irrig && node && (
              <>
                <circle cx={np.x} cy={np.y} r={fs * 0.6} fill={T.card} stroke={node.on ? T.live : T.faint} strokeWidth={sw} />
                <circle cx={np.x} cy={np.y} r={fs * 0.32} fill={node.on ? T.live : T.faint} />
              </>
            )}
            {!mini && it.liveLabel && !irrig && (
              <text x={r.x + r.w - fs * 0.6} y={r.y + r.h - fs * 0.55} textAnchor="end"
                fontFamily={SANS} fontSize={fs * 0.78} fontWeight={700} fill={T.live}>{it.liveLabel}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function clip(s: string, n: number): string {
  return n > 1 && s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

// Wrap a label to at most two lines that fit `cpl` chars; break on spaces.
function wrapLabel(s: string, cpl: number): string[] {
  if (s.length <= cpl) return [s];
  const words = s.split(' ');
  if (words.length === 1) return [clip(s, cpl)];
  let l1 = words[0];
  let i = 1;
  while (i < words.length && `${l1} ${words[i]}`.length <= cpl) { l1 = `${l1} ${words[i]}`; i += 1; }
  const l2 = clip(words.slice(i).join(' '), cpl);
  return l2 ? [l1, l2] : [l1];
}
