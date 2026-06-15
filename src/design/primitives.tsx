// ════════════════════════════════════════════════════════════════════════════
// swiss/zen primitives — typed, Tailwind-driven ports of the studio system.
//
// Ported from lilatravel/src/design/tokens.jsx and adapted for Tend. This is a
// LIVING library: when Tend grows a polished, reusable primitive, add it here,
// show it on /styleguide, and flag it for promotion back to shared swiss/zen.
// Travel-specific composites (Hero, Bento, NowPanel…) were intentionally left
// behind; the NowStrip/NowPanel *pattern* will return as Tend's live-state widget.
// ════════════════════════════════════════════════════════════════════════════
import type { ReactElement, ReactNode } from 'react';
import { T } from './tokens';

// ── Mark ────────────────────────────────────────────────────────────────────
// Calm, abstract glyphs. `leaf` is Tend's recurring marker (garden-appropriate);
// the full family is available for section signatures and live-state accents.
export type MarkId =
  | 'leaf' | 'enso' | 'ring' | 'dot' | 'ripple'
  | 'stroke' | 'arc' | 'crescent' | 'mountain' | 'lotus';

export const MARK: MarkId = 'leaf';

export function Mark({ id = MARK, size = 32, color = T.ink, sw = 2.4 }: {
  id?: MarkId; size?: number; color?: string; sw?: number;
}) {
  const cm = { fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const r = 40, c = 2 * Math.PI * r;
  const marks: Record<MarkId, ReactElement> = {
    leaf:     <><path d="M50 14 C30 36 30 64 50 86 C70 64 70 36 50 14 Z" {...cm} /><path d="M50 20 L50 80" {...cm} strokeWidth={sw * 0.8} /></>,
    enso:     <circle cx="50" cy="50" r={r} {...cm} strokeWidth={3} strokeDasharray={`${c * 0.85} ${c * 0.15}`} transform="rotate(-105 50 50)" />,
    ring:     <circle cx="50" cy="50" r={r} {...cm} />,
    dot:      <circle cx="50" cy="50" r="13" fill={color} stroke="none" />,
    ripple:   <><circle cx="50" cy="50" r="9" fill={color} stroke="none" /><circle cx="50" cy="50" r="24" {...cm} strokeWidth={sw * 0.8} opacity="0.6" /><circle cx="50" cy="50" r="40" {...cm} strokeWidth={sw * 0.6} opacity="0.3" /></>,
    stroke:   <path d="M18 54 q32 -12 64 0" {...cm} />,
    arc:      <path d="M20 66 a30 30 0 0 1 60 0" {...cm} />,
    crescent: <path d="M60 16 a38 38 0 1 0 0 68 a29 29 0 1 1 0 -68 Z" fill={color} stroke="none" />,
    mountain: <path d="M14 74 L40 32 L56 56 L70 38 L86 74" {...cm} />,
    lotus:    <><path d="M50 28 C45 46 45 60 50 76 C55 60 55 46 50 28 Z" {...cm} /><path d="M50 76 C41 68 33 58 31 46 C43 50 50 60 50 76 Z" {...cm} /><path d="M50 76 C59 68 67 58 69 46 C57 50 50 60 50 76 Z" {...cm} /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden className="block shrink-0">
      {marks[id]}
    </svg>
  );
}

// ── Label / VLabel ────────────────────────────────────────────────────────────
// Uppercase, tracked micro-labels — the system's quiet captions.
export function Label({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`text-[11px] font-bold uppercase tracking-[0.16em] text-muted ${className}`}>
      {children}
    </span>
  );
}

export function VLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`text-[10px] font-bold uppercase tracking-[0.3em] text-clay ${className}`}
      style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
    >
      {children}
    </div>
  );
}

// ── Seal ──────────────────────────────────────────────────────────────────────
// A small bordered, slightly-rotated stamp — used as a section index mark.
export function Seal({ label, className = '' }: { label: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-[30px] h-[30px] rounded-[3px] border-[1.5px] border-seal text-seal text-[11px] font-bold shrink-0 ${className}`}
      style={{ transform: 'rotate(-2deg)' }}
    >
      {label}
    </span>
  );
}

// ── Marker ────────────────────────────────────────────────────────────────────
// The recurring section-header signature: seal + mark + index.
export function Marker({ index, total = '05' }: { index: string; total?: string }) {
  return (
    <div className="flex items-center gap-[14px]">
      <Seal label={index} />
      <Mark size={32} color={T.seal} sw={2.6} />
      <span className="text-[11px] font-semibold tracking-[0.16em] text-faint">{index} / {total}</span>
    </div>
  );
}

// ── Breath ────────────────────────────────────────────────────────────────────
// The single emotional line per section — a touch larger, calmer than body.
export function Breath({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`m-0 text-clay text-[17px] sm:text-[20px] leading-[1.5] tracking-[0.005em] ${className}`}>
      {children}
    </p>
  );
}

// ── Hairline ──────────────────────────────────────────────────────────────────
export function Hairline({ soft = false, className = '' }: { soft?: boolean; className?: string }) {
  return <div className={`h-px w-full ${soft ? 'bg-line-soft' : 'bg-line'} ${className}`} />;
}

// ── FactsList ─────────────────────────────────────────────────────────────────
// Vertical key/value list bounded by hairlines — bed specs, plant attributes,
// irrigation facts. Label left, value right.
export type Fact = { label: string; value: ReactNode };

export function FactsList({ heading, facts }: { heading?: string; facts: Fact[] }) {
  return (
    <div>
      {heading && <div className="mb-3"><Label className="text-clay">{heading}</Label></div>}
      <div className="border-t border-line">
        {facts.map((f, i) => (
          <div
            key={f.label}
            className={`flex justify-between items-baseline gap-4 py-[9px] border-b ${
              i === facts.length - 1 ? 'border-line' : 'border-line-soft'
            }`}
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-clay shrink-0">{f.label}</span>
            <span className="text-[13px] font-medium text-ink70 text-right leading-[1.45]">{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
