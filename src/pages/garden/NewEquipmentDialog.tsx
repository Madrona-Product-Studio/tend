// "Add equipment" — create a cover or a sensor for the garden's movable
// inventory. Leads with a picker of common gear ("here are ideas to add"), not
// a blank field; the label stays editable. Optionally assign it to a bed and
// (for sensors) log a first reading so the map shows live state right away.
import { useState } from 'react';
import type { Bed, Cover, CoverKind, Sensor } from '@/domain';
import { COVER_PRESETS, SENSOR_PRESETS } from '@/data/equipmentCatalog';
import { Label } from '@design/primitives';

const COVER_GROUPS: { kind: CoverKind; heading: string }[] = [
  { kind: 'heat', heading: 'Warmth' },
  { kind: 'mesh-shade', heading: 'Shade / mesh' },
];

export function NewEquipmentDialog({ kind, gardenId, beds, onClose, onCreateCover, onCreateSensor }: {
  kind: 'cover' | 'sensor';
  gardenId: string;
  beds: Bed[];
  onClose: () => void;
  onCreateCover: (c: Cover) => void;
  onCreateSensor: (s: Sensor) => void;
}) {
  const presets: { id: string; label: string }[] = kind === 'cover' ? COVER_PRESETS : SENSOR_PRESETS;
  const [presetId, setPresetId] = useState<string>(presets[0]!.id);
  const [label, setLabel] = useState<string>(presets[0]!.label);
  const [bedId, setBedId] = useState('');
  const [temp, setTemp] = useState('');
  const [humidity, setHumidity] = useState('');

  const choose = (id: string) => {
    setPresetId(id);
    setLabel(presets.find((p) => p.id === id)!.label);
  };

  const create = () => {
    const finalLabel = label.trim() || presets.find((p) => p.id === presetId)!.label;
    const assignedBedId = bedId || undefined;
    if (kind === 'cover') {
      const cp = COVER_PRESETS.find((p) => p.id === presetId)!;
      onCreateCover({ id: crypto.randomUUID(), gardenId, kind: cp.kind, label: finalLabel, assignedBedId });
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
  const sub = kind === 'cover' ? 'Pick a cover, or name your own' : 'Pick a sensor, or name your own';

  const PresetCard = ({ id, label: pLabel }: { id: string; label: string }) => (
    <button type="button" onClick={() => choose(id)} aria-pressed={presetId === id}
      className={`text-left rounded-card border px-3 py-2 text-[13px] font-semibold transition-colors ${presetId === id ? 'border-ink bg-paper text-ink' : 'border-line text-ink70 hover:border-ink70'}`}>
      {pLabel}
    </button>
  );

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
          {kind === 'cover' ? (
            COVER_GROUPS.map((g) => (
              <div key={g.kind}>
                <div className="mb-1.5"><span className="text-[9px] font-bold uppercase tracking-[0.16em] text-faint">{g.heading}</span></div>
                <div className="grid grid-cols-2 gap-2">
                  {COVER_PRESETS.filter((p) => p.kind === g.kind).map((p) => <PresetCard key={p.id} id={p.id} label={p.label} />)}
                </div>
              </div>
            ))
          ) : (
            <div>
              <div className="mb-1.5"><span className="text-[9px] font-bold uppercase tracking-[0.16em] text-faint">Common sensors</span></div>
              <div className="grid grid-cols-2 gap-2">
                {SENSOR_PRESETS.map((p) => <PresetCard key={p.id} id={p.id} label={p.label} />)}
              </div>
            </div>
          )}

          <label className="block">
            <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-muted">Label</span>
            <input value={label} onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') create(); }}
              placeholder={presets[0]!.label}
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
