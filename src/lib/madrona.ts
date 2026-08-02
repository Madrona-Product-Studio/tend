// Studio link + tracked CTA event — the consistent "use it or have one built"
// path across Madrona apps (same pattern as Helm).
import { track } from '@vercel/analytics';

export const MADRONA_URL = 'https://madronaproduct.com?utm_source=gardenhq';

export function madronaClick(from: string) {
  track('madrona-cta', { from });
}
