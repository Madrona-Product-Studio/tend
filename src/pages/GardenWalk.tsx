// "Garden walk" — the shortcut onboarding. Paste a transcript of talking through
// your garden; we draft the whole structure (zones, beds, plantings, systems,
// tasks), you review it, and it becomes a real local garden. No account.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Label, Breath, Mark, BetaChip } from '@design/primitives';
import { T } from '@design/tokens';
import { insertGarden, insertGardenContents } from '@/data/repo';
import { contentsFromDraft, type WalkDraft } from '@/data/gardenFromWalk';
import type { Garden } from '@/domain';

type Stage = 'input' | 'parsing' | 'review';

export default function GardenWalk() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>('input');
  const [transcript, setTranscript] = useState('');
  const [draft, setDraft] = useState<WalkDraft | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [building, setBuilding] = useState(false);

  const parse = async () => {
    if (!transcript.trim() || stage === 'parsing') return;
    setStage('parsing');
    setError(null);
    try {
      const res = await fetch('/api/parse-walk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcript.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not read the walkthrough.');
      const d = data.draft as WalkDraft;
      setDraft(d);
      setName(d.gardenName?.trim() || '');
      setStage('review');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setStage('input');
    }
  };

  const build = async () => {
    if (!draft || building) return;
    setBuilding(true);
    const now = Date.now();
    const garden: Garden = {
      id: crypto.randomUUID(),
      name: name.trim() || draft.gardenName?.trim() || 'My garden',
      createdAt: now, updatedAt: now,
    };
    await insertGarden(garden);
    await insertGardenContents(contentsFromDraft(garden.id, draft));
    navigate(`/garden/${garden.id}`);
  };

  return (
    <>
      <title>Garden walk · GardenHQ</title>
      <meta name="robots" content="noindex" />
      <main className="min-h-screen max-w-3xl mx-auto px-6 py-10 sm:px-10">
        <nav className="flex items-center gap-2 text-sm">
          <Link to="/" aria-label="Home" className="inline-flex items-center shrink-0"><Mark id="sprout" size={16} color={T.seal} sw={3} /></Link>
          <span className="text-faint">›</span>
          <span className="text-muted">Garden walk</span>
        </nav>

        <div className="mt-6">
          <div className="flex items-center gap-2">
            <Label className="text-clay">Garden walk</Label>
            <BetaChip />
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-[-0.03em] leading-[1.05] text-ink">
            Talk through your garden. We&rsquo;ll draw the map.
          </h1>
          <p className="mt-2 text-[12.5px] leading-[1.5] text-muted">
            A beta feature: it captures your beds and plantings, and it may miss or misread things. You review the draft before anything is built.
          </p>
        </div>

        {stage === 'review' && draft ? (
          <Review draft={draft} name={name} onName={setName} building={building}
            onBuild={build} onRestart={() => { setStage('input'); setDraft(null); }} />
        ) : (
          <div className="mt-6">
            <Breath className="max-w-2xl">
              Open your phone&rsquo;s voice memo app, walk your garden, and talk through it:
              name each area, each bed, and what&rsquo;s planted where. Mention the systems
              (a wicking reservoir, a drip line, a cover, a sensor) and anything on your
              to-do list. Then paste the transcript here.
            </Breath>

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              disabled={stage === 'parsing'}
              rows={12}
              placeholder="e.g. Okay, so over on the left I've got my main wicking bed. There's brussels sprouts, broccoli that bolted, some carrots that came up shallow, beets, and chard I transplanted. Next to it is the trial bed with tomatoes and a couple cucumbers on a trellis. Then the greenhouse has peppers and cucumbers, it's got a temp sensor in there. I still need to run the drip line to the pea bed..."
              className="mt-6 w-full rounded-card border border-line bg-card focus:border-ink px-4 py-3 text-[14px] leading-[1.6] text-ink outline-none resize-y"
            />

            {error && <p className="mt-3 text-[13px] text-seal">{error}</p>}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button type="button" onClick={parse} disabled={!transcript.trim() || stage === 'parsing'}
                className="cta-seal inline-flex min-h-[48px] items-center rounded-card bg-seal px-7 text-sm font-semibold text-card hover:opacity-90 disabled:opacity-40">
                {stage === 'parsing' ? 'Drafting your garden…' : 'Draft my garden'}
              </button>
              <Link to="/" className="text-[13px] font-semibold text-clay hover:text-ink transition-colors">Cancel</Link>
            </div>

            <p className="mt-6 text-[12px] leading-[1.6] text-muted">
              Your transcript is sent once to draft the structure, then the garden lives in
              this browser. A walk captures your beds and plantings; you place them on the map after.
            </p>
          </div>
        )}
      </main>
    </>
  );
}

function Review({ draft, name, onName, building, onBuild, onRestart }: {
  draft: WalkDraft; name: string; onName: (v: string) => void;
  building: boolean; onBuild: () => void; onRestart: () => void;
}) {
  const bedCount = draft.zones.reduce((n, z) => n + z.beds.length, 0);
  const plantCount = draft.zones.reduce((n, z) => n + z.beds.reduce((m, b) => m + b.plants.length, 0), 0);

  return (
    <div className="mt-6">
      <Breath className="max-w-2xl">
        Here&rsquo;s what we heard. Build it, then rename, rearrange, or fix anything on the map.
      </Breath>

      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-clay">
        <span><strong className="text-ink font-semibold">{draft.zones.length}</strong> zones</span>
        <span><strong className="text-ink font-semibold">{bedCount}</strong> beds</span>
        <span><strong className="text-ink font-semibold">{plantCount}</strong> plantings</span>
        {draft.tasks.length > 0 && <span><strong className="text-ink font-semibold">{draft.tasks.length}</strong> tasks</span>}
      </div>

      <div className="mt-6 flex flex-col gap-5">
        {draft.zones.map((z, zi) => (
          <div key={zi} className="rounded-card border border-line bg-card p-4">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-[15px] font-semibold text-ink">{z.name}</h3>
              <span className="text-[11px] text-muted shrink-0">{z.beds.length} bed{z.beds.length === 1 ? '' : 's'}</span>
            </div>
            <div className="mt-3 flex flex-col gap-2.5">
              {z.beds.map((b, bi) => {
                const systems = [
                  b.hasReservoir && 'reservoir', b.irrigation, b.cover && `${b.cover} cover`, b.hasSensor && 'sensor',
                ].filter(Boolean) as string[];
                return (
                  <div key={bi} className="border-t border-line-soft pt-2.5 first:border-t-0 first:pt-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-[13px] font-semibold text-ink">{b.name}</span>
                      {b.typeDetail && <span className="text-[11px] text-muted">{b.typeDetail}</span>}
                      {systems.length > 0 && <span className="text-[10.5px] text-live">{systems.join(' · ')}</span>}
                    </div>
                    {b.plants.length > 0 && (
                      <p className="mt-1 text-[12.5px] leading-[1.5] text-ink70">
                        {b.plants.map((p) => (p.variety ? `${p.name} ${p.variety}` : p.name) + (p.issue ? ` (${p.issue})` : '')).join(' · ')}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {draft.tasks.length > 0 && (
        <div className="mt-5 rounded-card border border-line bg-paper p-4">
          <Label className="text-clay">Punch-list</Label>
          <ul className="mt-2 flex flex-col gap-1">
            {draft.tasks.map((t, i) => (
              <li key={i} className="text-[13px] text-ink70">{t.text}{t.bed ? <span className="text-muted"> · {t.bed}</span> : null}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-7 pt-5 border-t border-line flex flex-col sm:flex-row sm:items-end gap-3">
        <label className="flex-1">
          <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-muted">Garden name</span>
          <input value={name} onChange={(e) => onName(e.target.value)} placeholder="Home garden"
            className="mt-1 w-full rounded-card border border-line focus:border-ink px-3 py-2 text-[14px] text-ink outline-none" />
        </label>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onRestart} className="text-[13px] font-semibold text-clay hover:text-ink transition-colors">Start over</button>
          <button type="button" onClick={onBuild} disabled={building}
            className="cta-seal inline-flex min-h-[48px] items-center rounded-card bg-seal px-7 text-sm font-semibold text-card hover:opacity-90 disabled:opacity-40">
            {building ? 'Building…' : 'Build this garden'}
          </button>
        </div>
      </div>
    </div>
  );
}
