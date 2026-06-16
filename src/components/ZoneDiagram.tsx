// A spatially-true diagram of a zone's beds — each bed drawn at its footprint
// with its shape (rectangle or ellipse). Used as the Zone Map lens, as a mini
// preview inside Garden zone cards, and as the base for the layout editor.
import { SANS, T } from '@design/tokens';
import type { Rect, ZoneLayoutItem } from '@/domain';

export function ZoneDiagram({ items, bounds, onSelect, selectedId, mini = false, maxHeight }: {
  items: ZoneLayoutItem[];
  bounds: Rect;
  onSelect?: (id: string) => void;
  selectedId?: string | null;
  mini?: boolean;
  maxHeight?: string;
}) {
  const pad = Math.max(bounds.w, bounds.h) * 0.06;
  const vb = `${bounds.x - pad} ${bounds.y - pad} ${bounds.w + pad * 2} ${bounds.h + pad * 2}`;
  const fs = mini ? Math.max(5, bounds.w * 0.05) : Math.max(6, bounds.w * 0.013);
  const sw = Math.max(0.5, fs * (mini ? 0.16 : 0.085));

  return (
    <svg viewBox={vb} width="100%" className="block" style={{ maxHeight: maxHeight ?? (mini ? '150px' : '62vh') }} role="group" aria-label="Zone bed layout">
      {items.map((it) => {
        const sel = selectedId === it.id;
        const stroke = sel ? T.ink : it.accent ? T.seal : T.line;
        const r = it.rect;
        const common = { fill: T.card, stroke, strokeWidth: sel ? sw * 1.6 : sw };
        const cpl = Math.max(4, Math.floor((r.w - fs) / (fs * 0.55)));
        const lines = mini ? [] : wrapLabel(it.label, cpl);
        return (
          <g key={it.id} onClick={onSelect ? () => onSelect(it.id) : undefined} style={{ cursor: onSelect ? 'pointer' : 'default' }}>
            {it.shape === 'ellipse'
              ? <ellipse cx={r.x + r.w / 2} cy={r.y + r.h / 2} rx={r.w / 2} ry={r.h / 2} {...common} />
              : <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={fs * 0.45} {...common} />}
            {lines.map((ln, li) => (
              <text key={li} x={r.x + r.w / 2}
                y={r.y + r.h / 2 + (li - (lines.length - 1) / 2) * fs * 1.15}
                textAnchor="middle" dominantBaseline="central"
                fontFamily={SANS} fontSize={fs} fontWeight={600} fill={T.ink}>
                {ln}
              </text>
            ))}
            {it.live && <circle cx={r.x + r.w - fs * 0.85} cy={r.y + fs * 0.85} r={fs * 0.3} fill={T.live} />}
            {!mini && it.liveLabel && (
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
