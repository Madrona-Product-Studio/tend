// ════════════════════════════════════════════════════════════════════════════
// swiss/zen tokens — JS mirror of the CSS @theme tokens in styles/global.css.
//
// In markup, PREFER Tailwind utility classes (bg-paper, text-ink, border-line).
// Use this object only where you need a raw value the cascade can't reach —
// SVG strokes/fills, <canvas>, inline gradients, animation keyframes.
//
// Keep this in sync with global.css @theme. (Ported from the studio swiss/zen
// system; this is a living library — see design/swiss-style-guide.md.)
// ════════════════════════════════════════════════════════════════════════════

export const T = {
  card: '#ffffff',
  paper: '#fdfcfa',
  bg: '#f5f1ea',
  ink: '#1a1714',
  ink70: '#403a33',
  clay: '#6f6657',
  muted: '#8c8378',
  faint: '#b8b0a2',
  seal: '#b23a2e',
  live: '#3a7d7b',
  line: 'rgba(26, 23, 20, 0.14)',
  lineSoft: 'rgba(26, 23, 20, 0.08)',
} as const;

export const SANS = "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif";

/** #rrggbb (or #rgb) → rgba() string with the given alpha. */
export function hexA(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
