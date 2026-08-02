// First-run welcome — shown once when entering the demo garden. Says what
// GardenHQ is (a live map, not a diagram) and points straight at the bed with
// a live sensor reading so the "it's alive" moment isn't left to wandering.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { GardenTree } from '@/domain';
import { Label } from '@design/primitives';
import { MADRONA_URL, madronaClick } from '@/lib/madrona';

const WELCOME_SEEN_KEY = 'gardenhq:welcome:v1';

function welcomeSeen(): boolean {
  try {
    return localStorage.getItem(WELCOME_SEEN_KEY) === '1';
  } catch {
    return true; // storage unavailable — never nag
  }
}

function markSeen() {
  try {
    localStorage.setItem(WELCOME_SEEN_KEY, '1');
  } catch {
    /* storage unavailable — fine, it's a one-time nicety */
  }
}

/** The bed with the hottest live sensor reading — the demo's money screen. */
function liveHighlight(tree: GardenTree) {
  const live = tree.sensors
    .filter((s) => s.reading?.tempF !== undefined && s.assignedBedId)
    .sort((a, b) => (b.reading!.tempF! - a.reading!.tempF!))[0];
  if (!live) return null;
  const bed = tree.beds.find((b) => b.id === live.assignedBedId);
  if (!bed) return null;
  return { bedId: bed.id, bedName: bed.name, tempF: live.reading!.tempF! };
}

/** Self-gating: renders nothing once the intro has been dismissed. */
export function WelcomeIntro({ tree, gardenId }: { tree: GardenTree; gardenId: string }) {
  const [open, setOpen] = useState(() => !welcomeSeen());
  if (!open) return null;
  return <WelcomeDialog tree={tree} gardenId={gardenId} onClose={() => setOpen(false)} />;
}

function WelcomeDialog({ tree, gardenId, onClose }: {
  tree: GardenTree; gardenId: string; onClose: () => void;
}) {
  const primaryRef = useRef<HTMLAnchorElement>(null);
  const secondaryRef = useRef<HTMLButtonElement>(null);
  const highlight = liveHighlight(tree);

  const dismiss = () => { markSeen(); onClose(); };

  useEffect(() => {
    (primaryRef.current ?? secondaryRef.current)?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { markSeen(); onClose(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 bg-ink/30 z-40" onClick={dismiss} />
      <div role="dialog" aria-modal="true" aria-labelledby="welcome-title"
        className="fixed z-50 inset-x-0 bottom-0 sm:inset-0 sm:m-auto sm:h-fit sm:max-w-md
                   bg-card border border-line rounded-t-2xl sm:rounded-card p-6 sm:p-7 max-h-[88vh] overflow-auto">
        <Label className="text-clay">Welcome to GardenHQ</Label>
        <h2 id="welcome-title" className="mt-2 text-2xl font-bold tracking-[-0.025em] text-ink leading-tight">
          A live map of a real garden
        </h2>

        <div className="mt-5 flex flex-col gap-4">
          <div>
            <div className="text-[13px] font-semibold text-ink">Spatially true</div>
            <p className="m-0 mt-0.5 text-[13px] leading-[1.55] text-clay">
              Every zone, bed, and planting, drawn where it actually is. Tap anything to drill in.
            </p>
          </div>
          <div>
            <div className="text-[13px] font-semibold text-ink">Systems on the map</div>
            <p className="m-0 mt-0.5 text-[13px] leading-[1.55] text-clay">
              Sensors, reservoirs, covers, and irrigation live here too: state, not decoration.
            </p>
          </div>
          {highlight && (
            <div className="rounded-card border border-line bg-paper p-3.5 flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-live" />
              </span>
              <p className="m-0 text-[13px] leading-[1.5] text-ink70">
                It&rsquo;s <span className="font-semibold text-live tabular-nums">{highlight.tempF}°F</span> in
                the {highlight.bedName} bed right now.
              </p>
            </div>
          )}
        </div>

        <p className="m-0 mt-4 text-[11.5px] leading-[1.55] text-muted">
          What you&rsquo;re seeing: a real garden&rsquo;s season, stored only in
          your browser. Explore freely; nothing leaves your device.
        </p>

        <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
          {highlight && (
            <Link ref={primaryRef} to={`/garden/${gardenId}/bed/${highlight.bedId}`} onClick={dismiss}
              className="cta-seal inline-flex min-h-[44px] items-center justify-center rounded-card bg-seal px-5 text-sm font-semibold text-card transition-opacity hover:opacity-90">
              See it live
            </Link>
          )}
          <button ref={secondaryRef} type="button" onClick={dismiss}
            className="inline-flex min-h-[44px] items-center justify-center rounded-card border border-line px-5 text-sm font-semibold text-ink70 hover:border-ink70 transition-colors">
            Explore on my own
          </button>
        </div>

        <p className="m-0 mt-5 pt-4 border-t border-line-soft text-[11.5px] leading-[1.55] text-muted">
          Built by{' '}
          <a href={MADRONA_URL} target="_blank" rel="noopener noreferrer"
            onClick={() => madronaClick('welcome-intro')}
            className="font-semibold text-clay hover:text-ink transition-colors">
            Madrona Product Studio
          </a>
          . Want one of your own, or one for what you run? Say hello.
        </p>
      </div>
    </>
  );
}
