import { useSearchParams } from 'react-router-dom';

export type Lens = 'map' | 'list';

/** Lens (Map | List) is URL-driven (?lens=) so it's shareable and survives back. */
export function useLens(fallback: Lens = 'map'): [Lens, (l: Lens) => void] {
  const [params, setParams] = useSearchParams();
  const lens: Lens = params.get('lens') === 'list' ? 'list' : params.get('lens') === 'map' ? 'map' : fallback;
  const setLens = (l: Lens) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('lens', l);
      return next;
    }, { replace: true });
  };
  return [lens, setLens];
}
