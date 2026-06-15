// Map host: owns scene state, measures the viewport, drives the camera, and
// renders a concrete renderer inside the camera transform. Overlay controls live
// in the DOM (accessible), never inside the SVG. The renderer is swappable here —
// change one import to evaluate a different candidate.
import { animated, to } from '@react-spring/web';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { GardenTree } from '@/domain';
import { setBedPosition } from '@/data/repo';
import { T } from '@design/tokens';
import { Mark } from '@design/primitives';
import { buildScene } from './scene';
import { useMapCamera } from './useMapCamera';
import { SvgRenderer } from './SvgRenderer';
import { LOD_LABEL } from './lod';
import type { Scene, Size } from './types';

export function GardenMap({ tree }: { tree: GardenTree }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState<Size>({ w: 0, h: 0 });
  const [scene, setScene] = useState<Scene>(() => buildScene(tree));
  const sceneRef = useRef(scene);
  useEffect(() => { sceneRef.current = scene; }, [scene]);

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

  const { x, y, s, lod, fit, zoomIn, zoomOut, panBy, getScale } = useMapCamera({
    containerRef, bounds: scene.bounds, viewport,
  });

  const moveBed = (bedId: string, dx: number, dy: number) =>
    setScene((prev) => ({
      ...prev,
      beds: prev.beds.map((b) =>
        b.id === bedId ? { ...b, rect: { ...b.rect, x: b.rect.x + dx, y: b.rect.y + dy } } : b),
    }));

  const commitBed = (bedId: string) => {
    const b = sceneRef.current.beds.find((bn) => bn.id === bedId);
    if (b) void setBedPosition(bedId, { x: b.rect.x, y: b.rect.y });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const STEP = 64;
    switch (e.key) {
      case 'ArrowLeft': panBy(STEP, 0); break;
      case 'ArrowRight': panBy(-STEP, 0); break;
      case 'ArrowUp': panBy(0, STEP); break;
      case 'ArrowDown': panBy(0, -STEP); break;
      case '+': case '=': zoomIn(); break;
      case '-': case '_': zoomOut(); break;
      case 'f': case '0': fit(); break;
      default: return;
    }
    e.preventDefault();
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-label="Garden map. Drag to pan, scroll or pinch to zoom, arrow keys to move, plus and minus to zoom."
      className="relative w-full h-[100dvh] overflow-hidden touch-none select-none outline-none"
      style={{ background: T.bg, cursor: 'grab' }}
    >
      <svg width={viewport.w} height={viewport.h} className="block">
        <animated.g transform={to([x, y, s], (px, py, ps) => `translate(${px} ${py}) scale(${ps})`)}>
          <SvgRenderer scene={scene} lod={lod} onMoveBed={moveBed} onCommitBed={commitBed} getScale={getScale} />
        </animated.g>
      </svg>

      {/* Top bar — DOM overlay */}
      <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <Link to="/" className="rounded-card bg-card/90 backdrop-blur border border-line px-3 py-1.5 text-sm text-ink70 hover:border-ink70 transition-colors inline-flex items-center gap-2">
            <Mark id="leaf" size={16} color={T.seal} sw={3} /> Tend
          </Link>
          <span className="rounded-card bg-card/90 backdrop-blur border border-line px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-clay">
            {LOD_LABEL[lod]}
          </span>
        </div>
        <Link to="/garden/demo" className="pointer-events-auto rounded-card bg-card/90 backdrop-blur border border-line px-3 py-1.5 text-sm text-ink70 hover:border-ink70 transition-colors">
          Details
        </Link>
      </div>

      {/* Zoom controls — DOM overlay */}
      <div className="absolute bottom-5 right-5 flex flex-col gap-1.5">
        <CtrlButton label="Zoom in" onClick={zoomIn}>+</CtrlButton>
        <CtrlButton label="Zoom out" onClick={zoomOut}>−</CtrlButton>
        <CtrlButton label="Fit to view" onClick={fit}>⤢</CtrlButton>
      </div>

      <div className="absolute bottom-5 left-5 pointer-events-none">
        <span className="rounded-card bg-card/80 backdrop-blur border border-line px-3 py-1.5 text-[12px] text-muted">
          Drag a bed to place it · scroll/pinch to zoom
        </span>
      </div>
    </div>
  );
}

function CtrlButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="w-10 h-10 rounded-card bg-card/90 backdrop-blur border border-line text-ink text-lg leading-none hover:border-ink70 transition-colors flex items-center justify-center"
    >
      {children}
    </button>
  );
}
