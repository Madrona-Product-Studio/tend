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
import { bedsInZone, zoneLayout, SUN_LABEL } from '@/domain';
import { Breath } from '@design/primitives';

export default function ZoneView() {
  const { gardenId = 'demo', zoneId = '' } = useParams<{ gardenId: string; zoneId: string }>();
  const { tree, status, addBed, setBedGeometry, renameZone, toggleTask, addTask, removeTask } = useGarden(gardenId);
  const [lens, setLens] = useLens('map');
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);

  const zone = tree?.zones.find((z) => z.id === zoneId);
  const beds = useMemo(() => (tree && zone ? bedsInZone(tree, zone.id) : []), [tree, zone]);
  const { items, bounds } = useMemo(() => zoneLayout(beds), [beds]);

  if (status !== 'ready' || !tree) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted">{status === 'error' ? 'Something went wrong.' : 'Loading…'}</div>;
  }
  if (!zone) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted">Zone not found.</div>;
  }

  const zoneBedIds = new Set(beds.map((b) => b.id));
  const tasks = tree.tasks.filter((t) => t.zoneId === zone.id || (t.bedId && zoneBedIds.has(t.bedId)));

  return (
    <>
      <title>{`${zone.name} · Tend`}</title>
      <meta name="robots" content="noindex" />
      <main className="min-h-screen max-w-4xl mx-auto px-6 py-10 sm:px-10">
        <LevelHeader
          crumbs={[{ label: tree.garden.name, to: `/garden/${gardenId}` }]}
          title={zone.name}
          onRename={(name) => renameZone(zone.id, name)}
          meta={[zone.sunExposure ? SUN_LABEL[zone.sunExposure] : null, zone.description].filter(Boolean).join(' · ')}
          lens={lens} onLens={setLens}
          actions={lens === 'map' ? (
            <button type="button" onClick={() => setEditing((v) => !v)}
              className={`rounded-card px-3 py-2 text-[12px] font-semibold transition-colors ${editing ? 'bg-ink text-card' : 'border border-line text-ink70 hover:border-ink70'}`}>
              {editing ? 'Done' : 'Edit layout'}
            </button>
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
                <ZoneDiagram items={items} bounds={bounds} onSelect={(bid) => navigate(`/garden/${gardenId}/bed/${bid}`)} />
                <p className="mt-2 text-center text-[12px] text-muted">Tap a bed to open it · Edit layout to arrange</p>
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
