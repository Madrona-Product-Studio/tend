// "Build a garden" — name a garden and pick a starting point. No account
// required: it lives in this browser (local-first) until accounts + sync land.
// A template lays down real zones/beds/plantings so it's not a blank canvas;
// "Blank garden" starts empty for people who want to lay it out themselves.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Garden } from '@/domain';
import { GARDEN_TEMPLATES, type GardenTemplate, type GardenTemplateContents } from '@/data/gardenTemplates';
import { Label } from '@design/primitives';

export function NewGardenDialog({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (garden: Garden, contents: GardenTemplateContents | null) => void;
}) {
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState<string>(GARDEN_TEMPLATES[0]!.id);
  const template = GARDEN_TEMPLATES.find((t) => t.id === templateId) as GardenTemplate;

  const create = () => {
    const now = Date.now();
    const garden: Garden = { id: crypto.randomUUID(), name: name.trim() || 'My garden', createdAt: now, updatedAt: now };
    const contents = template.build ? template.build(garden.id) : null;
    onCreate(garden, contents);
  };

  return (
    <>
      <div className="fixed inset-0 bg-ink/30 z-40" onClick={onClose} />
      <div role="dialog" aria-label="Build a garden"
        className="fixed z-50 inset-x-0 bottom-0 sm:inset-0 sm:m-auto sm:h-fit sm:max-w-lg
                   bg-card border border-line rounded-t-2xl sm:rounded-card p-6 max-h-[88vh] overflow-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Label className="text-clay">Build a garden</Label>
            <h2 className="mt-1 text-xl font-bold tracking-[-0.02em] text-ink">Start your own map</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-ink text-lg leading-none">✕</button>
        </div>

        <p className="mt-3 text-[13px] leading-[1.6] text-clay">
          It lives in this browser for now, no account needed. Pick a starting point, then make it yours.
        </p>

        <label className="mt-4 block">
          <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-muted">Garden name</span>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') create(); }}
            placeholder="e.g. Home garden, The back lot"
            className="mt-1 w-full rounded-card border border-line focus:border-ink px-3 py-2 text-[14px] text-ink outline-none" />
        </label>

        <div className="mt-4">
          <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-muted">Start from</span>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {GARDEN_TEMPLATES.map((t) => (
              <button key={t.id} type="button" onClick={() => setTemplateId(t.id)} aria-pressed={templateId === t.id}
                className={`text-left rounded-card border p-3 transition-colors ${templateId === t.id ? 'border-ink bg-paper' : 'border-line hover:border-ink70'}`}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[13px] font-semibold text-ink">{t.label}</span>
                  <span className="text-[10px] text-muted shrink-0">{t.summary}</span>
                </div>
                <p className="mt-1 text-[11.5px] leading-[1.45] text-muted">{t.blurb}</p>
              </button>
            ))}
          </div>
        </div>

        <Link to="/garden-walk" onClick={onClose}
          className="mt-3 flex items-baseline justify-between gap-3 rounded-card border border-line hover:border-ink70 bg-paper p-3 transition-colors">
          <span>
            <span className="text-[13px] font-semibold text-ink">Talk it through instead</span>
            <span className="block mt-1 text-[11.5px] leading-[1.45] text-muted">Walk your garden, describe it out loud, and we&rsquo;ll draft the whole map for you to review.</span>
          </span>
          <span className="text-clay shrink-0" aria-hidden>→</span>
        </Link>

        <div className="mt-5 pt-4 border-t border-line flex justify-end">
          <button type="button" onClick={create}
            className="rounded-card bg-seal px-5 py-2.5 text-sm font-semibold text-card transition-opacity hover:opacity-90">
            Build it
          </button>
        </div>
      </div>
    </>
  );
}
