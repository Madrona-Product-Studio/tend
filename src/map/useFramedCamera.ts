// Animate the camera to a target framing. Navigation is discrete (Garden → Zone
// → Bed), so the camera is driven by the current focus's fit, not by gestures.
// The spring eases between framings; a per-frame mirror exposes plain numbers
// any renderer can consume.
import { useSpring } from '@react-spring/web';
import { useEffect, useState } from 'react';
import type { Camera } from './types';

export function useFramedCamera(target: Camera): Camera {
  const [{ x, y, s }, api] = useSpring(() => ({
    x: target.x, y: target.y, s: target.s, config: { tension: 210, friction: 26 },
  }));
  const [cam, setCam] = useState<Camera>(target);

  useEffect(() => {
    api.start({ x: target.x, y: target.y, s: target.s });
  }, [target.x, target.y, target.s, api]);

  useEffect(() => {
    let raf = 0;
    let prev = { x: NaN, y: NaN, s: NaN };
    const tick = () => {
      const nx = x.get(), ny = y.get(), ns = s.get();
      if (nx !== prev.x || ny !== prev.y || ns !== prev.s) {
        prev = { x: nx, y: ny, s: ns };
        setCam(prev);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [x, y, s]);

  return cam;
}
