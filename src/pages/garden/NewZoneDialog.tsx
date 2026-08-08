// "Add a zone" — name an area of the garden (the shady side, the patio, the
// greenhouse row), set its sun exposure, and drop in a one-line description.
// Zones are the structure beds hang off of, so this is the first step when
// building a garden from scratch.
import { useState } from 'react';
import type { SunExposure, Zone } from '@/domain';
import { SUN_LABEL } from '@/domain';
import { Label } from '@design/primitives';

const SUN_OPTIONS: SunExposure[] = ['full-sun', 'partial-shade', 'shade', 'unknown'];

function buildZone(gardenId: string, name: string, description: string, sun: SunExposure): Zone {
  return {
    id: crypto.randomUUID(),
    gardenId,
    name: name.trim(),
    description: description.trim() || undefined,
    sunExposure: sun,
  };
}

export function NewZoneDialog({ gardenId, onClose, onCreate }: {
  gardenId: string; onClose: () => void; onCreate: (zone: Zone) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sun, setSun] = useState<SunExposure>('full-sun');

  const create = () => {
    if (!name.trim()) return;
    onCreate(buildZone(gardenId, name, description, sun));
  };

  return (
    <>
      <div className="fixed inset-0 bg-ink/30 z-40" onClick={onClose} />
      <div role="dialog" aria-label="Add a zone"
        className="fixed z-50 inset-x-0 bottom-0 sm:inset-0 sm:m-auto sm:h-fit sm:max-w-lg
                   bg-card border border-line rounded-t-2xl sm:rounded-card p-6 max-h-[88vh] overflow-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Label className="text-clay">Add a zone</Label>
            <h2 className="mt-1 text-xl font-bold tracking-[-0.02em] text-ink">An area of the garden</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-ink text-lg leading-none">✕</button>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <label className="block">
            <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-muted">Name</span>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') create(); }}
              placeholder="e.g. Main production, Herbs by the door"
              className="mt-1 w-full rounded-card border border-line focus:border-ink px-3 py-2 text-[14px] text-ink outline-none" />
          </label>

          <div>
            <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-muted">Sun exposure</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {SUN_OPTIONS.map((s) => (
                <button key={s} type="button" onClick={() => setSun(s)} aria-pressed={sun === s}
                  className={`text-left rounded-card border px-3 py-2 text-[13px] font-semibold transition-colors ${sun === s ? 'border-ink bg-paper text-ink' : 'border-line text-ink70 hover:border-ink70'}`}>
                  {SUN_LABEL[s]}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-muted">Description <span className="text-faint font-medium normal-case tracking-normal">· optional</span></span>
            <input value={description} onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') create(); }}
              placeholder="e.g. Vigo raised beds, greenhouse"
              className="mt-1 w-full rounded-card border border-line focus:border-ink px-3 py-2 text-[14px] text-ink outline-none" />
          </label>
        </div>

        <div className="mt-5 pt-4 border-t border-line flex justify-end">
          <button type="button" onClick={create} disabled={!name.trim()}
            className="rounded-card bg-seal px-5 py-2.5 text-sm font-semibold text-card transition-opacity hover:opacity-90 disabled:opacity-40">
            Add zone
          </button>
        </div>
      </div>
    </>
  );
}
