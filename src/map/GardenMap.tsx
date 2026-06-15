// Map host: a guided three-level drill-down (Garden → Zone → Bed). The camera
// frames the focused element; tap to go deeper, breadcrumb / Esc / empty-space to
// step out. No free zoom — navigation is discrete by design.
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { GardenTree } from '@/domain';
import { T } from '@design/tokens';
import { Mark } from '@design/primitives';
import { buildScene, fitCamera } from './scene';
import { useFramedCamera } from './useFramedCamera';
import { SvgRenderer } from './SvgRenderer';
import type { Camera, Focus, Scene, Size } from './types';

const PAD: Record<Focus['level'], number> = { garden: 0.82, zone: 0.86, bed: 0.8 };

function targetCamera(focus: Focus, scene: Scene, viewport: Size): Camera {
  const rect =
    focus.level === 'garden' ? scene.bounds
      : focus.level === 'zone' ? (scene.zones.find((z) => z.id === focus.zoneId)?.rect ?? scene.bounds)
        : (scene.beds.find((b) => b.id === focus.bedId)?.rect ?? scene.bounds);
  return fitCamera(rect, viewport, PAD[focus.level]);
}

export function GardenMap({ tree }: { tree: GardenTree }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState<Size>({ w: 0, h: 0 });
  const scene = useMemo(() => buildScene(tree), [tree]);
  const [focus, setFocus] = useState<Focus>({ level: 'garden' });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r) setViewport({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const target = useMemo(() => targetCamera(focus, scene, viewport), [focus, scene, viewport]);
  const cam = useFramedCamera(target);

  const selectZone = (zoneId: string) => setFocus({ level: 'zone', zoneId });
  const selectBed = (bedId: string) => {
    const bed = scene.beds.find((b) => b.id === bedId);
    if (bed) setFocus({ level: 'bed', zoneId: bed.zoneId, bedId });
  };
  const back = () => setFocus((f) => (f.level === 'bed' ? { level: 'zone', zoneId: f.zoneId } : { level: 'garden' }));

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && focus.level !== 'garden') { back(); e.preventDefault(); }
  };

  const zoneName = focus.level !== 'garden' ? scene.zones.find((z) => z.id === focus.zoneId)?.zone.name : undefined;
  const bedName = focus.level === 'bed' ? scene.beds.find((b) => b.id === focus.bedId)?.bed.name : undefined;
  const hint = focus.level === 'garden' ? 'Tap a zone to enter'
    : focus.level === 'zone' ? 'Tap a bed for detail · tap outside to step back'
      : 'Tap outside to step back';

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-label="Garden map. Tap a zone, then a bed, to drill in. Escape steps back out."
      className="relative w-full h-[100dvh] overflow-hidden select-none outline-none"
      style={{ background: T.bg }}
    >
      <SvgRenderer
        scene={scene} focus={focus} camera={cam} viewport={viewport}
        onSelectZone={selectZone} onSelectBed={selectBed} onBack={back}
      />

      {/* Top bar: breadcrumb + exit */}
      <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto rounded-card bg-card/90 backdrop-blur border border-line px-3 py-1.5">
          <Link to="/" className="inline-flex items-center" aria-label="Home"><Mark id="leaf" size={16} color={T.seal} sw={3} /></Link>
          <Crumb label="Garden" onClick={focus.level !== 'garden' ? () => setFocus({ level: 'garden' }) : undefined} current={focus.level === 'garden'} />
          {zoneName && (<><Sep /><Crumb label={zoneName} onClick={focus.level === 'bed' ? () => setFocus({ level: 'zone', zoneId: focus.zoneId }) : undefined} current={focus.level === 'zone'} /></>)}
          {bedName && (<><Sep /><Crumb label={bedName} current /></>)}
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          {focus.level === 'bed' && (
            <Link to={`/garden/${tree.garden.id}/bed/${focus.bedId}`}
              className="rounded-card bg-seal/95 backdrop-blur px-3 py-1.5 text-sm font-semibold text-card hover:opacity-90 transition-opacity">
              Open bed →
            </Link>
          )}
          {focus.level !== 'garden' && (
            <button type="button" onClick={back}
              className="rounded-card bg-card/90 backdrop-blur border border-line px-3 py-1.5 text-sm text-ink70 hover:border-ink70 transition-colors">
              ← Back
            </button>
          )}
        </div>
      </div>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none">
        <span className="rounded-card bg-card/80 backdrop-blur border border-line px-3 py-1.5 text-[12px] text-muted">{hint}</span>
      </div>
    </div>
  );
}

function Crumb({ label, onClick, current }: { label: string; onClick?: () => void; current?: boolean }) {
  const cls = `text-sm ${current ? 'font-semibold text-ink' : 'text-muted'}`;
  return onClick
    ? <button type="button" onClick={onClick} className={`${cls} hover:text-ink70 transition-colors`}>{label}</button>
    : <span className={cls}>{label}</span>;
}

function Sep() {
  return <span className="text-faint text-sm">›</span>;
}
