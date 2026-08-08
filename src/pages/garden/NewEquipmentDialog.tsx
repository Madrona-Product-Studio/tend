// "Add equipment" — create a cover or a sensor for the garden's movable
// inventory. A freshly built garden starts with none; this is how the systems
// story gets off the ground. Optionally assign it to a bed and (for sensors)
// log a first reading so the map shows live state right away.
import { useState } from 'react';
import type { Bed, Cover, CoverKind, Sensor } from '@/domain';
import { Label } from '@design/primitives';

const COVER_KINDS: { kind: CoverKind; label: string }[] = [
  { kind: 'heat', label: 'Heat cover' },
  { kind: 'mesh-shade', label: 'Mesh / shade cover' },
];

export function NewEquipmentDialog({ kind, gardenId, beds, onClose, onCreateCover, onCreateSensor }: {
  kind: 'cover' | 'sensor';
  gardenId: string;
  beds: Bed[];
  onClose: () => void;
  onCreateCover: (c: Cover) => void;
  onCreateSensor: (s: Sensor) => void;
}) {
  const [coverKind, setCoverKind] = useState<CoverKind>('heat');
  const [label, setLabel] = useState('');
  const [bedId, setBedId] = useState('');
  const [temp, setTemp] = useState('');
  const [humidity, setHumidity] = useState('');

  const defaultLabel = kind === 'cover'
    ? (coverKind === 'heat' ? 'Heat cover' : 'Mesh / shade cover')
    : 'Govee temp / humidity';

  const create = () => {
    const finalLabel = label.trim() || defaultLabel;
    const assignedBedId = bedId || undefined;
    if (kind === 'cover') {
      onCreateCover({ id: crypto.randomUUID(), gardenId, kind: coverKind, label: finalLabel, assignedBedId });
      return;
    }
    const t = temp.trim() === '' ? undefined : Number(temp);
    const h = humidity.trim() === '' ? undefined : Number(humidity);
    const hasReading = (t !== undefined && Number.isFinite(t)) || (h !== undefined && Number.isFinite(h));
    onCreateSensor({
      id: crypto.randomUUID(), gardenId, label: finalLabel, measures: 'temp-humidity', assignedBedId,
      reading: hasReading
        ? { tempF: Number.isFinite(t as number) ? t : undefined, humidityPct: Number.isFinite(h as number) ? h : undefined, updatedAt: Date.now() }
        : undefined,
    });
  };

  const title = kind === 'cover' ? 'Add a cover' : 'Add a sensor';
  const sub = kind === 'cover' ? 'A movable cover' : 'A temp / humidity reader';

  return (
    <>
      <div className="fixed inset-0 bg-ink/30 z-40" onClick={onClose} />
      <div role="dialog" aria-label={title}
        className="fixed z-50 inset-x-0 bottom-0 sm:inset-0 sm:m-auto sm:h-fit sm:max-w-lg
                   bg-card border border-line rounded-t-2xl sm:rounded-card p-6 max-h-[88vh] overflow-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Label className="text-clay">{title}</Label>
            <h2 className="mt-1 text-xl font-bold tracking-[-0.02em] text-ink">{sub}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-ink text-lg leading-none">✕</button>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          {kind === 'cover' && (
            <div>
              <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-muted">Type</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {COVER_KINDS.map((c) => (
                  <button key={c.kind} type="button" onClick={() => setCoverKind(c.kind)} aria-pressed={coverKind === c.kind}
                    className={`text-left rounded-card border px-3 py-2 text-[13px] font-semibold transition-colors ${coverKind === c.kind ? 'border-ink bg-paper text-ink' : 'border-line text-ink70 hover:border-ink70'}`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <label className="block">
            <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-muted">Label <span className="text-faint font-medium normal-case tracking-normal">· optional</span></span>
            <input autoFocus value={label} onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') create(); }}
              placeholder={defaultLabel}
              className="mt-1 w-full rounded-card border border-line focus:border-ink px-3 py-2 text-[14px] text-ink outline-none" />
          </label>

          <label className="block">
            <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-muted">Assign to bed <span className="text-faint font-medium normal-case tracking-normal">· optional</span></span>
            <select value={bedId} onChange={(e) => setBedId(e.target.value)}
              className="mt-1 w-full rounded-card border border-line bg-card px-3 py-2 text-[14px] text-ink70 outline-none focus:border-ink">
              <option value="">In storage</option>
              {beds.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </label>

          {kind === 'sensor' && (
            <div>
              <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-muted">First reading <span className="text-faint font-medium normal-case tracking-normal">· optional</span></span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 rounded-card border border-line px-3 py-2">
                  <input value={temp} onChange={(e) => setTemp(e.target.value)} inputMode="numeric" placeholder="Temp"
                    className="w-full text-[14px] text-ink outline-none bg-transparent" />
                  <span className="text-[12px] text-muted shrink-0">°F</span>
                </label>
                <label className="flex items-center gap-2 rounded-card border border-line px-3 py-2">
                  <input value={humidity} onChange={(e) => setHumidity(e.target.value)} inputMode="numeric" placeholder="Humidity"
                    className="w-full text-[14px] text-ink outline-none bg-transparent" />
                  <span className="text-[12px] text-muted shrink-0">%</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-line flex justify-end">
          <button type="button" onClick={create}
            className="rounded-card bg-seal px-5 py-2.5 text-sm font-semibold text-card transition-opacity hover:opacity-90">
            Add {kind}
          </button>
        </div>
      </div>
    </>
  );
}
