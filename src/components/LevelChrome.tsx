// Shared navigation chrome used by every level screen (Garden / Zone / Bed):
// a consistent home leaf + breadcrumb, a Map | List lens switch, and a title
// block with an actions slot. This is the connective tissue that makes moving
// between layers and modes feel the same everywhere.
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Mark } from '@design/primitives';
import { T } from '@design/tokens';
import type { Lens } from '@/hooks/useLens';

export interface Crumb { label: string; to: string }

export function LensSwitch({ lens, onChange }: { lens: Lens; onChange: (l: Lens) => void }) {
  return (
    <div className="inline-flex rounded-card border border-line overflow-hidden text-[12px] font-semibold shrink-0">
      {(['map', 'list'] as Lens[]).map((l) => (
        <button key={l} type="button" onClick={() => onChange(l)} aria-pressed={lens === l}
          className={`px-4 py-2 transition-colors ${lens === l ? 'bg-ink text-card' : 'text-muted hover:text-ink70'}`}>
          {l === 'map' ? 'Map' : 'List'}
        </button>
      ))}
    </div>
  );
}

export function LevelHeader({ crumbs, code, title, meta, lens, onLens, actions }: {
  crumbs: Crumb[];          // ancestors (not the current level)
  code?: string;
  title: string;
  meta?: ReactNode;
  lens?: Lens;
  onLens?: (l: Lens) => void;
  actions?: ReactNode;
}) {
  return (
    <header>
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm flex-wrap">
        <Link to="/" aria-label="Home" className="inline-flex items-center shrink-0"><Mark id="leaf" size={16} color={T.seal} sw={3} /></Link>
        {crumbs.map((c) => (
          <span key={c.to} className="flex items-center gap-2">
            <span className="text-faint">›</span>
            <Link to={c.to} className="text-muted hover:text-ink70 transition-colors">{c.label}</Link>
          </span>
        ))}
      </nav>

      {code && <div className="mt-4 font-mono text-[11px] tracking-[0.06em] text-seal">{code}</div>}

      <div className={`${code ? 'mt-1' : 'mt-4'} flex items-end justify-between gap-4 flex-wrap`}>
        <div className="min-w-0">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-ink leading-none">{title}</h1>
          {meta && <p className="mt-2 text-sm text-clay">{meta}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {lens && onLens && <LensSwitch lens={lens} onChange={onLens} />}
          {actions}
        </div>
      </div>
    </header>
  );
}
