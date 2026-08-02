// Studio contact surfaces — the consistent "use it or have one built" path
// across Madrona apps (same pattern as Helm: utm-tagged studio link + tracked
// madrona-cta event with the surface that prompted it — see src/lib/madrona).
import { Label } from '@design/primitives';
import { MADRONA_URL, madronaClick } from '@/lib/madrona';

/** The two-audience get-in-touch block (landing, about). */
export function StudioContact({ from, className = '' }: { from: string; className?: string }) {
  return (
    <div className={`text-center ${className}`}>
      <Label className="text-clay">Get in touch</Label>
      <p className="mx-auto mt-2 max-w-md text-[14px] leading-[1.6] text-clay">
        Want GardenHQ for your own garden, or a living map like this for
        something you run? It&rsquo;s built by Madrona Product Studio.
      </p>
      <a
        href={MADRONA_URL} target="_blank" rel="noopener noreferrer"
        onClick={() => madronaClick(from)}
        className="mt-5 inline-flex min-h-[44px] items-center rounded-card bg-ink px-6 text-sm font-semibold text-card transition-opacity hover:opacity-90"
      >
        Talk to the studio →
      </a>
    </div>
  );
}

/** Minimal Madrona footer for the marketing surfaces (landing, about). */
export function MarketingFooter() {
  return (
    <footer className="border-t border-line-soft">
      <div className="mx-auto max-w-4xl px-6 py-8 sm:px-10 text-center text-[12px] text-muted">
        A{' '}
        <a href="https://www.madronaproduct.com" target="_blank" rel="noopener noreferrer"
          className="font-semibold text-clay hover:text-ink transition-colors">
          Madrona Product Studio
        </a>{' '}
        project · © {new Date().getFullYear()} GardenHQ
      </div>
    </footer>
  );
}
