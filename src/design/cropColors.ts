// Categorical accents for crop types — used by the map nodes and the bed view.
// Deliberately outside the core UI tokens: these are data-viz colors, not chrome.
import type { CropCategory } from '@/domain';
import { T } from './tokens';

export const CROP_DOT: Record<CropCategory, string> = {
  brassica: '#4a7c59',
  leafy: '#6b9e6b',
  fruiting: T.seal,
  cucurbit: '#c8873a',
  root: '#a06a3a',
  allium: '#8c7bb0',
  herb: '#5a8f6a',
  legume: '#7aa05a',
  berry: '#9a3b6a',
  'fruit-tree': '#7a5230',
  other: T.muted,
};
