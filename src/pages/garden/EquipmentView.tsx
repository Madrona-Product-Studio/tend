import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGarden } from '@/hooks/useGarden';
import { LevelHeader } from '@components/LevelChrome';
import { movableEquipment, type Bed, type EquipmentItem } from '@/domain';
import { Label } from '@design/primitives';
import { NewEquipmentDialog } from './NewEquipmentDialog';

export default function EquipmentView() {
  const { gardenId = 'demo' } = useParams<{ gardenId: string }>();
  const { tree, status, reassignEquipment, addCover, addSensor, removeEquipment } = useGarden(gardenId);
  const [adding, setAdding] = useState<'cover' | 'sensor' | null>(null);

  if (status !== 'ready' || !tree) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted">{status === 'error' ? 'Something went wrong.' : 'Loading…'}</div>;
  }

  const equip = movableEquipment(tree);
  const covers = equip.filter((e) => e.kind === 'cover');
  const sensors = equip.filter((e) => e.kind === 'sensor');
  const move = (item: EquipmentItem, bedId?: string) => void reassignEquipment(item.kind, item.id, bedId);
  const remove = (item: EquipmentItem) => void removeEquipment(item.kind, item.id);

  return (
    <>
      <title>Equipment · GardenHQ</title>
      <meta name="robots" content="noindex" />
      <main className="min-h-screen max-w-3xl mx-auto px-6 py-10 sm:px-10">
        <LevelHeader
          crumbs={[{ label: tree.garden.name, to: `/garden/${gardenId}` }]}
          title="Equipment"
          meta="A shared, limited set of covers and sensors — move them where they're needed, like speakers between rooms."
        />

        <div className="mt-8 flex flex-col gap-8">
          <Group label="Covers" kind="cover" items={covers} beds={tree.beds} onMove={move} onRemove={remove} onAdd={() => setAdding('cover')} />
          <Group label="Sensors" kind="sensor" items={sensors} beds={tree.beds} onMove={move} onRemove={remove} onAdd={() => setAdding('sensor')} />
        </div>
      </main>

      {adding && (
        <NewEquipmentDialog kind={adding} gardenId={gardenId} beds={tree.beds}
          onClose={() => setAdding(null)}
          onCreateCover={(c) => { void addCover(c); setAdding(null); }}
          onCreateSensor={(s) => { void addSensor(s); setAdding(null); }} />
      )}
    </>
  );
}

function Group({ label, kind, items, beds, onMove, onRemove, onAdd }: {
  label: string; kind: 'cover' | 'sensor'; items: EquipmentItem[]; beds: Bed[];
  onMove: (item: EquipmentItem, bedId?: string) => void; onRemove: (item: EquipmentItem) => void; onAdd: () => void;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <Label className="text-clay">{label} · {items.length}</Label>
        <button type="button" onClick={onAdd}
          className="rounded-card border border-line px-3 py-1.5 text-[12px] font-semibold text-ink70 hover:border-ink70 transition-colors">
          + Add {kind}
        </button>
      </div>
      {items.length === 0 ? (
        <p className="rounded-card border border-dashed border-line p-4 text-[13px] text-muted">
          No {label.toLowerCase()} yet. Add one, then assign it to a bed as the season demands.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => <EquipCard key={item.id} item={item} beds={beds} onMove={onMove} onRemove={onRemove} />)}
        </div>
      )}
    </section>
  );
}

function EquipCard({ item, beds, onMove, onRemove }: {
  item: EquipmentItem; beds: Bed[]; onMove: (item: EquipmentItem, bedId?: string) => void; onRemove: (item: EquipmentItem) => void;
}) {
  const assigned = !!item.assignedBedId;
  return (
    <div className="rounded-card bg-card border border-line p-4 flex items-center justify-between gap-4 flex-wrap">
      <div className="min-w-0 flex items-center gap-3">
        {/* Neutral assignment indicator — teal (`live`) is reserved for real-time
            readings, not "is this assigned to a bed". */}
        <span className={`w-2 h-2 rounded-full shrink-0 ${assigned ? 'bg-clay' : 'bg-faint'}`} />
        <div className="min-w-0">
          <div className="text-[15px] font-semibold text-ink">{item.title}</div>
          {item.detail && <div className="text-[12px] text-muted mt-0.5">{item.detail}</div>}
        </div>
      </div>
      <div className="flex items-center gap-2">
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
        <button type="button" onClick={() => onRemove(item)} aria-label={`Remove ${item.title}`}
          className="text-faint hover:text-seal text-sm leading-none px-1">✕</button>
      </div>
    </div>
  );
}
