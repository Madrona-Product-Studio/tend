import { useState, useMemo } from "react";
import { Droplets, Tent, Thermometer, Gauge, Sprout, X } from "lucide-react";

/**
 * TEND — Register + Levels (inventory as a navigable level)
 * Levels: Garden -> Zone -> Bed -> Planting. Lenses: Register (here) + Map (next).
 * Notes (observations) and Tasks are cross-cutting and attach at any level.
 * Styling is placeholder — all values are CSS variables, ready to swap for the real style guide.
 */

const ZONES = [
  { id: "z1", n: "01", name: "Main Production", note: "Vigo raised beds · greenhouse · she-shed", sun: "Full sun" },
  { id: "z2", n: "02", name: "Brassicas", note: "Aluminum raised beds", sun: "Partial shade", about: "The shady side of the yard. Sun/shade is the limiting factor here — and there\u2019s no data on it yet." },
  { id: "z3", n: "03", name: "Herbs & Lettuce", note: "Patio, by the back door", sun: "Partial sun" },
  { id: "z4", n: "04", name: "Fruit & Berries", note: "Fences & edges", sun: "Varies" },
];

const SYSTEM_ICON = { irrigation: Droplets, cover: Tent, sensor: Thermometer, reservoir: Gauge, trellis: Sprout };

const BEDS = [
  { id: "b01", code: "Z1·B01", zone: "z1", name: "Wicking Bed", type: "Vigo — wicking floor + reservoir", sun: "Full sun", cat: "Brassicas & roots",
    plants: [{ n: "Brussels sprouts" }, { n: "Broccoli", issue: "bolted" }, { n: "Carrots", issue: "bolted · shallow soil" }, { n: "Beets" }, { n: "Chard", note: "transplanted" }, { n: "Fennel" }, { n: "Radishes", issue: "failed" }, { n: "Broccoli rabe" }],
    systems: [{ k: "cover", l: "Greenhouse cover (winter)" }, { k: "reservoir", l: "Water-level indicator" }, { k: "irrigation", l: "Own node — often off" }],
    tasks: ["Pull the bolted broccoli", "Top up soil depth"],
    obs: [{ d: "Jun", t: "Broccoli bolted — not enough sun while it\u2019s still cool. Recurring." }] },
  { id: "b02", code: "Z1·B02", zone: "z1", name: "Trial Bed", type: "Vigo raised — newest", sun: "Full sun", cat: "Fruiting (trial)",
    plants: [{ n: "Tomato" }, { n: "Cucumber" }, { n: "Cucumber" }], systems: [{ k: "trellis", l: "Trellis" }, { k: "irrigation", l: "Own node — in progress" }],
    tasks: ["Finish the irrigation hookup"], obs: [{ d: "Jun", t: "The former \u201ccold plunge.\u201d Fully experimental this season." }] },
  { id: "b03", code: "Z1·B03", zone: "z1", name: "Berry & Potato", type: "Vigo raised", sun: "Full sun", cat: "Mixed",
    plants: [{ n: "Strawberries", issue: "mold" }, { n: "Potatoes", note: "volunteers" }, { n: "Asparagus", note: "intended" }, { n: "Carrots", note: "volunteer" }],
    tasks: ["Add soil", "Thin the asparagus", "Treat strawberry mold"],
    obs: [{ d: "Jun", t: "Strawberries molding on the fruit. Potatoes showed up on their own and took over." }] },
  { id: "b04", code: "Z1·B04", zone: "z1", name: "Peppers & Eggplant", type: "Vigo — wicking floor", sun: "Full sun · hot", cat: "Fruiting",
    plants: [{ n: "Anaheim" }, { n: "Jalape\u00f1o" }, { n: "Cherry pepper" }, { n: "Bell pepper" }, { n: "Shishito" }, { n: "Ancho" }, { n: "Padrone" }, { n: "Eggplant", note: "Japanese / long" }, { n: "Suyo cucumber" }],
    systems: [{ k: "cover", l: "Greenhouse cover (heat)" }, { k: "sensor", l: "Govee temp / humidity" }],
    obs: [{ d: "Jun", t: "Runs hot — the smaller cover heats faster than the others." }, { d: "Note", t: "Fruiting, so it needs pollination; can\u2019t stay sealed under a closed cover." }] },
  { id: "b05", code: "Z1·B05", zone: "z1", name: "Front Tomato Bed", type: "Vigo raised — large", sun: "Full sun", cat: "Fruiting",
    plants: [{ n: "Gold Dust" }, { n: "Manana Orange" }, { n: "Hillbilly" }, { n: "Early Annie" }, { n: "Roma" }, { n: "Orange Roma" }, { n: "Moskovich", note: "Russian cultivar" }, { n: "Isichka", note: "Russian cultivar" }, { n: "Japanese Black" }, { n: "Cherry" }, { n: "Cherry" }, { n: "San Marzano", note: "uncertain" }, { n: "Peas", issue: "labels lost" }],
    obs: [{ d: "Jun 12", t: "Cover came off ~Jun 10. Plants that sat under it are clearly bigger. Clear data — repeat next year." }] },
  { id: "b06", code: "Z1·B06", zone: "z1", name: "Pea Bed", type: "Vigo raised — no wicking", sun: "Full sun", cat: "Legumes",
    plants: [{ n: "Peas", issue: "shell vs. sugar snap — unverified" }], systems: [{ k: "cover", l: "Greenhouse cover" }] },
  { id: "b07", code: "Z1·B07", zone: "z1", name: "Potato Bed", type: "Vigo raised", sun: "Full sun", cat: "Roots",
    plants: [{ n: "Potatoes" }, { n: "Fennel", note: "old" }], systems: [{ k: "irrigation", l: "Line ends here — 3 emitters" }],
    tasks: ["Add a 4th emitter"] },
  { id: "b08", code: "Z1·B08", zone: "z1", name: "She-shed Squash", type: "Raised bed", sun: "Full sun", cat: "Squash & mixed",
    plants: [{ n: "Zucchini" }, { n: "Yellow squash" }, { n: "Butternut" }, { n: "Pattypan" }, { n: "Delicata" }, { n: "Acorn" }, { n: "Winter squash" }, { n: "Pumpkins" }, { n: "Rhubarb" }, { n: "Rhubarb" }, { n: "Strawberries", note: "incl. white" }, { n: "Celery" }, { n: "Celery" }] },
  { id: "b09", code: "Z1·GH", zone: "z1", name: "Greenhouse", type: "Greenhouse structure — 8\u00d76", sun: "Warm", cat: "Fruiting",
    plants: [{ n: "Suyo cucumber" }, { n: "Sano cucumber" }, { n: "Parisian cucumber" }, { n: "Diva cucumber" }, { n: "Ancho" }, { n: "Bell pepper" }, { n: "Shishito" }, { n: "Jalape\u00f1o" }, { n: "Eggplant" }, { n: "Japanese Black tomato" }, { n: "Tiny Tim tomato" }],
    systems: [{ k: "irrigation", l: "Misting" }, { k: "sensor", l: "Govee temp / humidity" }] },
  { id: "b10", code: "Z2·B01", zone: "z2", name: "Brassica Bed A", type: "Aluminum raised", sun: "Partial shade", cat: "Brassicas & roots",
    plants: [{ n: "Broccoli rabe" }, { n: "Carrots" }, { n: "Kale", note: "several kinds" }, { n: "Onions", note: "green + regular" }, { n: "Spinach", issue: "overgrown" }, { n: "Broccoli" }, { n: "Fennel" }, { n: "Sweet potato" }, { n: "Brussels sprouts" }] },
  { id: "b11", code: "Z2·B02", zone: "z2", name: "Brassica Bed B", type: "Aluminum raised", sun: "Partial shade", cat: "Brassicas & roots",
    plants: [{ n: "Celery" }, { n: "Potatoes" }, { n: "Kale", issue: "bolted" }, { n: "Onions" }, { n: "Brussels sprouts" }],
    tasks: ["Consider a soaker hose for this zone"] },
  { id: "b12", code: "Z3·B01", zone: "z3", name: "Herb Collection", type: "Containers", sun: "Partial sun", cat: "Herbs",
    plants: [{ n: "Mint" }, { n: "Sage" }, { n: "Chives" }, { n: "Cilantro / parsley" }, { n: "Thai basil" }, { n: "Basil" }, { n: "Purple basil" }, { n: "Rosemary" }, { n: "Rosemary" }, { n: "Thyme" }, { n: "Oregano" }, { n: "Arugula" }, { n: "Kale" }, { n: "Cucumber" }] },
  { id: "b13", code: "Z3·B02", zone: "z3", name: "Lettuce Bed", type: "Vigo raised — mesh cover, no reservoir", sun: "Partial sun", cat: "Greens",
    plants: [{ n: "Romaine" }, { n: "Radicchio" }, { n: "Spiky lettuces" }], systems: [{ k: "cover", l: "Mesh / shade cover" }, { k: "irrigation", l: "Awaiting tubing (~Jul)" }],
    tasks: ["Connect irrigation", "Add a mister (anti-bolt)"],
    obs: [{ d: "Jun", t: "Birds eat the seeds without the mesh. Considering a mister to stop summer bolting." }] },
  { id: "b14", code: "Z4·B01", zone: "z4", name: "Fruit Trees", type: "In-ground / edges", sun: "Varies", cat: "Fruit & berries",
    plants: [{ n: "Plum", issue: "flowered, no fruit" }, { n: "Plum", issue: "flowered, no fruit" }, { n: "Apple", note: "young" }, { n: "Apple", note: "multi-graft: Honeycrisp / Braeburn / Fuji / Gala" }, { n: "Cherry" }, { n: "Pear" }, { n: "Fig", issue: "dead" }, { n: "Camellia", note: "ornamental" }],
    tasks: ["Prune the cherry\u2019s lower branches", "Prune / top the pear", "Decide whether the plums stay"] },
  { id: "b15", code: "Z4·B02", zone: "z4", name: "Berries", type: "In-ground / edges", sun: "Varies", cat: "Fruit & berries",
    plants: [{ n: "Blueberry", note: "2\u20133 cultivars" }, { n: "Raspberry" }, { n: "Raspberry" }, { n: "Raspberry" }, { n: "Blackberry" }, { n: "Roses", note: "ornamental" }] },
  { id: "b16", code: "Z4·B03", zone: "z4", name: "Citrus & Avocado", type: "Containers, by the patio", sun: "Full sun", cat: "Fruit & berries",
    plants: [{ n: "Avocado" }, { n: "Lime" }, { n: "Lemon" }] },
];

const SYSTEM_GROUPS = [ { k: "irrigation", label: "Irrigation" }, { k: "cover", label: "Covers" }, { k: "sensor", label: "Sensors" } ];
const bedIssues = (b) => b.plants.filter((p) => p.issue).length + (b.tasks ? b.tasks.length : 0);

export default function TendRegister() {
  const [lens, setLens] = useState("register");
  const [groupBy, setGroupBy] = useState("zone");
  const [q, setQ] = useState("");
  const [focusZone, setFocusZone] = useState(null);
  const [bedId, setBedId] = useState("b04");
  const [plantIdx, setPlantIdx] = useState(null);

  const query = q.trim().toLowerCase();
  const filtered = useMemo(() => !query ? BEDS : BEDS.filter((b) =>
    b.name.toLowerCase().includes(query) || b.type.toLowerCase().includes(query) || b.plants.some((p) => p.n.toLowerCase().includes(query))
  ), [query]);

  const groups = useMemo(() => {
    if (focusZone) {
      const z = ZONES.find((z) => z.id === focusZone);
      return [{ key: z.id, label: `Zone ${z.n} / ${z.name}`, meta: z.sun, sub: z.note, about: z.about, beds: filtered.filter((b) => b.zone === z.id) }];
    }
    if (groupBy === "zone") return ZONES.map((z) => ({ key: z.id, zone: z.id, label: `Zone ${z.n} / ${z.name}`, meta: z.sun, sub: z.note, beds: filtered.filter((b) => b.zone === z.id) })).filter((g) => g.beds.length);
    if (groupBy === "crop") { const o = []; filtered.forEach((b) => { if (!o.includes(b.cat)) o.push(b.cat); }); return o.map((c) => ({ key: c, label: c, meta: `${filtered.filter((b) => b.cat === c).length} beds`, beds: filtered.filter((b) => b.cat === c) })); }
    return SYSTEM_GROUPS.map((s) => ({ key: s.k, label: s.label, beds: filtered.filter((b) => (b.systems || []).some((x) => x.k === s.k)) })).filter((g) => g.beds.length);
  }, [focusZone, groupBy, filtered]);

  const bed = BEDS.find((b) => b.id === bedId);
  const planting = bed && plantIdx != null ? bed.plants[plantIdx] : null;
  const crumbZone = ZONES.find((z) => z.id === (focusZone || (bed ? bed.zone : null)));
  const totals = useMemo(() => ({ zones: ZONES.length, beds: BEDS.length, plantings: BEDS.reduce((a, b) => a + b.plants.length, 0), tasks: BEDS.reduce((a, b) => a + (b.tasks ? b.tasks.length : 0), 0) }), []);

  const goGarden = () => { setFocusZone(null); setBedId(null); setPlantIdx(null); };
  const goZone = (id) => { setFocusZone(id); setBedId(null); setPlantIdx(null); };
  const openBed = (id) => { setBedId(id); setPlantIdx(null); };

  return (
    <div className="reg">
      <style>{CSS}</style>

      <header className="masthead">
        <div className="brand"><span className="wordmark">Tend<span className="dot">.</span></span><span className="eyebrow">Garden Register</span></div>
        <div className="vitals">
          <Stat n={totals.zones} l="Zones" /><Stat n={totals.beds} l="Beds" /><Stat n={totals.plantings} l="Plantings" suffix="+" /><Stat n={totals.tasks} l="Open tasks" accent />
        </div>
        <p className="provenance">Auto-compiled from a spoken walkthrough · {new Date().getFullYear()} season</p>
      </header>

      <div className="lensbar">
        <div className="lenswrap" role="tablist" aria-label="View">
          <button role="tab" aria-selected={lens === "register"} className={lens === "register" ? "lens-tab on" : "lens-tab"} onClick={() => setLens("register")}>Register</button>
          <button role="tab" aria-selected={lens === "map"} className={lens === "map" ? "lens-tab on" : "lens-tab"} onClick={() => setLens("map")}>Map</button>
        </div>
        {lens === "register" && <input className="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search beds or plants" aria-label="Search" />}
      </div>

      {lens === "register" && (
        <div className="crumbbar">
          <nav className="crumbs" aria-label="Level">
            <button className={!crumbZone ? "crumb cur" : "crumb"} onClick={goGarden}>Garden</button>
            {crumbZone && <><span className="sep">›</span><button className={!bed ? "crumb cur" : "crumb"} onClick={() => goZone(crumbZone.id)}>{crumbZone.name}</button></>}
            {bed && <><span className="sep">›</span><button className={!planting ? "crumb cur" : "crumb"} onClick={() => setPlantIdx(null)}><span className="cmono">{bed.code}</span> {bed.name}</button></>}
            {planting && <><span className="sep">›</span><span className="crumb cur">{planting.n}</span></>}
          </nav>
          <div className="segmented" role="tablist" aria-label="Group by">
            {[["zone", "Zone"], ["crop", "Crop"], ["system", "System"]].map(([k, lbl]) => (
              <button key={k} role="tab" aria-selected={groupBy === k} disabled={!!focusZone} className={groupBy === k ? "seg on" : "seg"} onClick={() => { setGroupBy(k); }}>{lbl}</button>
            ))}
          </div>
        </div>
      )}

      {lens === "map" ? (
        <div className="mapph">
          <h3>Spatial view</h3>
          <p>The map is the other lens onto this same register — your garden arranged on the plot, with semantic zoom from garden to zone to bed. We build it next.</p>
        </div>
      ) : (
        <div className="body">
          <main className="index" aria-label="Bed index">
            {groups.length === 0 && <div className="empty">No plantings match that. <button className="link" onClick={() => setQ("")}>Clear the search</button> to see the full register.</div>}
            {groups.map((g) => (
              <section className="group" key={g.key}>
                <div className="group-head">
                  <h2>{g.label}</h2>
                  {g.meta && <span className="group-meta">{g.meta}</span>}
                  {g.sub && <span className="group-sub">{g.sub}</span>}
                  {!focusZone && g.zone && <button className="focus-z" onClick={() => goZone(g.zone)}>View zone →</button>}
                </div>
                {g.about && <p className="znote">{g.about}</p>}
                <ul className="rows">
                  {g.beds.map((b) => {
                    const issues = bedIssues(b); const on = b.id === bedId;
                    return (
                      <li key={b.id}>
                        <button className={on ? "row on" : "row"} onClick={() => openBed(b.id)} aria-pressed={on}>
                          <span className="code">{b.code}</span>
                          <span className="name">{b.name}<span className="type">{b.type}</span></span>
                          <span className="tally" aria-hidden="true">{b.plants.slice(0, 14).map((p, i) => <i key={i} className={p.issue ? "tick bad" : "tick"} />)}{b.plants.length > 14 && <span className="more">+{b.plants.length - 14}</span>}</span>
                          <span className="count">{b.plants.length}</span>
                          {issues > 0 && <span className="flag">{issues}</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </main>

          {bed && (
            <>
              <div className="scrim" onClick={() => { setBedId(null); setPlantIdx(null); }} />
              <aside className="detail" aria-label={`${bed.name} detail`}>
                <button className="close" onClick={() => { setBedId(null); setPlantIdx(null); }} aria-label="Close"><X size={16} /></button>

                {!planting ? (
                  <>
                    <div className="d-code">{bed.code}</div>
                    <h3 className="d-name">{bed.name}</h3>
                    <div className="d-grid">
                      <Field label="Type">{bed.type}</Field>
                      <Field label="Exposure">{bed.sun}</Field>
                      <Field label="Group">{bed.cat}</Field>
                    </div>

                    <Block label={`Plantings · ${bed.plants.length}`}>
                      <ul className="plants">
                        {bed.plants.map((p, i) => (
                          <li key={i}>
                            <button className={p.issue ? "plant bad" : "plant"} onClick={() => setPlantIdx(i)}>
                              <span className="p-name">{p.n}</span>
                              {p.note && <span className="p-note">{p.note}</span>}
                              {p.issue && <span className="p-issue">{p.issue}</span>}
                              <span className="p-go" aria-hidden="true">›</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </Block>

                    {bed.systems && <Block label="Systems"><ul className="systems">{bed.systems.map((s, i) => { const I = SYSTEM_ICON[s.k] || Sprout; return <li key={i}><I size={13} strokeWidth={1.75} /><span>{s.l}</span></li>; })}</ul></Block>}
                    {bed.tasks && <Block label={`Tasks · ${bed.tasks.length}`}><ul className="tasks">{bed.tasks.map((t, i) => <li key={i}>{t}</li>)}</ul></Block>}
                    <Block label="Notes">
                      {bed.obs ? <ul className="notes-log">{bed.obs.map((o, i) => <li key={i}><span className="nl-d">{o.d}</span><span className="nl-t">{o.t}</span></li>)}</ul>
                        : <p className="note-empty">No observations yet. This is where you log what you see — what thrived, what bolted, what to change next year.</p>}
                    </Block>
                  </>
                ) : (
                  <>
                    <button className="back" onClick={() => setPlantIdx(null)}>← {bed.name}</button>
                    <div className="d-code">{bed.code} · planting</div>
                    <h3 className="d-name">{planting.n}</h3>
                    <div className="d-grid">
                      <Field label="Bed">{bed.name}</Field>
                      <Field label="Group">{bed.cat}</Field>
                      <Field label="Status">{planting.issue ? <span className="stat-bad">{planting.issue}</span> : (planting.note || "Healthy")}</Field>
                    </div>
                    <Block label="Observations">
                      <p className="note-empty">No observations logged for this planting yet. This is the deepest level — where each season\u2019s notes and year-over-year performance for {planting.n} will live.</p>
                    </Block>
                    <Block label="History">
                      <p className="note-empty">Seasons tracked: 1 (current). Future seasons stack here to show how {planting.n} performs over time.</p>
                    </Block>
                  </>
                )}
              </aside>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ n, l, suffix = "", accent }) { return <div className="stat"><span className={accent ? "stat-n accent" : "stat-n"}>{n}{suffix}</span><span className="stat-l">{l}</span></div>; }
function Field({ label, children }) { return <div className="field"><span className="f-label">{label}</span><span className="f-val">{children}</span></div>; }
function Block({ label, children }) { return <div className="block"><div className="b-label">{label}</div>{children}</div>; }

const CSS = `
:root{ --ink:#16170F; --paper:#FAFAF7; --panel:#EFEFE9; --line:#16170F1f; --muted:#6E6E63; --accent:#D8391F;
  --sans:"Helvetica Neue",Helvetica,Arial,sans-serif; --mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace; }
*{box-sizing:border-box}
.reg{font-family:var(--sans);color:var(--ink);background:var(--paper);-webkit-font-smoothing:antialiased;line-height:1.4;min-height:100%;padding:28px;max-width:1180px;margin:0 auto}
.reg h2,.reg h3{margin:0;font-weight:700}
.masthead{display:grid;grid-template-columns:1fr auto;align-items:end;gap:12px 24px;padding-bottom:16px;border-bottom:2px solid var(--ink)}
.brand{display:flex;align-items:baseline;gap:16px;flex-wrap:wrap}
.wordmark{font-size:clamp(34px,6vw,60px);font-weight:800;letter-spacing:-.03em;line-height:.9}
.dot{color:var(--accent)}
.eyebrow{font-size:11px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--muted)}
.vitals{display:flex;gap:26px;align-self:end}
.stat{display:flex;flex-direction:column;align-items:flex-end;line-height:1}
.stat-n{font-size:26px;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
.stat-n.accent{color:var(--accent)}
.stat-l{font-size:9.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-top:5px}
.provenance{grid-column:1/-1;margin:0;font-size:11px;letter-spacing:.04em;color:var(--muted)}
.lensbar{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;border-bottom:1px solid var(--line);margin-top:6px}
.lenswrap{display:inline-flex}
.lens-tab{font-family:var(--sans);font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:12px 2px;margin-right:24px;background:0;border:0;border-bottom:2px solid transparent;color:var(--muted);cursor:pointer;margin-bottom:-1px}
.lens-tab:hover{color:var(--ink)}
.lens-tab.on{color:var(--ink);border-bottom-color:var(--accent)}
.search{font-family:var(--sans);font-size:13px;padding:7px 12px;border:1px solid var(--line);background:transparent;width:230px;max-width:46vw;color:var(--ink);margin-bottom:8px}
.search::placeholder{color:var(--muted)}
.search:focus-visible{outline:2px solid var(--accent);outline-offset:1px;border-color:var(--ink)}
.crumbbar{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:14px 0;flex-wrap:wrap}
.crumbs{display:flex;align-items:center;gap:9px;flex-wrap:wrap;font-size:13px}
.crumb{background:0;border:0;font:inherit;color:var(--muted);cursor:pointer;padding:2px 0;letter-spacing:.01em}
.crumb:hover{color:var(--ink)}
.crumb.cur{color:var(--ink);font-weight:600}
.cmono{font-family:var(--mono);font-size:11px}
.sep{color:var(--muted);opacity:.6}
.segmented{display:inline-flex;border:1px solid var(--ink)}
.seg{font-family:var(--sans);font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;padding:7px 14px;background:transparent;border:0;border-right:1px solid var(--ink);color:var(--ink);cursor:pointer;transition:background-color .12s}
.seg:last-child{border-right:0}
.seg:hover:not(:disabled){background:var(--panel)}
.seg.on{background:var(--ink);color:var(--paper)}
.seg:disabled{opacity:.35;cursor:not-allowed}
.mapph{border:1px solid var(--line);background:var(--panel);padding:54px 24px;text-align:center;margin-top:22px}
.mapph h3{font-size:13px;letter-spacing:.16em;text-transform:uppercase}
.mapph p{max-width:46ch;margin:12px auto 0;font-size:13px;line-height:1.55;color:var(--muted)}
.body{display:grid;grid-template-columns:1fr 348px;gap:0;align-items:start}
.index{min-width:0;border-top:1px solid var(--line)}
.group{padding-top:18px}
.group-head{display:flex;align-items:baseline;gap:14px;padding:0 0 8px;flex-wrap:wrap}
.group-head h2{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}
.group-meta{font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--accent)}
.group-sub{font-size:11px;color:var(--muted)}
.focus-z{margin-left:auto;background:0;border:0;font:inherit;font-size:11px;font-weight:600;letter-spacing:.04em;color:var(--muted);cursor:pointer}
.focus-z:hover{color:var(--accent)}
.znote{margin:2px 0 6px;font-size:12.5px;line-height:1.5;color:var(--muted);max-width:64ch}
.rows{list-style:none;margin:0;padding:0}
.row{width:100%;display:grid;grid-template-columns:78px 1fr auto 30px 26px;align-items:center;gap:14px;padding:11px 8px 11px 0;background:transparent;border:0;border-top:1px solid var(--line);text-align:left;cursor:pointer;color:var(--ink);transition:background-color .12s;position:relative}
.row:hover{background:var(--panel)}
.row.on{background:var(--panel)}
.row.on::before{content:"";position:absolute;left:-8px;top:-1px;bottom:0;width:4px;background:var(--accent)}
.code{font-family:var(--mono);font-size:11px;color:var(--muted)}
.row.on .code{color:var(--accent)}
.name{font-size:15px;font-weight:600;display:flex;flex-direction:column;gap:2px;min-width:0}
.type{font-size:11px;font-weight:400;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tally{display:flex;align-items:center;gap:3px}
.tick{width:6px;height:6px;background:var(--ink);opacity:.78}
.tick.bad{background:var(--accent);opacity:1}
.more{font-family:var(--mono);font-size:10px;color:var(--muted);margin-left:2px}
.count{font-family:var(--mono);font-size:13px;font-variant-numeric:tabular-nums;text-align:right}
.flag{justify-self:end;min-width:20px;height:20px;padding:0 5px;display:inline-flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:11px;color:var(--paper);background:var(--accent)}
.scrim{display:none}
.detail{position:sticky;top:28px;border:1px solid var(--ink);padding:22px 20px 26px;margin-top:18px;background:var(--paper)}
.close{position:absolute;top:12px;right:12px;border:0;background:transparent;cursor:pointer;color:var(--muted);padding:4px;display:none}
.close:hover{color:var(--ink)}
.back{background:0;border:0;font:inherit;font-size:12px;color:var(--accent);cursor:pointer;padding:0 0 12px}
.d-code{font-family:var(--mono);font-size:11px;letter-spacing:.06em;color:var(--accent)}
.d-name{font-size:24px;font-weight:800;letter-spacing:-.02em;margin:4px 0 16px;padding-bottom:14px;border-bottom:2px solid var(--ink)}
.d-grid{display:flex;flex-direction:column;gap:10px;margin-bottom:4px}
.field{display:grid;grid-template-columns:84px 1fr;gap:10px;align-items:baseline}
.f-label{font-size:9.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
.f-val{font-size:13px}
.stat-bad{color:var(--accent)}
.block{margin-top:16px;padding-top:14px;border-top:1px solid var(--line)}
.b-label{font-size:9.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--ink);margin-bottom:10px}
.plants{list-style:none;margin:0;padding:0}
.plant{width:100%;display:flex;align-items:baseline;gap:8px;padding:7px 0;border:0;border-bottom:1px dotted var(--line);background:0;cursor:pointer;text-align:left;font:inherit;color:var(--ink)}
.plant:hover .p-name{color:var(--accent)}
.p-name{font-weight:500;font-size:13px}
.p-note{font-size:11px;color:var(--muted)}
.p-issue{margin-left:auto;font-size:10px;font-weight:600;color:var(--accent)}
.p-go{margin-left:auto;color:var(--muted);font-size:14px}
.plant .p-issue + .p-go{margin-left:8px}
.plant.bad .p-name{color:var(--accent)}
.systems{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:9px}
.systems li{display:flex;align-items:center;gap:9px;font-size:12.5px}
.systems svg{color:var(--ink);flex:none}
.tasks{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:7px}
.tasks li{font-size:13px;padding-left:16px;position:relative}
.tasks li::before{content:"";position:absolute;left:0;top:6px;width:7px;height:7px;border:1px solid var(--ink)}
.notes-log{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:11px}
.notes-log li{display:grid;grid-template-columns:40px 1fr;gap:10px}
.nl-d{font-family:var(--mono);font-size:10.5px;color:var(--muted);padding-top:1px}
.nl-t{font-size:12.5px;line-height:1.5}
.note-empty{font-size:12.5px;color:var(--muted);line-height:1.55;margin:0}
.empty{padding:40px 0;color:var(--muted);font-size:14px;border-top:1px solid var(--line)}
.link{border:0;background:0;color:var(--accent);font:inherit;cursor:pointer;text-decoration:underline;padding:0}
@media (max-width:900px){
  .reg{padding:18px}
  .masthead{grid-template-columns:1fr}
  .vitals{justify-content:flex-start;gap:20px;flex-wrap:wrap}
  .stat{align-items:flex-start}
  .body{grid-template-columns:1fr}
  .row{grid-template-columns:64px 1fr 30px 24px}
  .tally{display:none}
  .scrim{display:block;position:fixed;inset:0;background:#16170F66;z-index:40}
  .detail{position:fixed;left:0;right:0;bottom:0;top:auto;max-height:86vh;overflow:auto;z-index:50;margin:0;border:0;border-top:3px solid var(--ink);animation:sheet .22s ease}
  .close{display:block}
}
@keyframes sheet{from{transform:translateY(100%)}to{transform:translateY(0)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;
