// "Build a bed" — pick a real configuration (preset), name it, and create the bed
// pre-filled with type / dimensions / default row layout / systems.
import { useState } from 'react';
import type { Bed } from '@/domain';
import { BED_PRESETS, type BedPreset } from '@/data/bedPresets';
import { Label } from '@design/primitives';

const GROUPS: BedPreset['group'][] = ['Raised', 'Structure', 'In-ground', 'Container'];

function buildBed(preset: BedPreset, name: string, zoneId: string): Bed {
  return {
    id: crypto.randomUUID(),
    zoneId,
    name: name.trim(),
    type: preset.type,
    typeDetail: preset.typeDetail,
    widthFt: preset.widthFt,
    lengthFt: preset.lengthFt,
    layout: preset.layout,
    state: preset.hasReservoir ? { reservoirLevel: 1 } : undefined,
  };
}

export function NewBedDialog({ zoneId, zoneName, onClose, onCreate }: {
  zoneId: string; zoneName: string; onClose: () => void; onCreate: (bed: Bed) => void;
}) {
  const [presetId, setPresetId] = useState<string>(BED_PRESETS[0]!.id);
  const [name, setName] = useState('');
  const preset = BED_PRESETS.find((p) => p.id === presetId)!;
  const dims = (p: BedPreset) => (p.widthFt && p.lengthFt ? `${p.widthFt}×${p.lengthFt} ft` : '—');

  const create = () => {
    if (!name.trim()) return;
    onCreate(buildBed(preset, name, zoneId));
  };

  return (
    <>
      <div className="fixed inset-0 bg-ink/30 z-40" onClick={onClose} />
      <div role="dialog" aria-label="Build a bed"
        className="fixed z-50 inset-x-0 bottom-0 sm:inset-0 sm:m-auto sm:h-fit sm:max-w-lg
                   bg-card border border-line rounded-t-2xl sm:rounded-card p-6 max-h-[88vh] overflow-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Label className="text-clay">Build a bed</Label>
            <h2 className="mt-1 text-xl font-bold tracking-[-0.02em] text-ink">in {zoneName}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-ink text-lg leading-none">✕</button>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          {GROUPS.map((g) => {
            const items = BED_PRESETS.filter((p) => p.group === g);
            if (!items.length) return null;
            return (
              <div key={g}>
                <div className="mb-2"><span className="text-[9px] font-bold uppercase tracking-[0.16em] text-faint">{g}</span></div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {items.map((p) => (
                    <button key={p.id} type="button" onClick={() => setPresetId(p.id)} aria-pressed={presetId === p.id}
                      className={`text-left rounded-card border p-3 transition-colors ${presetId === p.id ? 'border-ink bg-paper' : 'border-line hover:border-ink70'}`}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[13px] font-semibold text-ink">{p.label}</span>
                        <span className="text-[10px] text-muted shrink-0">{dims(p)}</span>
                      </div>
                      <p className="mt-1 text-[11.5px] leading-[1.45] text-muted">{p.blurb}</p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-4 border-t border-line flex flex-col sm:flex-row sm:items-end gap-3">
          <label className="flex-1">
            <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-muted">Name</span>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') create(); }}
              placeholder="e.g. Back wicking bed"
              className="mt-1 w-full rounded-card border border-line focus:border-ink px-3 py-2 text-[14px] text-ink outline-none" />
          </label>
          <button type="button" onClick={create} disabled={!name.trim()}
            className="rounded-card bg-seal px-5 py-2.5 text-sm font-semibold text-card transition-opacity hover:opacity-90 disabled:opacity-40">
            Build it
          </button>
        </div>
      </div>
    </>
  );
}
