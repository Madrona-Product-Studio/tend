// "Build a garden" — name a fresh, empty garden. No account required: it lives
// in this browser (local-first) until accounts + sync land. From here the user
// drops in zones, then beds, then plantings to reach a real, living map.
import { useState } from 'react';
import type { Garden } from '@/domain';
import { Label } from '@design/primitives';

function buildGarden(name: string): Garden {
  const now = Date.now();
  return { id: crypto.randomUUID(), name: name.trim() || 'My garden', createdAt: now, updatedAt: now };
}

export function NewGardenDialog({ onClose, onCreate }: {
  onClose: () => void; onCreate: (garden: Garden) => void;
}) {
  const [name, setName] = useState('');
  const create = () => onCreate(buildGarden(name));

  return (
    <>
      <div className="fixed inset-0 bg-ink/30 z-40" onClick={onClose} />
      <div role="dialog" aria-label="Build a garden"
        className="fixed z-50 inset-x-0 bottom-0 sm:inset-0 sm:m-auto sm:h-fit sm:max-w-md
                   bg-card border border-line rounded-t-2xl sm:rounded-card p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Label className="text-clay">Build a garden</Label>
            <h2 className="mt-1 text-xl font-bold tracking-[-0.02em] text-ink">Start your own map</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-ink text-lg leading-none">✕</button>
        </div>

        <p className="mt-3 text-[13px] leading-[1.6] text-clay">
          It lives in this browser for now, no account needed. You can name it anything.
        </p>

        <label className="mt-4 block">
          <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-muted">Garden name</span>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') create(); }}
            placeholder="e.g. Home garden, The back lot"
            className="mt-1 w-full rounded-card border border-line focus:border-ink px-3 py-2 text-[14px] text-ink outline-none" />
        </label>

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
