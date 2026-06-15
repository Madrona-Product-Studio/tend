import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGarden } from '@/hooks/useGarden';
import {
  plantsInBed, bedSystems, tasksForBed, observationsForBed, observationsForPlant,
  CROP_LABEL, type Plant, type SystemRow,
} from '@/domain';
import { CROP_DOT } from '@design/cropColors';
import { Label, Hairline } from '@design/primitives';
import { T } from '@design/tokens';

export default function BedView() {
  const { gardenId = 'demo', bedId = '' } = useParams<{ gardenId: string; bedId: string }>();
  const { tree, status } = useGarden(gardenId);
  const [lens, setLens] = useState<'visual' | 'list'>('visual');
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
  const systems = bedSystems(tree, bed.id);
  const reservoir = bed.state?.reservoirLevel;
  const otherSystems = systems.filter((s) => s.kind !== 'reservoir');
  const tasks = tasksForBed(tree, bed.id);
  const notes = observationsForBed(tree, bed.id);
  const planting = plantId ? plants.find((p) => p.id === plantId) ?? null : null;

  return (
    <>
      <title>{`${bed.name} · Tend`}</title>
      <meta name="robots" content="noindex" />

      <main className="min-h-screen max-w-5xl mx-auto px-6 py-10 sm:px-10">
        {/* Breadcrumb + identity */}
        <nav className="flex items-center gap-2 text-sm flex-wrap">
          <Link to={`/garden/${gardenId}/map`} className="text-muted hover:text-ink70 transition-colors">Garden</Link>
          <span className="text-faint">›</span>
          <Link to={`/garden/${gardenId}`} className="text-muted hover:text-ink70 transition-colors">{zone?.name ?? 'Zone'}</Link>
          <span className="text-faint">›</span>
          <span className="font-semibold text-ink">{bed.name}</span>
        </nav>

        <header className="mt-5">
          <div className="font-mono text-[11px] tracking-[0.06em] text-seal">{bed.code}</div>
          <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-ink">{bed.name}</h1>
          <p className="mt-2 text-sm text-clay">
            {[bed.typeDetail, bed.exposure, bed.category].filter(Boolean).join(' · ')}
          </p>
        </header>

        {/* Lens toggle */}
        <div className="mt-6 inline-flex rounded-card border border-line overflow-hidden text-[12px] font-semibold">
          {(['visual', 'list'] as const).map((id) => (
            <button key={id} type="button" onClick={() => setLens(id)} aria-pressed={lens === id}
              className={`px-4 py-2 transition-colors ${lens === id ? 'bg-ink text-card' : 'text-muted hover:text-ink70'}`}>
              {id === 'visual' ? 'Visual' : 'List'}
            </button>
          ))}
        </div>

        <div className="mt-6 lg:flex lg:gap-8 lg:items-start">
          <div className="flex-1 min-w-0">
            {lens === 'visual' ? (
              <section className="rounded-card bg-card border border-line p-5 sm:p-7">
                <Label className="text-clay">Plantings · {plants.length}</Label>
                <div className="mt-4 flex flex-wrap gap-2">
                  {plants.map((p) => (
                    <PlantNode key={p.id} plant={p} selected={p.id === plantId} onClick={() => setPlantId(p.id)} />
                  ))}
                </div>

                {(typeof reservoir === 'number' || otherSystems.length > 0) && (
                  <>
                    <Hairline className="my-6" />
                    <Label className="text-clay">Systems</Label>
                    <div className="mt-4 flex flex-col gap-4">
                      {typeof reservoir === 'number' && <ReservoirBar level={reservoir} />}
                      {otherSystems.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {otherSystems.map((s, i) => <SystemChip key={i} row={s} />)}
                        </div>
                      )}
                    </div>
                  </>
                )}
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
                {tasks.length > 0 && (
                  <div className="mt-6"><Label className="text-clay">Tasks · {tasks.length}</Label>
                    <ul className="mt-2 flex flex-col gap-1.5">{tasks.map((t) => <li key={t.id} className="text-[13px] text-ink70 pl-4 relative before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-2 before:h-2 before:border before:border-ink70">{t.text}</li>)}</ul>
                  </div>
                )}
                {notes.length > 0 && (
                  <div className="mt-6"><Label className="text-clay">Notes</Label>
                    <ul className="mt-2 flex flex-col gap-3">{notes.map((o) => <li key={o.id} className="grid grid-cols-[44px_1fr] gap-3"><span className="font-mono text-[10.5px] text-muted pt-0.5">{o.date}</span><span className="text-[13px] text-ink70 leading-[1.5]">{o.text}</span></li>)}</ul>
                  </div>
                )}
              </section>
            )}
          </div>

          {planting && <PlantingPanel bed={bed} planting={planting} notes={observationsForPlant(tree, planting.id)} onClose={() => setPlantId(null)} />}
        </div>
      </main>

      {planting && <div className="fixed inset-0 bg-ink/30 z-40 lg:hidden" onClick={() => setPlantId(null)} />}
    </>
  );
}

function PlantNode({ plant, selected, onClick }: { plant: Plant; selected: boolean; onClick: () => void }) {
  const border = selected ? 'border-ink bg-paper' : plant.issue ? 'border-seal/40 hover:border-seal' : 'border-line hover:border-ink70';
  return (
    <button type="button" onClick={onClick} aria-pressed={selected}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors ${border}`}>
      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CROP_DOT[plant.attributes.cropCategory] }} />
      <span className="text-[13px] font-medium text-ink">{plant.name}{plant.variety ? ` ${plant.variety}` : ''}</span>
      {plant.issue
        ? <span className="text-[11px] font-semibold text-seal">{plant.issue}</span>
        : plant.note && <span className="text-[11px] text-muted">{plant.note}</span>}
    </button>
  );
}

function ReservoirBar({ level }: { level: number }) {
  return (
    <div className="max-w-xs">
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Reservoir</span>
        <span className="text-[12px] font-semibold text-ink">{Math.round(level * 100)}%</span>
      </div>
      <div className="h-2 rounded-full bg-line-soft overflow-hidden">
        <div className="h-full rounded-full bg-live" style={{ width: `${level * 100}%` }} />
      </div>
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

function PlantingPanel({ bed, planting, notes, onClose }: {
  bed: { name: string; code?: string; category?: string };
  planting: Plant;
  notes: ReturnType<typeof observationsForPlant>;
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
          <div className="font-mono text-[11px] text-seal">{bed.code} · planting</div>
          <h2 className="mt-1 text-xl font-bold tracking-[-0.02em] text-ink">{planting.name}{planting.variety ? ` ${planting.variety}` : ''}</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-ink text-lg leading-none">✕</button>
      </div>

      <Hairline className="my-4" />
      <Field label="Bed">{bed.name}</Field>
      <Field label="Group">{CROP_LABEL[planting.attributes.cropCategory]}{bed.category ? ` · ${bed.category}` : ''}</Field>
      <Field label="Status"><span className={planting.issue ? 'text-seal font-medium' : 'text-ink70'}>{status}</span></Field>

      <Block label="Notes">
        {notes.length > 0
          ? <ul className="flex flex-col gap-3">{notes.map((o) => <li key={o.id} className="grid grid-cols-[40px_1fr] gap-3"><span className="font-mono text-[10.5px] text-muted">{o.date}</span><span className="text-[13px] text-ink70 leading-[1.5]">{o.text}</span></li>)}</ul>
          : <p className="text-[12.5px] text-muted leading-[1.55]">No observations yet. This is where you log what you see — what thrived, what bolted, what to change next year.</p>}
      </Block>
      <Block label="Photos">
        <p className="text-[12.5px] text-muted leading-[1.55]">Add a photo for reference — the mystery plum, a pest, a label you can’t read. (Coming with sync.)</p>
      </Block>
      <Block label="Species">
        <p className="text-[12.5px] text-muted leading-[1.55]">Care notes, season, soil-temp and pollination needs for {planting.name} will live here.</p>
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
