// A bed summary card for List lenses (Garden and Zone). Links to the bed screen.
import { Link } from 'react-router-dom';
import { plantsInBed, equipmentForBed, BED_TYPE_LABEL, type Bed, type GardenTree } from '@/domain';
import { Label } from '@design/primitives';

function Chip({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-semibold ${accent ? 'border-live/40 text-live' : 'border-line text-muted'}`}>
      {children}
    </span>
  );
}

function Reservoir({ level }: { level: number }) {
  return (
    <div className="mt-3">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-muted">Reservoir</span>
        <span className="text-[11px] font-semibold text-ink">{Math.round(level * 100)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-line-soft overflow-hidden">
        <div className="h-full rounded-full bg-live" style={{ width: `${level * 100}%` }} />
      </div>
    </div>
  );
}

export function BedCard({ tree, bed, gardenId }: { tree: GardenTree; bed: Bed; gardenId: string }) {
  const plants = plantsInBed(tree, bed.id);
  const { covers, sensors, irrigation } = equipmentForBed(tree, bed.id);
  const shown = plants.slice(0, 4).map((p) => (p.variety ? `${p.name} ${p.variety}` : p.name));
  const more = plants.length - shown.length;

  return (
    <Link to={`/garden/${gardenId}/bed/${bed.id}`} className="block rounded-card bg-card border border-line p-4 hover:border-ink70 transition-colors">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-semibold text-ink leading-snug">{bed.name}</h3>
        <span className="text-[11px] text-muted shrink-0">{plants.length} plant{plants.length === 1 ? '' : 's'}</span>
      </div>
      <div className="mt-1"><Label className="text-clay">{bed.typeDetail ?? BED_TYPE_LABEL[bed.type]}</Label></div>

      {shown.length > 0 && (
        <p className="mt-2.5 text-[13px] leading-[1.5] text-ink70">
          {shown.join(' · ')}{more > 0 && <span className="text-faint"> · +{more} more</span>}
        </p>
      )}

      {typeof bed.state?.reservoirLevel === 'number' && <Reservoir level={bed.state.reservoirLevel} />}

      {(covers.length > 0 || sensors.length > 0 || irrigation.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {covers.map((c) => <Chip key={c.id}>{c.kind === 'heat' ? 'Heat cover' : 'Mesh cover'}</Chip>)}
          {sensors.map((s) => <Chip key={s.id}>{s.label}</Chip>)}
          {irrigation.map((n) => (
            <Chip key={n.id} accent={n.on}>
              {n.kind === 'misters' ? 'Misters' : n.kind === 'soaker' ? 'Soaker' : `${n.emitterCount ?? ''} emitters`} · {n.on ? 'on' : 'off'}
            </Chip>
          ))}
        </div>
      )}
    </Link>
  );
}

export function AddBedCard({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="rounded-card border border-dashed border-line p-4 text-left text-[14px] font-semibold text-muted hover:border-ink70 hover:text-ink70 transition-colors min-h-[88px]">
      + Build a bed
    </button>
  );
}
