import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGarden } from '@/hooks/useGarden';
import { useLens } from '@/hooks/useLens';
import { LevelHeader } from '@components/LevelChrome';
import { ZoneDiagram } from '@components/ZoneDiagram';
import { BedCard, AddBedCard } from '@components/BedCard';
import { TasksSection } from '@components/TasksSection';
import { NewBedDialog } from './NewBedDialog';
import { NewZoneDialog } from './NewZoneDialog';
import { WelcomeIntro } from '@components/WelcomeIntro';
import { bedsInZone, zoneLayout, bedLive, SUN_LABEL, type GardenTree, type Zone } from '@/domain';
import { Label, Breath, Hairline, Marker } from '@design/primitives';

const pad = (n: number) => String(n).padStart(2, '0');
const count = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export default function GardenView() {
  const { gardenId = 'demo' } = useParams<{ gardenId: string }>();
  const { tree, status, toggleTask, addTask, removeTask, addBed, addZone, renameGarden } = useGarden(gardenId);
  const [lens, setLens] = useLens('map');
  const navigate = useNavigate();
  const [addBedTo, setAddBedTo] = useState<Zone | null>(null);
  const [newZone, setNewZone] = useState(false);

  if (status !== 'ready' || !tree) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted">{status === 'error' ? 'Something went wrong.' : 'Loading the garden…'}</div>;
  }

  const isDemo = gardenId === 'demo';
  const empty = tree.zones.length === 0;
  const single = tree.zones.length === 1;

  return (
    <>
      <title>{`${tree.garden.name} · GardenHQ`}</title>
      <main className="min-h-screen max-w-4xl mx-auto px-6 py-10 sm:px-10">
        <LevelHeader
          crumbs={[]} title={tree.garden.name}
          meta={`${count(tree.zones.length, 'zone')} · ${count(tree.beds.length, 'bed')} · ${count(tree.plants.length, 'planting')}`}
          lens={empty ? undefined : lens} onLens={empty ? undefined : setLens}
          onRename={isDemo ? undefined : renameGarden}
          actions={<Link to={`/garden/${gardenId}/equipment`} className="rounded-card border border-line px-3 py-2 text-[12px] font-semibold text-ink70 hover:border-ink70 transition-colors">Equipment</Link>}
        />

        <div className="mt-6">
          <GardenNow tree={tree} gardenId={gardenId} />
        </div>

        {empty ? (
          <EmptyGarden onAddZone={() => setNewZone(true)} />
        ) : (
        <div className="mt-4">
          {lens === 'map' ? (
            <>
              <div className={`grid gap-4 ${single ? '' : 'sm:grid-cols-2'}`}>
                {tree.zones.map((z) => {
                  const zb = bedsInZone(tree, z.id);
                  const { items, bounds } = zoneLayout(zb);
                  const liveItems = items.map((it) => {
                    const l = bedLive(tree, it.id);
                    return {
                      ...it,
                      live: !!(l.reading || l.irrigationOn === true || typeof l.reservoirLevel === 'number'),
                    };
                  });
                  return (
                    <Link key={z.id} to={`/garden/${gardenId}/zone/${z.id}`}
                      className="tactile block rounded-card bg-card border border-line p-4 hover:border-ink70">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-[15px] font-semibold text-ink">{z.name}</h3>
                        <span className="text-[11px] text-muted shrink-0">{count(zb.length, 'bed')}</span>
                      </div>
                      {z.description && <div className="mt-0.5 text-[11px] text-muted">{z.description}</div>}
                      {zb.length === 0 ? (
                        <div className="mt-3 rounded-lg border border-dashed border-line p-6 text-center text-[12px] font-semibold text-muted"
                          style={{ background: 'var(--color-bg)' }}>
                          No beds yet · tap to add one
                        </div>
                      ) : (
                        <div className="mt-3 rounded-lg p-2" style={{ background: 'var(--color-bg)' }}>
                          <ZoneDiagram items={liveItems} bounds={bounds} mini maxHeight={single ? '260px' : '130px'} />
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
              <button type="button" onClick={() => setNewZone(true)}
                className="tactile mt-4 w-full rounded-card border border-dashed border-line p-3.5 text-left text-[13px] font-semibold text-muted hover:border-ink70 hover:text-ink70">
                + Add a zone
              </button>
            </>
          ) : (
            <>
              {tree.zones.map((z, i) => (
                <ZoneBlock key={z.id} tree={tree} zone={z} index={i + 1} total={tree.zones.length}
                  gardenId={gardenId} onAddBed={() => setAddBedTo(z)} />
              ))}
              <div className="mb-12">
                <button type="button" onClick={() => setNewZone(true)}
                  className="tactile w-full rounded-card border border-dashed border-line p-4 text-left text-[14px] font-semibold text-muted hover:border-ink70 hover:text-ink70">
                  + Add a zone
                </button>
              </div>
              <section className="mb-12">
                <TasksSection heading="Punch-list" tasks={tree.tasks} onToggle={toggleTask}
                  onAdd={(text) => addTask({ text })} onDelete={removeTask}
                  bedNameOf={(id) => tree.beds.find((b) => b.id === id)?.name} />
              </section>
            </>
          )}
        </div>
        )}
      </main>

      {isDemo && <WelcomeIntro tree={tree} gardenId={gardenId} />}

      {addBedTo && (
        <NewBedDialog zoneId={addBedTo.id} zoneName={addBedTo.name}
          onClose={() => setAddBedTo(null)}
          onCreate={(bed) => { void addBed(bed); setAddBedTo(null); navigate(`/garden/${gardenId}/bed/${bed.id}`); }} />
      )}

      {newZone && (
        <NewZoneDialog gardenId={gardenId}
          onClose={() => setNewZone(false)}
          onCreate={(zone) => { void addZone(zone); setNewZone(false); }} />
      )}
    </>
  );
}

// First-run canvas for a freshly built garden: name the model (zones → beds →
// plantings) and get the user to their first real action.
function EmptyGarden({ onAddZone }: { onAddZone: () => void }) {
  return (
    <div className="mt-8 rounded-card border border-dashed border-line bg-paper p-8 sm:p-12 text-center">
      <div className="mx-auto max-w-md">
        <h2 className="text-2xl font-bold tracking-[-0.025em] text-ink">Let&rsquo;s build your garden</h2>
        <Breath className="mt-3">
          Start with a zone: an area of your garden like a bed row, the
          greenhouse, or the patio. Then add beds, then what&rsquo;s planted
          where.
        </Breath>
        <div className="mt-6">
          <button type="button" onClick={onAddZone}
            className="cta-seal inline-flex min-h-[48px] items-center rounded-card bg-seal px-7 text-sm font-semibold text-card hover:opacity-90">
            Add your first zone
          </button>
        </div>
        <div className="mt-8 flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-faint">
          <span>Zones</span><span aria-hidden>›</span>
          <span>Beds</span><span aria-hidden>›</span>
          <span>Plantings</span>
        </div>
      </div>
    </div>
  );
}

// Garden-level "right now" — the whole garden as a living dashboard, one line:
// live sensor temps (tap → bed), reservoir levels, water state, open tasks.
function GardenNow({ tree, gardenId }: { tree: GardenTree; gardenId: string }) {
  const sensorItems = tree.sensors.flatMap((s) => {
    if (s.reading?.tempF === undefined || !s.assignedBedId) return [];
    const bed = tree.beds.find((b) => b.id === s.assignedBedId);
    return bed ? [{ bedId: bed.id, label: bed.name, value: `${s.reading.tempF}°F` }] : [];
  });
  const reservoirs = tree.beds
    .filter((b) => typeof b.state?.reservoirLevel === 'number')
    .map((b) => Math.round(b.state!.reservoirLevel! * 100))
    .sort((a, b) => b - a);
  const wateringOn = tree.irrigation.filter((n) => n.on).length;
  const openTasks = tree.tasks.filter((t) => !t.done).length;

  if (sensorItems.length === 0 && reservoirs.length === 0 && tree.irrigation.length === 0) return null;

  return (
    <div className="rounded-card bg-card border border-line p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-60" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-live" />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-clay">Right now</span>
      </div>
      <div className="flex flex-wrap gap-x-8 gap-y-3">
        {sensorItems.map((s) => (
          <Link key={s.bedId} to={`/garden/${gardenId}/bed/${s.bedId}`} className="group">
            <div className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-muted group-hover:text-ink70 transition-colors">{s.label}</div>
            <div className="text-[18px] font-semibold mt-0.5 tabular-nums text-ink">{s.value}</div>
          </Link>
        ))}
        {reservoirs.length > 0 && (
          <div>
            <div className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-muted">{reservoirs.length === 1 ? 'Reservoir' : 'Reservoirs'}</div>
            <div className="text-[18px] font-semibold mt-0.5 tabular-nums text-ink">{reservoirs.map((r) => `${r}%`).join(' · ')}</div>
          </div>
        )}
        {tree.irrigation.length > 0 && (
          <div>
            <div className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-muted">Water</div>
            <div className={`text-[18px] font-semibold mt-0.5 ${wateringOn > 0 ? 'text-live' : 'text-faint'}`}>{wateringOn > 0 ? `${wateringOn} on` : 'Off'}</div>
          </div>
        )}
        {openTasks > 0 && (
          <div>
            <div className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-muted">Open tasks</div>
            <div className="text-[18px] font-semibold mt-0.5 tabular-nums text-ink">{openTasks}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function ZoneBlock({ tree, zone, index, total, gardenId, onAddBed }: {
  tree: GardenTree; zone: Zone; index: number; total: number; gardenId: string; onAddBed: () => void;
}) {
  const beds = bedsInZone(tree, zone.id);
  return (
    <section className="mb-12">
      <div className="mb-5"><Marker index={pad(index)} total={pad(total)} /></div>
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <Link to={`/garden/${gardenId}/zone/${zone.id}`} className="text-2xl sm:text-3xl font-bold tracking-[-0.025em] text-ink hover:text-seal transition-colors">{zone.name}</Link>
        {zone.sunExposure && <Label className="text-clay">{SUN_LABEL[zone.sunExposure]}</Label>}
      </div>
      {zone.description && <Breath className="mt-2.5 max-w-xl text-[16px]">{zone.description}</Breath>}
      <Hairline className="mt-5 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {beds.map((b) => <BedCard key={b.id} tree={tree} bed={b} gardenId={gardenId} />)}
        <AddBedCard onClick={onAddBed} />
      </div>
    </section>
  );
}

