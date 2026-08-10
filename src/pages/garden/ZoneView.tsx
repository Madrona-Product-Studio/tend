import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGarden } from '@/hooks/useGarden';
import { useLens } from '@/hooks/useLens';
import { LevelHeader } from '@components/LevelChrome';
import { ZoneDiagram } from '@components/ZoneDiagram';
import { ZoneLayoutEditor } from '@components/ZoneLayoutEditor';
import { BedCard, AddBedCard } from '@components/BedCard';
import { TasksSection } from '@components/TasksSection';
import { NewBedDialog } from './NewBedDialog';
import { bedsInZone, zoneLayout, bedLive, SUN_LABEL } from '@/domain';
import { Breath } from '@design/primitives';

export default function ZoneView() {
  const { gardenId = 'demo', zoneId = '' } = useParams<{ gardenId: string; zoneId: string }>();
  const { tree, status, addBed, setBedGeometry, renameZone, toggleTask, addTask, removeTask, setIrrigationOn } = useGarden(gardenId);
  const [lens, setLens] = useLens('map');
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [irrig, setIrrig] = useState(false);

  const zone = tree?.zones.find((z) => z.id === zoneId);
  const beds = useMemo(() => (tree && zone ? bedsInZone(tree, zone.id) : []), [tree, zone]);
  const { items, bounds } = useMemo(() => zoneLayout(beds), [beds]);
  const liveItems = useMemo(() => (tree ? items.map((it) => {
    const l = bedLive(tree, it.id);
    const active = !!(l.reading || l.irrigationOn === true || typeof l.reservoirLevel === 'number');
    return { ...it, live: active, liveLabel: l.reading?.tempF !== undefined ? `${l.reading.tempF}°` : undefined };
  }) : items), [items, tree]);

  if (status !== 'ready' || !tree) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted">{status === 'error' ? 'Something went wrong.' : 'Loading…'}</div>;
  }
  if (!zone) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted">Zone not found.</div>;
  }

  const zoneBedIds = new Set(beds.map((b) => b.id));
  const tasks = tree.tasks.filter((t) => t.zoneId === zone.id || (t.bedId && zoneBedIds.has(t.bedId)));

  // Irrigation overlay: which beds in this zone are on the drip network, their
  // on/off state, a spatial order for the schematic line, and a toggle.
  const irrigByBed = new Map<string, { on: boolean; kind?: string; nodeId: string }>();
  for (const n of tree.irrigation) {
    if (n.bedId && zoneBedIds.has(n.bedId)) irrigByBed.set(n.bedId, { on: n.on, kind: n.kind, nodeId: n.id });
  }
  const hasIrrig = irrigByBed.size > 0;
  const irrigNodes = Object.fromEntries([...irrigByBed].map(([bid, v]) => [bid, { on: v.on, kind: v.kind }]));
  const irrigPath = items.filter((it) => irrigByBed.has(it.id)).slice()
    .sort((a, b) => a.rect.x - b.rect.x || a.rect.y - b.rect.y).map((it) => it.id);
  const onCount = [...irrigByBed.values()].filter((v) => v.on).length;
  const toggleWater = (bedId: string) => { const v = irrigByBed.get(bedId); if (v) void setIrrigationOn(v.nodeId, !v.on); };

  return (
    <>
      <title>{`${zone.name} · GardenHQ`}</title>
      <meta name="robots" content="noindex" />
      <main className="min-h-screen max-w-4xl mx-auto px-6 py-10 sm:px-10">
        <LevelHeader
          crumbs={[{ label: tree.garden.name, to: `/garden/${gardenId}` }]}
          title={zone.name}
          onRename={(name) => renameZone(zone.id, name)}
          meta={[zone.sunExposure ? SUN_LABEL[zone.sunExposure] : null, zone.description].filter(Boolean).join(' · ')}
          lens={lens} onLens={setLens}
          actions={lens === 'map' ? (
            editing ? (
              <button type="button" onClick={() => setEditing(false)}
                className="rounded-card bg-ink text-card px-3 py-2 text-[12px] font-semibold">Done</button>
            ) : (
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setIrrig((v) => !v)} aria-pressed={irrig}
                  className={`rounded-card px-3 py-2 text-[12px] font-semibold transition-colors ${irrig ? 'bg-live text-card' : 'border border-line text-ink70 hover:border-ink70'}`}>
                  Irrigation
                </button>
                <button type="button" onClick={() => { setEditing(true); setIrrig(false); }}
                  className="rounded-card border border-line px-3 py-2 text-[12px] font-semibold text-ink70 hover:border-ink70 transition-colors">Edit layout</button>
              </div>
            )
          ) : (
            <button type="button" onClick={() => setAdding(true)} className="rounded-card border border-line px-3 py-2 text-[12px] font-semibold text-ink70 hover:border-ink70 transition-colors">+ Build a bed</button>
          )}
        />

        {zone.about && <Breath className="mt-5 max-w-xl text-[16px]">{zone.about}</Breath>}

        <div className="mt-6">
          {lens === 'map' ? (
            editing ? (
              <ZoneLayoutEditor beds={beds} onSave={(id, footprint, shape) => setBedGeometry(id, footprint, shape)} onAddBed={() => setAdding(true)} />
            ) : (
              <div className="rounded-xl border border-line p-3 sm:p-4" style={{ background: 'var(--color-bg)' }}>
                <ZoneDiagram
                  items={liveItems} bounds={bounds}
                  onSelect={(bid) => navigate(`/garden/${gardenId}/bed/${bid}`)}
                  overlay={irrig && hasIrrig ? 'irrigation' : undefined}
                  nodes={irrig && hasIrrig ? irrigNodes : undefined}
                  path={irrig && hasIrrig ? irrigPath : undefined}
                  onToggleNode={toggleWater}
                />
                <p className="mt-2 text-center text-[12px] text-muted">
                  {irrig
                    ? (hasIrrig
                        ? `${onCount} of ${irrigByBed.size} watering now · tap a bed to toggle its water`
                        : 'No beds on the drip network yet — open a bed and add a drip line')
                    : 'Tap a bed to open it · Edit layout to arrange'}
                </p>
              </div>
            )
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {beds.map((b) => <BedCard key={b.id} tree={tree} bed={b} gardenId={gardenId} />)}
                <AddBedCard onClick={() => setAdding(true)} />
              </div>
              <section className="mt-10">
                <TasksSection tasks={tasks} onToggle={toggleTask} onAdd={(text) => addTask({ zoneId: zone.id, text })}
                  onDelete={removeTask} bedNameOf={(id) => tree.beds.find((b) => b.id === id)?.name} />
              </section>
            </>
          )}
        </div>
      </main>

      {adding && (
        <NewBedDialog zoneId={zone.id} zoneName={zone.name}
          onClose={() => setAdding(false)}
          onCreate={(bed) => { void addBed(bed); setAdding(false); }} />
      )}
    </>
  );
}
