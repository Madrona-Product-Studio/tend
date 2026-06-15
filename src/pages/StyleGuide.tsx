import { Link } from 'react-router-dom';
import { Label, VLabel, Seal, Marker, Mark, Breath, Hairline, FactsList, type MarkId } from '@design/primitives';
import { T } from '@design/tokens';

const COLORS: { name: string; token: string; value: string; ring?: boolean }[] = [
  { name: 'card', token: 'bg-card', value: T.card, ring: true },
  { name: 'paper', token: 'bg-paper', value: T.paper, ring: true },
  { name: 'bg', token: 'bg-bg', value: T.bg, ring: true },
  { name: 'ink', token: 'text-ink', value: T.ink },
  { name: 'ink70', token: 'text-ink70', value: T.ink70 },
  { name: 'clay', token: 'text-clay', value: T.clay },
  { name: 'muted', token: 'text-muted', value: T.muted },
  { name: 'faint', token: 'text-faint', value: T.faint },
  { name: 'seal', token: 'bg-seal', value: T.seal },
  { name: 'live', token: 'bg-live', value: T.live },
];

const MARKS: MarkId[] = ['leaf', 'enso', 'ring', 'dot', 'ripple', 'stroke', 'arc', 'crescent', 'mountain', 'lotus'];

function Section({ index, title, breath, children }: {
  index: string; title: string; breath?: string; children: React.ReactNode;
}) {
  return (
    <section className="mb-14">
      <div className="mb-6"><Marker index={index} total="06" /></div>
      <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.025em] text-ink">{title}</h2>
      {breath && <Breath className="mt-3 max-w-xl">{breath}</Breath>}
      <Hairline className="mt-6 mb-8" />
      {children}
    </section>
  );
}

export default function StyleGuide() {
  return (
    <>
      <title>Style guide · Tend</title>
      <meta name="robots" content="noindex" />

      <main className="min-h-screen max-w-4xl mx-auto px-6 py-12 sm:px-12 sm:py-16">
        <header className="mb-14">
          <Link to="/" className="text-sm text-muted hover:text-ink70 transition-colors">← Tend</Link>
          <div className="mt-6 flex items-center gap-4">
            <Mark id="leaf" size={40} color={T.seal} />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-ink leading-none">swiss / zen</h1>
              <p className="mt-1.5 text-sm text-muted">Tend's living component library — consume it, grow it, promote wins back.</p>
            </div>
          </div>
        </header>

        <Section index="01" title="Color" breath="Warm paper grounds, a layered ink scale, and restraint: one true accent (seal) plus one live indicator.">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {COLORS.map((c) => (
              <div key={c.name}>
                <div
                  className={`h-16 rounded-card ${c.ring ? 'border border-line' : ''}`}
                  style={{ background: c.value }}
                />
                <div className="mt-2 text-[13px] font-semibold text-ink">{c.name}</div>
                <div className="text-[11px] text-muted font-mono">{c.value}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section index="02" title="Type" breath="Inter, one family. Tight display headings, calm body, tracked uppercase micro-labels.">
          <div className="space-y-3">
            <div className="text-5xl font-bold tracking-[-0.035em] text-ink leading-none">Display 48</div>
            <div className="text-3xl font-bold tracking-[-0.025em] text-ink">Heading 30</div>
            <div className="text-xl font-semibold text-ink">Subhead 20</div>
            <p className="text-[15px] leading-[1.6] text-ink70 max-w-xl">Body 15 — the workhorse. Generous line height, comfortable measure, no decorative noise.</p>
            <Label>Micro-label 11</Label>
          </div>
        </Section>

        <Section index="03" title="Marks" breath="Calm abstract glyphs. Leaf is Tend's recurring marker; the family carries section signatures and live-state accents.">
          <div className="flex flex-wrap gap-6">
            {MARKS.map((m) => (
              <div key={m} className="flex flex-col items-center gap-2">
                <Mark id={m} size={40} color={T.ink} />
                <span className="text-[11px] text-muted">{m}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section index="04" title="Primitives" breath="The quiet building blocks — labels, seals, the section marker, the breath line.">
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex flex-col items-start gap-2"><Label>Label</Label><span className="text-[11px] text-faint">Label</span></div>
            <div className="flex flex-col items-center gap-2"><div className="h-16"><VLabel>Vertical</VLabel></div><span className="text-[11px] text-faint">VLabel</span></div>
            <div className="flex flex-col items-center gap-2"><Seal label="03" /><span className="text-[11px] text-faint">Seal</span></div>
            <div className="flex flex-col items-center gap-2"><Marker index="03" total="06" /><span className="text-[11px] text-faint">Marker</span></div>
          </div>
        </Section>

        <Section index="05" title="FactsList" breath="Key/value rows bounded by hairlines — bed specs, plant attributes, irrigation facts.">
          <div className="max-w-sm">
            <FactsList
              heading="Bed 4 — peppers + eggplant"
              facts={[
                { label: 'Type', value: 'Vigo wicking + reservoir' },
                { label: 'Cover', value: 'Heat / greenhouse' },
                { label: 'Sensor', value: 'Govee · temp + humidity' },
                { label: 'Irrigation', value: '3 emitters · on' },
              ]}
            />
          </div>
        </Section>

        <Section index="06" title="Live state (preview)" breath="The swiss/zen NowStrip pattern returns here as Tend's spatial-dashboard widget — reservoir level, greenhouse temp, irrigation on/off.">
          <div className="rounded-card bg-card border border-line p-5 max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-live" />
              <Label className="text-ink">Greenhouse · right now</Label>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {[['Temp', '78°F'], ['Humidity', '64%'], ['Reservoir', '72%'], ['Misters', 'On']].map(([k, v]) => (
                <div key={k}>
                  <div className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-muted">{k}</div>
                  <div className="text-[15px] font-semibold text-ink mt-0.5">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <p className="text-[13px] text-faint">
          Source of truth: <span className="font-mono">design/swiss-style-guide.md</span>. Tokens in <span className="font-mono">styles/global.css</span> + <span className="font-mono">design/tokens.ts</span>.
        </p>
      </main>
    </>
  );
}
