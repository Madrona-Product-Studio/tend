// The camera: wires @use-gesture input to a @react-spring transform, with
// zoom-to-cursor, clamping, and level-of-detail. Renderer-independent — it emits
// a plain-number camera (x, y, s) + an LOD that any renderer (SVG, Canvas) can
// consume. This "feel" is the hero.
import { useSpring } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { SCALE_MAX, SCALE_MIN, lodForScale } from './lod';
import { clamp, fitCamera } from './scene';
import type { Camera, Lod, Point, Rect, Size } from './types';

interface PinchMemo { dist0: number; s0: number; x0: number; y0: number; cx: number; cy: number }

interface Args {
  containerRef: RefObject<HTMLDivElement | null>;
  bounds: Rect;
  viewport: Size;
  isBedDragging: RefObject<boolean>;
}

export function useMapCamera({ containerRef, bounds, viewport, isBedDragging }: Args) {
  const [{ x, y, s }, api] = useSpring(() => ({
    x: 0, y: 0, s: 1, config: { tension: 280, friction: 32 },
  }));

  // Mirror the (animated) spring into plain React state once per frame so any
  // renderer can consume numbers. setState only fires when a value changes.
  const [cam, setCam] = useState<Camera>({ x: 0, y: 0, s: 1 });
  const [lod, setLod] = useState<Lod>('garden');
  const lodRef = useRef<Lod>('garden');
  useEffect(() => {
    let raf = 0;
    let prev = { x: NaN, y: NaN, s: NaN };
    const tick = () => {
      const nx = x.get(), ny = y.get(), ns = s.get();
      if (nx !== prev.x || ny !== prev.y || ns !== prev.s) {
        prev = { x: nx, y: ny, s: ns };
        setCam(prev);
        const nextLod = lodForScale(ns);
        if (nextLod !== lodRef.current) { lodRef.current = nextLod; setLod(nextLod); }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [x, y, s]);

  const zoomAt = useCallback((factor: number, center: Point) => {
    const cur = s.get();
    const next = clamp(cur * factor, SCALE_MIN, SCALE_MAX);
    const k = next / cur;
    api.start({ s: next, x: center.x - (center.x - x.get()) * k, y: center.y - (center.y - y.get()) * k });
  }, [api, s, x, y]);

  const fit = useCallback(() => { api.start(fitCamera(bounds, viewport)); }, [api, bounds, viewport]);

  const didFit = useRef(false);
  useEffect(() => {
    if (!didFit.current && viewport.w > 0 && bounds.w > 0) { didFit.current = true; fit(); }
  }, [viewport, bounds, fit]);

  useGesture(
    {
      onDrag: ({ delta: [dx, dy], pinching, cancel }) => {
        if (pinching) { cancel(); return; }
        if (isBedDragging.current) return; // a bed is being placed
        api.start({ x: x.get() + dx, y: y.get() + dy, immediate: true });
      },
      onPinch: ({ origin: [ox, oy], da: [dist], memo, first }) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return memo;
        const m: PinchMemo = first || !memo
          ? { dist0: dist || 1, s0: s.get(), x0: x.get(), y0: y.get(), cx: ox - rect.left, cy: oy - rect.top }
          : (memo as PinchMemo);
        if (first) return m;
        const next = clamp((dist / m.dist0) * m.s0, SCALE_MIN, SCALE_MAX);
        const k = next / m.s0;
        api.start({ s: next, x: m.cx - (m.cx - m.x0) * k, y: m.cy - (m.cy - m.y0) * k, immediate: true });
        return m;
      },
      onWheel: ({ event }) => {
        event.preventDefault();
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const center = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        if (event.ctrlKey) zoomAt(Math.exp(-event.deltaY * 0.0025), center); // trackpad pinch / ctrl+wheel
        else api.start({ x: x.get(), y: y.get() - event.deltaY, immediate: true }); // scroll = pan
      },
    },
    { target: containerRef, eventOptions: { passive: false } },
  );

  const panBy = useCallback((dx: number, dy: number) => {
    api.start({ x: x.get() + dx, y: y.get() + dy });
  }, [api, x, y]);

  const center = (): Point => ({ x: viewport.w / 2, y: viewport.h / 2 });
  const zoomIn = useCallback(() => zoomAt(1.45, center()), [zoomAt, viewport]); // eslint-disable-line react-hooks/exhaustive-deps
  const zoomOut = useCallback(() => zoomAt(1 / 1.45, center()), [zoomAt, viewport]); // eslint-disable-line react-hooks/exhaustive-deps

  return { cam, lod, fit, zoomIn, zoomOut, panBy };
}
