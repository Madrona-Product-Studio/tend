import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGarden } from '@/hooks/useGarden';
import { useLens } from '@/hooks/useLens';
import { LevelHeader } from '@components/LevelChrome';
import { SpatialLens, type SpatialItem } from '@components/SpatialLens';
import { BedCard, AddBedCard } from '@components/BedCard';
import { NewBedDialog } from './NewBedDialog';
import { bedsInZone, SUN_LABEL } from '@/domain';
import { buildScene } from '@/map/scene';
import { Label, Breath } from '@design/primitives';

export default function ZoneView() {
  const { gardenId = 'demo', zoneId = '' } = useParams<{ gardenId: string; zoneId: string }>();
  const { tree, status, addBed } = useGarden(gardenId);
  const [lens, setLens] = useLens('map');
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const scene = useMemo(() => (tree ? buildScene(tree) : null), [tree]);

  if (status !== 'ready' || !tree || !scene) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted">{status === 'error' ? 'Something went wrong.' : 'Loading…'}</div>;
  }
  const zone = tree.zones.find((z) => z.id === zoneId);
  if (!zone) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted">Zone not found.</div>;
  }

  const beds = bedsInZone(tree, zone.id);
  const zoneNode = scene.zones.find((z) => z.id === zone.id);
  const items: SpatialItem[] = scene.beds.filter((b) => b.zoneId === zone.id).map((b) => ({
    id: b.id, label: b.bed.name, sublabel: b.bed.typeDetail, rect: b.rect,
    accent: typeof b.bed.state?.reservoirLevel === 'number',
  }));
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
          meta={[zone.sunExposure ? SUN_LABEL[zone.sunExposure] : null, zone.description].filter(Boolean).join(' · ')}
          lens={lens} onLens={setLens}
          actions={<button type="button" onClick={() => setAdding(true)} className="rounded-card border border-line px-3 py-2 text-[12px] font-semibold text-ink70 hover:border-ink70 transition-colors">+ Build a bed</button>}
        />

        {zone.about && <Breath className="mt-5 max-w-xl text-[16px]">{zone.about}</Breath>}

        <div className="mt-6">
          {lens === 'map' && zoneNode ? (
            <SpatialLens bounds={zoneNode.rect} items={items} hint="Tap a bed to open it"
              onSelect={(bid) => navigate(`/garden/${gardenId}/bed/${bid}`)} />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {beds.map((b) => <BedCard key={b.id} tree={tree} bed={b} gardenId={gardenId} />)}
                <AddBedCard onClick={() => setAdding(true)} />
              </div>
              {tasks.length > 0 && (
                <section className="mt-10">
                  <div className="mb-3"><Label className="text-clay">Tasks · {tasks.length}</Label></div>
                  <ul className="border-t border-line">
                    {tasks.map((t) => (
                      <li key={t.id} className="flex items-start gap-3 py-2.5 border-b border-line-soft">
                        <span className={`mt-1 w-3 h-3 rounded-full border shrink-0 ${t.done ? 'bg-live border-live' : 'border-muted'}`} />
                        <span className={`text-[14px] ${t.done ? 'text-faint line-through' : 'text-ink70'}`}>
                          {t.text}{t.bedId && <span className="text-muted"> · {tree.beds.find((b) => b.id === t.bedId)?.name}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      {adding && (
        <NewBedDialog zoneId={zone.id} zoneName={zone.name}
          onClose={() => setAdding(false)}
          onCreate={(bed) => { void addBed(bed); setAdding(false); navigate(`/garden/${gardenId}/bed/${bed.id}`); }} />
      )}
    </>
  );
}
