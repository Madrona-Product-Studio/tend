// The Map lens for the Garden and Zone levels: a static, spatially-true SVG
// overview that auto-fits via viewBox (no camera/gestures — navigation is
// route-per-level). Tap an item to drill into it.
import { SANS, T } from '@design/tokens';
import type { Rect } from '@/map/types';

export interface SpatialItem {
  id: string;
  label: string;
  sublabel?: string;
  rect: Rect;
  accent?: boolean;   // e.g. a live/selected state
}

export function SpatialLens({ bounds, items, onSelect, hint }: {
  bounds: Rect;
  items: SpatialItem[];
  onSelect: (id: string) => void;
  hint?: string;
}) {
  const pad = Math.max(bounds.w, bounds.h) * 0.04;
  const vb = `${bounds.x - pad} ${bounds.y - pad} ${bounds.w + pad * 2} ${bounds.h + pad * 2}`;
  const fs = Math.max(11, bounds.w * 0.018);

  return (
    <div className="rounded-xl border border-line p-3 sm:p-4" style={{ background: 'var(--color-bg)' }}>
      <svg viewBox={vb} width="100%" className="block" style={{ maxHeight: '64vh' }} role="group" aria-label="Map">
        {items.map((it) => (
          <g key={it.id} onClick={() => onSelect(it.id)} style={{ cursor: 'pointer' }}>
            <rect x={it.rect.x} y={it.rect.y} width={it.rect.w} height={it.rect.h} rx={fs * 0.7}
              fill={T.card} stroke={it.accent ? T.seal : T.line} strokeWidth={it.accent ? fs * 0.12 : fs * 0.08} />
            <text x={it.rect.x + fs} y={it.rect.y + fs * 1.8} fontFamily={SANS} fontSize={fs} fontWeight={700}
              fill={T.ink} style={{ letterSpacing: '-0.02em' }}>{clip(it.label, Math.floor(it.rect.w / (fs * 0.62)))}</text>
            {it.sublabel && (
              <text x={it.rect.x + fs} y={it.rect.y + fs * 3.05} fontFamily={SANS} fontSize={fs * 0.62} fill={T.muted}>
                {clip(it.sublabel, Math.floor(it.rect.w / (fs * 0.42)))}
              </text>
            )}
          </g>
        ))}
      </svg>
      {hint && <p className="mt-2 text-center text-[12px] text-muted">{hint}</p>}
    </div>
  );
}

function clip(s: string, n: number): string {
  return n > 0 && s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
