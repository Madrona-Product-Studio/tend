import { useParams, Link } from 'react-router-dom';
import { useGarden } from '@/hooks/useGarden';
import { Label, Breath, Hairline, Marker, Mark } from '@design/primitives';
import { T } from '@design/tokens';
import {
  bedsInZone, plantsInBed, equipmentForBed, BED_TYPE_LABEL, SUN_LABEL,
  type Bed, type GardenTree, type Zone,
} from '@/domain';

const pad = (n: number) => String(n).padStart(2, '0');

function Chip({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-semibold ${
      accent ? 'border-live/40 text-live' : 'border-line text-muted'
    }`}>
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

function BedCard({ tree, bed }: { tree: GardenTree; bed: Bed }) {
  const plants = plantsInBed(tree, bed.id);
  const { covers, sensors, irrigation } = equipmentForBed(tree, bed.id);
  const shown = plants.slice(0, 4).map((p) => p.variety ? `${p.name} ${p.variety}` : p.name);
  const more = plants.length - shown.length;

  return (
    <div className="rounded-card bg-card border border-line p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-semibold text-ink leading-snug">{bed.name}</h3>
        <span className="text-[11px] text-muted shrink-0">{plants.length} plant{plants.length === 1 ? '' : 's'}</span>
      </div>
      <div className="mt-1"><Label className="text-clay">{BED_TYPE_LABEL[bed.type]}</Label></div>

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
    </div>
  );
}

function ZoneSection({ tree, zone, index, total }: { tree: GardenTree; zone: Zone; index: number; total: number }) {
  const beds = bedsInZone(tree, zone.id);
  return (
    <section className="mb-12">
      <div className="mb-5"><Marker index={pad(index)} total={pad(total)} /></div>
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.025em] text-ink">{zone.name}</h2>
        {zone.sunExposure && <Label className="text-clay">{SUN_LABEL[zone.sunExposure]}</Label>}
      </div>
      {zone.description && <Breath className="mt-2.5 max-w-xl text-[16px]">{zone.description}</Breath>}
      <Hairline className="mt-5 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {beds.map((b) => <BedCard key={b.id} tree={tree} bed={b} />)}
      </div>
    </section>
  );
}

function PunchList({ tree, onToggle }: { tree: GardenTree; onToggle: (id: string, done: boolean) => void }) {
  if (tree.tasks.length === 0) return null;
  const bedName = (id?: string) => tree.beds.find((b) => b.id === id)?.name;
  return (
    <section className="mb-12">
      <div className="mb-3"><Label className="text-clay">Punch-list · a map and a plan</Label></div>
      <div className="border-t border-line">
        {tree.tasks.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onToggle(t.id, !t.done)}
            className="w-full flex items-start gap-3 py-2.5 text-left border-b border-line-soft group"
          >
            <span className={`mt-1 w-3.5 h-3.5 rounded-full border shrink-0 transition-colors ${
              t.done ? 'bg-live border-live' : 'border-muted group-hover:border-ink70'
            }`} />
            <span className={`flex-1 text-[14px] leading-snug ${t.done ? 'text-faint line-through' : 'text-ink70'}`}>
              {t.text}
              {bedName(t.bedId) && <span className="text-muted"> · {bedName(t.bedId)}</span>}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function GardenDetail() {
  const { gardenId = 'demo' } = useParams<{ gardenId: string }>();
  const { tree, status, toggleTask } = useGarden(gardenId);

  return (
    <>
      <title>Garden · Tend</title>
      <meta name="robots" content="noindex" />

      <main className="min-h-screen px-6 py-12 sm:px-12 sm:py-16 max-w-4xl mx-auto">
        <Link to="/" className="text-sm text-muted hover:text-ink70 transition-colors">← Tend</Link>

        {status === 'loading' && <p className="mt-10 text-sm text-muted">Loading the garden…</p>}
        {status === 'missing' && <p className="mt-10 text-sm text-muted">No garden found for “{gardenId}”.</p>}
        {status === 'error' && <p className="mt-10 text-sm text-seal">Something went wrong loading the garden.</p>}

        {tree && status === 'ready' && (
          <>
            <header className="mt-6 mb-12 flex items-center gap-4">
              <Mark id="leaf" size={40} color={T.seal} />
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-ink leading-none">{tree.garden.name}</h1>
                <p className="mt-1.5 text-sm text-muted">
                  {tree.zones.length} zones · {tree.beds.length} beds · {tree.plants.length} plantings
                </p>
              </div>
            </header>

            {tree.zones.map((z, i) => (
              <ZoneSection key={z.id} tree={tree} zone={z} index={i + 1} total={tree.zones.length} />
            ))}

            <PunchList tree={tree} onToggle={toggleTask} />

            <p className="text-[13px] text-faint">
              Loaded from local IndexedDB · seeded from the garden walkthrough. The semantic-zoom map renders this next.
            </p>
          </>
        )}
      </main>
    </>
  );
}
