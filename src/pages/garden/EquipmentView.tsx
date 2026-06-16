import { useParams } from 'react-router-dom';
import { useGarden } from '@/hooks/useGarden';
import { LevelHeader } from '@components/LevelChrome';
import { movableEquipment, type Bed, type EquipmentItem } from '@/domain';
import { Label } from '@design/primitives';

export default function EquipmentView() {
  const { gardenId = 'demo' } = useParams<{ gardenId: string }>();
  const { tree, status, reassignEquipment } = useGarden(gardenId);

  if (status !== 'ready' || !tree) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted">{status === 'error' ? 'Something went wrong.' : 'Loading…'}</div>;
  }

  const equip = movableEquipment(tree);
  const covers = equip.filter((e) => e.kind === 'cover');
  const sensors = equip.filter((e) => e.kind === 'sensor');
  const move = (item: EquipmentItem, bedId?: string) => void reassignEquipment(item.kind, item.id, bedId);

  return (
    <>
      <title>Equipment · Tend</title>
      <meta name="robots" content="noindex" />
      <main className="min-h-screen max-w-3xl mx-auto px-6 py-10 sm:px-10">
        <LevelHeader
          crumbs={[{ label: tree.garden.name, to: `/garden/${gardenId}` }]}
          title="Equipment"
          meta="A shared, limited set of covers and sensors — move them where they're needed, like speakers between rooms."
        />

        <div className="mt-8 flex flex-col gap-8">
          <Group label={`Covers · ${covers.length}`} items={covers} beds={tree.beds} onMove={move} />
          <Group label={`Sensors · ${sensors.length}`} items={sensors} beds={tree.beds} onMove={move} />
        </div>
      </main>
    </>
  );
}

function Group({ label, items, beds, onMove }: {
  label: string; items: EquipmentItem[]; beds: Bed[]; onMove: (item: EquipmentItem, bedId?: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <div className="mb-3"><Label className="text-clay">{label}</Label></div>
      <div className="flex flex-col gap-2">
        {items.map((item) => <EquipCard key={item.id} item={item} beds={beds} onMove={onMove} />)}
      </div>
    </section>
  );
}

function EquipCard({ item, beds, onMove }: {
  item: EquipmentItem; beds: Bed[]; onMove: (item: EquipmentItem, bedId?: string) => void;
}) {
  const assigned = !!item.assignedBedId;
  return (
    <div className="rounded-card bg-card border border-line p-4 flex items-center justify-between gap-4 flex-wrap">
      <div className="min-w-0 flex items-center gap-3">
        <span className={`w-2 h-2 rounded-full shrink-0 ${assigned ? 'bg-live' : 'bg-faint'}`} />
        <div className="min-w-0">
          <div className="text-[15px] font-semibold text-ink">{item.title}</div>
          {item.detail && <div className="text-[12px] text-muted mt-0.5">{item.detail}</div>}
        </div>
      </div>
      <label className="flex items-center gap-2">
        <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-muted">At</span>
        <select
          value={item.assignedBedId ?? ''}
          onChange={(e) => onMove(item, e.target.value || undefined)}
          className="rounded-card border border-line bg-card px-3 py-2 text-[13px] text-ink70 outline-none focus:border-ink"
        >
          <option value="">In storage</option>
          {beds.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </label>
    </div>
  );
}
