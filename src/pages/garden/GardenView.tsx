import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGarden } from '@/hooks/useGarden';
import { useLens } from '@/hooks/useLens';
import { LevelHeader } from '@components/LevelChrome';
import { SpatialLens, type SpatialItem } from '@components/SpatialLens';
import { BedCard, AddBedCard } from '@components/BedCard';
import { NewBedDialog } from './NewBedDialog';
import { bedsInZone, SUN_LABEL, type GardenTree, type Zone } from '@/domain';
import { buildScene } from '@/map/scene';
import { Label, Breath, Hairline, Marker } from '@design/primitives';

const pad = (n: number) => String(n).padStart(2, '0');

export default function GardenView() {
  const { gardenId = 'demo' } = useParams<{ gardenId: string }>();
  const { tree, status, toggleTask, addBed } = useGarden(gardenId);
  const [lens, setLens] = useLens('map');
  const navigate = useNavigate();
  const [addingZone, setAddingZone] = useState<Zone | null>(null);
  const scene = useMemo(() => (tree ? buildScene(tree) : null), [tree]);

  if (status !== 'ready' || !tree || !scene) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted">{status === 'error' ? 'Something went wrong.' : 'Loading the garden…'}</div>;
  }

  const items: SpatialItem[] = scene.zones.map((z) => ({
    id: z.id, label: z.zone.name, sublabel: z.zone.description, rect: z.rect,
  }));

  return (
    <>
      <title>{`${tree.garden.name} · Tend`}</title>
      <main className="min-h-screen max-w-4xl mx-auto px-6 py-10 sm:px-10">
        <LevelHeader
          crumbs={[]} title={tree.garden.name}
          meta={`${tree.zones.length} zones · ${tree.beds.length} beds · ${tree.plants.length} plantings`}
          lens={lens} onLens={setLens}
        />

        <div className="mt-6">
          {lens === 'map' ? (
            <SpatialLens bounds={scene.bounds} items={items} hint="Tap a zone to enter"
              onSelect={(zid) => navigate(`/garden/${gardenId}/zone/${zid}`)} />
          ) : (
            <>
              {tree.zones.map((z, i) => (
                <ZoneBlock key={z.id} tree={tree} zone={z} index={i + 1} total={tree.zones.length}
                  gardenId={gardenId} onAddBed={() => setAddingZone(z)} />
              ))}
              <PunchList tree={tree} onToggle={toggleTask} />
            </>
          )}
        </div>
      </main>

      {addingZone && (
        <NewBedDialog zoneId={addingZone.id} zoneName={addingZone.name}
          onClose={() => setAddingZone(null)}
          onCreate={(bed) => { void addBed(bed); setAddingZone(null); navigate(`/garden/${gardenId}/bed/${bed.id}`); }} />
      )}
    </>
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

function PunchList({ tree, onToggle }: { tree: GardenTree; onToggle: (id: string, done: boolean) => void }) {
  if (tree.tasks.length === 0) return null;
  const bedName = (id?: string) => tree.beds.find((b) => b.id === id)?.name;
  return (
    <section className="mb-12">
      <div className="mb-3"><Label className="text-clay">Punch-list · a map and a plan</Label></div>
      <div className="border-t border-line">
        {tree.tasks.map((t) => (
          <button key={t.id} type="button" onClick={() => onToggle(t.id, !t.done)}
            className="w-full flex items-start gap-3 py-2.5 text-left border-b border-line-soft group">
            <span className={`mt-1 w-3.5 h-3.5 rounded-full border shrink-0 transition-colors ${t.done ? 'bg-live border-live' : 'border-muted group-hover:border-ink70'}`} />
            <span className={`flex-1 text-[14px] leading-snug ${t.done ? 'text-faint line-through' : 'text-ink70'}`}>
              {t.text}{bedName(t.bedId) && <span className="text-muted"> · {bedName(t.bedId)}</span>}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
