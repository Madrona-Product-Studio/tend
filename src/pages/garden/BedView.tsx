import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGarden } from '@/hooks/useGarden';
import { useLens } from '@/hooks/useLens';
import { LevelHeader } from '@components/LevelChrome';
import {
  plantsInBed, bedSystems, bedRowsOf, tasksForBed, observationsForBed, observationsForPlant,
  bedLive, hasLive, bedWater, CROP_LABEL, type BedWater, type Plant, type SystemRow,
} from '@/domain';
import { CROP_DOT } from '@design/cropColors';
import { Label, Hairline } from '@design/primitives';
import { T } from '@design/tokens';
import { NotesSection } from '@components/NotesSection';
import { TasksSection } from '@components/TasksSection';
import { LiveStrip } from '@components/LiveStrip';
import { EditableBedShape } from './EditableBedShape';

export default function BedView() {
  const { gardenId = 'demo', bedId = '' } = useParams<{ gardenId: string; bedId: string }>();
  const { tree, status, setPlantArrangement, addPlant, removePlant, setBedLayout, renameBed, addObservation, removeObservation, toggleTask, addTask, removeTask, setIrrigationOn } = useGarden(gardenId);
  const [lens, setLens] = useLens('map');
  const [editing, setEditing] = useState(false);
  const [plantId, setPlantId] = useState<string | null>(null);

  const bed = tree?.beds.find((b) => b.id === bedId);
  const zone = bed && tree ? tree.zones.find((z) => z.id === bed.zoneId) : undefined;

  if (status !== 'ready' || !tree) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted">{status === 'error' ? 'Something went wrong.' : 'Loading…'}</div>;
  }
  if (!bed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-sm text-muted">
        Bed not found.
        <Link to={`/garden/${gardenId}`} className="text-seal font-semibold">← Garden</Link>
      </div>
    );
  }

  const plants = plantsInBed(tree, bed.id);
  const equipChips = bedSystems(tree, bed.id).filter((s) => s.kind === 'cover' || s.kind === 'sensor');
  const { layout, rows } = bedRowsOf(plants, bed.layout);
  const live = bedLive(tree, bed.id);
  const water = bedWater(tree, bed.id);
  const tasks = tasksForBed(tree, bed.id);
  const notes = observationsForBed(tree, bed.id);
  const planting = plantId ? plants.find((p) => p.id === plantId) ?? null : null;

  const addNote = (text: string, plantId2?: string) => void addObservation({ bedId: bed.id, plantId: plantId2, text });

  return (
    <>
      <title>{`${bed.name} · GardenHQ`}</title>
      <meta name="robots" content="noindex" />

      <main className="min-h-screen max-w-5xl mx-auto px-6 py-10 sm:px-10">
        <LevelHeader
          crumbs={[
            { label: tree.garden.name, to: `/garden/${gardenId}` },
            { label: zone?.name ?? 'Zone', to: `/garden/${gardenId}/zone/${bed.zoneId}` },
          ]}
          code={bed.code}
          title={bed.name}
          onRename={(name) => renameBed(bed.id, name)}
          meta={[bed.typeDetail, bed.exposure, bed.category].filter(Boolean).join(' · ')}
          lens={lens} onLens={setLens}
          actions={lens === 'map' ? (
            <button type="button" onClick={() => { setEditing((v) => !v); setPlantId(null); }}
              className={`rounded-card px-3 py-2 text-[12px] font-semibold transition-colors ${editing ? 'bg-ink text-card' : 'border border-line text-ink70 hover:border-ink70'}`}>
              {editing ? 'Done' : 'Edit'}
            </button>
          ) : null}
        />

        {hasLive(live) && <div className="mt-6"><LiveStrip label={bed.name} live={live} /></div>}

        <div className="mt-6 lg:flex lg:gap-8 lg:items-start">
          <div className="flex-1 min-w-0">
            {lens === 'map' ? (
              <section className="rounded-card bg-card border border-line p-5 sm:p-7">
                <div className="flex items-baseline justify-between gap-3">
                  <Label className="text-clay">Plantings · {plants.length}</Label>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
                    {layout.rows} {layout.rows === 1 ? 'row' : 'rows'}{layout.sideBySide ? ' · side by side' : ''}
                  </span>
                </div>
                {editing
                  ? <EditableBedShape
                      bedId={bed.id} layout={layout} initialRows={rows}
                      onArrange={setPlantArrangement} onAddPlant={addPlant} onRemovePlant={removePlant}
                      onSetLayout={(l) => setBedLayout(bed.id, l)}
                    />
                  : <BedShape rows={rows} sideBySide={!!layout.sideBySide} selectedId={plantId} onSelect={setPlantId} />}

                <Hairline className="my-6" />
                <div className="flex flex-col gap-6">
                  <WaterControl water={water} onToggle={(on) => { if (water.node) void setIrrigationOn(water.node.id, on); }} />
                  {equipChips.length > 0 && (
                    <div>
                      <div className="mb-2"><Label className="text-clay">Equipment</Label></div>
                      <div className="flex flex-wrap gap-2">{equipChips.map((s, i) => <SystemChip key={i} row={s} />)}</div>
                    </div>
                  )}
                </div>
              </section>
            ) : (
              <section className="rounded-card bg-card border border-line p-5 sm:p-7">
                <Label className="text-clay">Plantings · {plants.length}</Label>
                <ul className="mt-3 border-t border-line">
                  {plants.map((p) => (
                    <li key={p.id}>
                      <button type="button" onClick={() => setPlantId(p.id)}
                        className="w-full flex items-baseline gap-3 py-2.5 text-left border-b border-line-soft group">
                        <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: CROP_DOT[p.attributes.cropCategory] }} />
                        <span className="text-[14px] font-medium text-ink group-hover:text-seal transition-colors">{p.name}{p.variety ? ` ${p.variety}` : ''}</span>
                        {p.note && <span className="text-[12px] text-muted">{p.note}</span>}
                        {p.issue && <span className="ml-auto text-[11px] font-semibold text-seal">{p.issue}</span>}
                        <span className="ml-auto text-muted text-sm group-hover:text-ink70">›</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-5 border-t border-line-soft">
                  <TasksSection tasks={tasks} onToggle={toggleTask} onAdd={(text) => addTask({ bedId: bed.id, text })} onDelete={removeTask} />
                </div>
                <div className="mt-6 pt-5 border-t border-line-soft">
                  <NotesSection notes={notes} onAdd={(text) => addNote(text)} onDelete={removeObservation}
                    placeholder="A note about this bed — systems, timing, what to change…" />
                </div>
              </section>
            )}
          </div>

          {planting && (
            <PlantingPanel bed={bed} planting={planting} notes={observationsForPlant(tree, planting.id)}
              onAddNote={(text) => addNote(text, planting.id)} onDeleteNote={removeObservation}
              onClose={() => setPlantId(null)} />
          )}
        </div>
      </main>

      {planting && <div className="fixed inset-0 bg-ink/30 z-40 lg:hidden" onClick={() => setPlantId(null)} />}
    </>
  );
}

function PlantNode({ plant, selected, onClick }: { plant: Plant; selected: boolean; onClick: () => void }) {
  const border = selected ? 'border-ink bg-paper' : plant.issue ? 'border-seal/40 bg-card hover:border-seal' : 'border-line bg-card hover:border-ink70';
  return (
    <button type="button" onClick={onClick} aria-pressed={selected}
      className={`flex items-center gap-2 max-w-full rounded-3xl border px-3 py-1.5 text-left transition-colors ${border}`}>
      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CROP_DOT[plant.attributes.cropCategory] }} />
      <span className="min-w-0 text-[13px] font-medium text-ink leading-snug">
        {plant.name}
        {plant.variety && <span className="font-normal text-muted"> {plant.variety}</span>}
        {plant.issue && <span className="font-semibold text-seal"> · {plant.issue}</span>}
        {!plant.issue && plant.note && <span className="text-muted"> · {plant.note}</span>}
      </span>
    </button>
  );
}

// The bed rendered as a shape: a framed plot with the plantings arranged in rows
// (stacked, or side by side per the bed's layout config).
function BedShape({ rows, sideBySide, selectedId, onSelect }: {
  rows: Plant[][]; sideBySide: boolean; selectedId: string | null; onSelect: (id: string) => void;
}) {
  return (
    <div className="mt-4 rounded-xl border-2 border-line p-3 sm:p-4" style={{ background: 'var(--color-bg)' }}>
      <div className={sideBySide ? 'flex' : 'flex flex-col'}>
        {rows.map((row, i) => (
          <Lane key={i} index={i} plants={row} vertical={sideBySide} last={i === rows.length - 1}
            selectedId={selectedId} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function Lane({ index, plants, vertical, last, selectedId, onSelect }: {
  index: number; plants: Plant[]; vertical: boolean; last: boolean; selectedId: string | null; onSelect: (id: string) => void;
}) {
  const rowLabel = <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-faint">Row {index + 1}</span>;
  const nodes = (
    <>
      {plants.map((p) => <PlantNode key={p.id} plant={p} selected={p.id === selectedId} onClick={() => onSelect(p.id)} />)}
      {plants.length === 0 && <span className="text-[11px] italic text-faint">empty</span>}
    </>
  );

  // Vertical variant: rows as side-by-side columns (kept for layout variability).
  if (vertical) {
    return (
      <div className={`flex-1 min-w-0 px-3 first:pl-1 last:pr-1 ${last ? '' : 'border-r border-line-soft'}`}>
        <div className="mb-2.5">{rowLabel}</div>
        <div className="flex flex-col gap-2 items-start">{nodes}</div>
      </div>
    );
  }

  // Default: rows run the long way — a horizontal lane with its label at the start.
  return (
    <div className={`flex items-start gap-3 sm:gap-4 py-3 first:pt-1 last:pb-1 ${last ? '' : 'border-b border-line-soft'}`}>
      <span className="shrink-0 w-10 pt-2">{rowLabel}</span>
      <div className="flex flex-wrap gap-2 flex-1 min-w-0">{nodes}</div>
    </div>
  );
}

// Irrigation, framed to answer "is this bed watered, and if not why?" + a toggle.
function WaterControl({ water, onToggle }: { water: BedWater; onToggle: (on: boolean) => void }) {
  const n = water.node;
  const kindLabel = n?.kind === 'misters' ? 'Misters' : n?.kind === 'soaker' ? 'Soaker hose' : n?.emitterCount ? `${n.emitterCount} emitters` : 'Drip';
  return (
    <div>
      <div className="mb-2"><Label className="text-clay">Water</Label></div>
      {n ? (
        <div className="flex items-center gap-3 flex-wrap">
          <button type="button" role="switch" aria-checked={n.on} onClick={() => onToggle(!n.on)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${n.on ? 'border-live/40 text-live bg-live/10' : 'border-line text-muted hover:border-ink70'}`}>
            <span className={`w-2 h-2 rounded-full ${n.on ? 'bg-live' : 'bg-faint'}`} />
            {n.on ? 'Water on' : 'Water off'}
          </button>
          <span className="text-[13px] text-ink70">{kindLabel}</span>
          {n.note && <span className="text-[12px] text-muted">· {n.note}</span>}
        </div>
      ) : (
        <p className="text-[13px] text-clay">
          {water.selfWatering ? 'Self-watering — wicking floor + reservoir, no drip line.' : 'Hand-watered — not on the drip system.'}
        </p>
      )}
    </div>
  );
}

function SystemChip({ row }: { row: SystemRow }) {
  const dot = row.on === false ? T.faint : row.on === true ? T.live : T.clay;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[12px] text-ink70">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
      {row.label}
    </span>
  );
}

function PlantingPanel({ bed, planting, notes, onAddNote, onDeleteNote, onClose }: {
  bed: { name: string; code?: string; category?: string };
  planting: Plant;
  notes: ReturnType<typeof observationsForPlant>;
  onAddNote: (text: string) => void;
  onDeleteNote: (id: string) => void;
  onClose: () => void;
}) {
  const status = planting.issue ?? planting.note ?? 'Looks healthy';
  return (
    <aside aria-label={`${planting.name} detail`}
      className="bg-card border border-line p-5 z-50 overflow-auto
                 fixed inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl border-t-2
                 lg:static lg:z-auto lg:max-h-none lg:w-[340px] lg:shrink-0 lg:sticky lg:top-10 lg:rounded-card lg:border">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[11px] text-seal">{bed.code ? `${bed.code} · planting` : 'Planting'}</div>
          <h2 className="mt-1 text-xl font-bold tracking-[-0.02em] text-ink">{planting.name}{planting.variety ? ` ${planting.variety}` : ''}</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-ink text-lg leading-none">✕</button>
      </div>

      <Hairline className="my-4" />
      <Field label="Bed">{bed.name}</Field>
      <Field label="Group">{CROP_LABEL[planting.attributes.cropCategory]}{bed.category ? ` · ${bed.category}` : ''}</Field>
      <Field label="Status"><span className={planting.issue ? 'text-seal font-medium' : 'text-ink70'}>{status}</span></Field>

      <div className="mt-4 pt-4 border-t border-line-soft">
        <NotesSection notes={notes} onAdd={onAddNote} onDelete={onDeleteNote} />
      </div>
      <Block label="Species">
        <Species planting={planting} />
      </Block>
      <Block label="Photos">
        <p className="text-[12.5px] text-muted leading-[1.55]">Add a photo for reference — the mystery plum, a pest, a label you can’t read. (Arrives with cloud sync.)</p>
      </Block>
      <Block label="History">
        <p className="text-[12.5px] text-muted leading-[1.55]">Seasons tracked: 1 (current). Future seasons stack here to show how {planting.name} performs year over year.</p>
      </Block>
    </aside>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[80px_1fr] gap-3 items-baseline py-1.5">
      <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-muted">{label}</span>
      <span className="text-[13px] text-ink70">{children}</span>
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 pt-4 border-t border-line-soft">
      <div className="mb-2"><Label className="text-ink">{label}</Label></div>
      {children}
    </div>
  );
}

function Species({ planting }: { planting: Plant }) {
  const a = planting.attributes;
  const rows: [string, string][] = [['Category', CROP_LABEL[a.cropCategory]]];
  if (a.season) rows.push(['Season', a.season === 'cool' ? 'Cool-season' : a.season === 'warm' ? 'Warm-season' : 'Perennial']);
  if (a.pollinationRequired !== undefined) rows.push(['Pollination', a.pollinationRequired ? 'Required' : 'Not needed']);
  if (typeof a.soilTempNeedF === 'number') rows.push(['Soil temp', `≥ ${a.soilTempNeedF}°F`]);
  if (a.waterDemand) rows.push(['Water', `${a.waterDemand[0]!.toUpperCase()}${a.waterDemand.slice(1)}`]);
  if (a.boltingRisk) rows.push(['Trait', 'Prone to bolting']);
  return (
    <div>
      <div className="flex flex-col">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[84px_1fr] gap-3 items-baseline py-1">
            <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-muted">{k}</span>
            <span className="text-[13px] text-ink70">{v}</span>
          </div>
        ))}
      </div>
      {rows.length <= 1 && (
        <p className="mt-2 text-[12px] text-muted leading-[1.5]">More care detail (season, soil temp, pollination) fills in as we enrich {planting.name}.</p>
      )}
    </div>
  );
}
