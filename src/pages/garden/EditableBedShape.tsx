// Edit mode for the bed's visual layout: drag plantings between/within rows,
// add and delete plantings, add/remove rows, toggle orientation. Built on
// @dnd-kit (pointer + touch + keyboard). Changes persist live via the callbacks.
import { useEffect, useState } from 'react';
import {
  DndContext, DragOverlay, PointerSensor, TouchSensor, KeyboardSensor,
  closestCorners, useSensor, useSensors, useDroppable,
  type DragStartEvent, type DragOverEvent, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, arrayMove,
  horizontalListSortingStrategy, verticalListSortingStrategy, sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { BedLayout, CropCategory, Plant } from '@/domain';
import { CROP_DOT } from '@design/cropColors';

interface Props {
  bedId: string;
  layout: BedLayout;
  initialRows: Plant[][];
  onArrange: (u: { id: string; row: number; order: number }[]) => void;
  onAddPlant: (p: Plant) => void;
  onRemovePlant: (id: string) => void;
  onSetLayout: (l: BedLayout) => void;
}

const rowId = (i: number) => `row-${i}`;

export function EditableBedShape({ bedId, layout, initialRows, onArrange, onAddPlant, onRemovePlant, onSetLayout }: Props) {
  const [rows, setRows] = useState<Plant[][]>(initialRows);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addingRow, setAddingRow] = useState<number | null>(null);
  const sideBySide = !!layout.sideBySide;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Persist arrangement whenever rows settle (not mid-drag).
  useEffect(() => {
    if (activeId) return;
    const updates: { id: string; row: number; order: number }[] = [];
    rows.forEach((r, ri) => r.forEach((p, oi) => updates.push({ id: p.id, row: ri, order: oi })));
    onArrange(updates);
  }, [rows, activeId, onArrange]);

  const rowIndexOf = (id: string): number =>
    id.startsWith('row-') ? Number(id.slice(4)) : rows.findIndex((r) => r.some((p) => p.id === id));

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  const onDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;
    const from = rowIndexOf(String(active.id));
    const to = rowIndexOf(String(over.id));
    if (from === -1 || to === -1 || from === to) return;
    setRows((prev) => {
      const next = prev.map((r) => [...r]);
      const mi = next[from]!.findIndex((p) => p.id === active.id);
      if (mi === -1) return prev;
      const [moving] = next[from]!.splice(mi, 1);
      let at = next[to]!.length;
      if (!String(over.id).startsWith('row-')) {
        const oi = next[to]!.findIndex((p) => p.id === over.id);
        if (oi !== -1) at = oi;
      }
      next[to]!.splice(at, 0, moving!);
      return next;
    });
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;
    const from = rowIndexOf(String(active.id));
    const to = rowIndexOf(String(over.id));
    if (from === to && from !== -1 && !String(over.id).startsWith('row-')) {
      setRows((prev) => {
        const next = prev.map((r) => [...r]);
        const oldI = next[from]!.findIndex((p) => p.id === active.id);
        const newI = next[from]!.findIndex((p) => p.id === over.id);
        if (oldI !== -1 && newI !== -1) next[from] = arrayMove(next[from]!, oldI, newI);
        return next;
      });
    }
  };

  const defaultCat: CropCategory = (() => {
    const counts = new Map<CropCategory, number>();
    rows.flat().forEach((p) => counts.set(p.attributes.cropCategory, (counts.get(p.attributes.cropCategory) ?? 0) + 1));
    let best: CropCategory = 'other'; let n = 0;
    counts.forEach((c, k) => { if (c > n) { n = c; best = k; } });
    return best;
  })();

  const addPlant = (ri: number, name: string) => {
    const clean = name.trim();
    if (!clean) return;
    const plant: Plant = { id: crypto.randomUUID(), bedId, name: clean, attributes: { cropCategory: defaultCat }, row: ri, order: rows[ri]!.length };
    setRows((prev) => prev.map((r, i) => (i === ri ? [...r, plant] : r)));
    onAddPlant(plant);
    setAddingRow(null);
  };

  const removePlant = (id: string) => {
    setRows((prev) => prev.map((r) => r.filter((p) => p.id !== id)));
    onRemovePlant(id);
  };

  const addRow = () => { setRows((prev) => [...prev, []]); onSetLayout({ kind: 'rows', rows: rows.length + 1, sideBySide }); };
  const removeRow = (i: number) => {
    if (rows[i]!.length) return;
    setRows((prev) => prev.filter((_, idx) => idx !== i));
    onSetLayout({ kind: 'rows', rows: Math.max(1, rows.length - 1), sideBySide });
  };
  const toggleOrientation = () => onSetLayout({ kind: 'rows', rows: rows.length, sideBySide: !sideBySide });

  const activePlant = activeId ? rows.flat().find((p) => p.id === activeId) ?? null : null;

  return (
    <div className="mt-4">
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
        <div className="rounded-xl border-2 border-dashed border-line p-3 sm:p-4" style={{ background: 'var(--color-bg)' }}>
          <div className={sideBySide ? 'flex' : 'flex flex-col'}>
            {rows.map((row, i) => (
              <EditRow
                key={i} index={i} plants={row} vertical={sideBySide} last={i === rows.length - 1}
                onRemovePlant={removePlant} onRemoveRow={() => removeRow(i)}
                adding={addingRow === i} onStartAdd={() => setAddingRow(i)} onCancelAdd={() => setAddingRow(null)}
                onAdd={(name) => addPlant(i, name)}
              />
            ))}
          </div>
        </div>
        <DragOverlay>{activePlant ? <NodeChip plant={activePlant} dragging /> : null}</DragOverlay>
      </DndContext>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={addRow} className="rounded-card border border-line px-3 py-1.5 text-[12px] font-semibold text-ink70 hover:border-ink70 transition-colors">+ Add row</button>
        <button type="button" onClick={toggleOrientation} className="rounded-card border border-line px-3 py-1.5 text-[12px] font-semibold text-ink70 hover:border-ink70 transition-colors">
          Rows: {sideBySide ? 'side by side' : 'stacked'}
        </button>
      </div>
    </div>
  );
}

function EditRow({ index, plants, vertical, last, onRemovePlant, onRemoveRow, adding, onStartAdd, onCancelAdd, onAdd }: {
  index: number; plants: Plant[]; vertical: boolean; last: boolean;
  onRemovePlant: (id: string) => void; onRemoveRow: () => void;
  adding: boolean; onStartAdd: () => void; onCancelAdd: () => void; onAdd: (name: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: rowId(index) });
  const frame = vertical
    ? `flex-1 min-w-0 px-3 first:pl-1 last:pr-1 ${last ? '' : 'border-r border-line-soft'}`
    : `py-3 first:pt-1 last:pb-1 ${last ? '' : 'border-b border-line-soft'}`;

  return (
    <div className={vertical ? frame : `${frame} flex items-start gap-3 sm:gap-4`}>
      <div className={vertical ? 'mb-2.5 flex items-center justify-between' : 'shrink-0 w-10 pt-2 flex flex-col gap-1'}>
        <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-faint">Row {index + 1}</span>
        {plants.length === 0 && <button type="button" onClick={onRemoveRow} aria-label={`Remove row ${index + 1}`} className="text-faint hover:text-seal text-[11px] text-left">remove</button>}
      </div>

      <SortableContext items={plants.map((p) => p.id)} strategy={vertical ? verticalListSortingStrategy : horizontalListSortingStrategy}>
        <div ref={setNodeRef}
          className={`flex flex-wrap gap-2 ${vertical ? 'flex-col items-start' : 'flex-1 min-w-0'} ${isOver ? 'rounded-lg outline-2 outline-dashed outline-seal/40 outline-offset-4' : ''}`}>
          {plants.map((p) => <SortableNode key={p.id} plant={p} onRemove={() => onRemovePlant(p.id)} />)}
          {adding
            ? <AddInput onAdd={onAdd} onCancel={onCancelAdd} />
            : <button type="button" onClick={onStartAdd} className="inline-flex items-center rounded-3xl border border-dashed border-line px-3 py-1.5 text-[12px] font-semibold text-muted hover:border-ink70 hover:text-ink70 transition-colors">+ Add</button>}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableNode({ plant, onRemove }: { plant: Plant; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: plant.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="inline-flex">
      <NodeChip plant={plant} handleProps={{ ...attributes, ...listeners }} onRemove={onRemove} />
    </div>
  );
}

function NodeChip({ plant, handleProps, onRemove, dragging }: {
  plant: Plant; handleProps?: Record<string, unknown>; onRemove?: () => void; dragging?: boolean;
}) {
  return (
    <span className={`flex items-center gap-2 max-w-full rounded-3xl border bg-card px-2.5 py-1.5 ${dragging ? 'border-ink shadow-md' : plant.issue ? 'border-seal/40' : 'border-line'}`}>
      <button type="button" {...handleProps} aria-label={`Drag ${plant.name}`} className="cursor-grab active:cursor-grabbing touch-none text-faint hover:text-ink70 leading-none">⠿</button>
      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CROP_DOT[plant.attributes.cropCategory] }} />
      <span className="min-w-0 text-[13px] font-medium text-ink leading-snug">
        {plant.name}
        {plant.variety && <span className="font-normal text-muted"> {plant.variety}</span>}
      </span>
      {onRemove && <button type="button" onClick={onRemove} aria-label={`Remove ${plant.name}`} className="text-faint hover:text-seal leading-none ml-0.5">✕</button>}
    </span>
  );
}

function AddInput({ onAdd, onCancel }: { onAdd: (name: string) => void; onCancel: () => void }) {
  const [v, setV] = useState('');
  return (
    <input
      autoFocus value={v} onChange={(e) => setV(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter') onAdd(v); if (e.key === 'Escape') onCancel(); }}
      onBlur={() => (v.trim() ? onAdd(v) : onCancel())}
      placeholder="Plant name…"
      className="rounded-3xl border border-ink bg-card px-3 py-1.5 text-[13px] text-ink w-36 outline-none"
    />
  );
}
