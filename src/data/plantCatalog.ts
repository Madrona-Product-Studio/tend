// A catalog of common home-garden plants, each tagged with its crop category.
// Powers plant-name autocomplete: picking a known plant fills the name AND its
// category (which drives future recommendations), so users don't hand-classify.
import type { CropCategory } from '@/domain';

export interface PlantSuggestion { name: string; cropCategory: CropCategory }

// Ordered roughly by how common each is in a home garden. Names are singular;
// matching is case-insensitive prefix/substring, so "tom" → Tomato.
export const PLANT_CATALOG: PlantSuggestion[] = [
  // Fruiting (nightshades + fruiting veg)
  { name: 'Tomato', cropCategory: 'fruiting' },
  { name: 'Cherry tomato', cropCategory: 'fruiting' },
  { name: 'Pepper', cropCategory: 'fruiting' },
  { name: 'Bell pepper', cropCategory: 'fruiting' },
  { name: 'Jalapeño', cropCategory: 'fruiting' },
  { name: 'Serrano', cropCategory: 'fruiting' },
  { name: 'Habanero', cropCategory: 'fruiting' },
  { name: 'Poblano', cropCategory: 'fruiting' },
  { name: 'Shishito', cropCategory: 'fruiting' },
  { name: 'Anaheim', cropCategory: 'fruiting' },
  { name: 'Eggplant', cropCategory: 'fruiting' },
  { name: 'Tomatillo', cropCategory: 'fruiting' },
  // Leafy greens
  { name: 'Lettuce', cropCategory: 'leafy' },
  { name: 'Romaine', cropCategory: 'leafy' },
  { name: 'Spinach', cropCategory: 'leafy' },
  { name: 'Chard', cropCategory: 'leafy' },
  { name: 'Arugula', cropCategory: 'leafy' },
  { name: 'Endive', cropCategory: 'leafy' },
  { name: 'Radicchio', cropCategory: 'leafy' },
  { name: 'Watercress', cropCategory: 'leafy' },
  // Brassicas
  { name: 'Broccoli', cropCategory: 'brassica' },
  { name: 'Broccoli rabe', cropCategory: 'brassica' },
  { name: 'Cauliflower', cropCategory: 'brassica' },
  { name: 'Cabbage', cropCategory: 'brassica' },
  { name: 'Kale', cropCategory: 'brassica' },
  { name: 'Brussels sprouts', cropCategory: 'brassica' },
  { name: 'Collard greens', cropCategory: 'brassica' },
  { name: 'Kohlrabi', cropCategory: 'brassica' },
  { name: 'Bok choy', cropCategory: 'brassica' },
  { name: 'Mustard greens', cropCategory: 'brassica' },
  // Roots
  { name: 'Carrot', cropCategory: 'root' },
  { name: 'Beet', cropCategory: 'root' },
  { name: 'Radish', cropCategory: 'root' },
  { name: 'Turnip', cropCategory: 'root' },
  { name: 'Potato', cropCategory: 'root' },
  { name: 'Sweet potato', cropCategory: 'root' },
  { name: 'Parsnip', cropCategory: 'root' },
  { name: 'Rutabaga', cropCategory: 'root' },
  { name: 'Fennel', cropCategory: 'root' },
  { name: 'Ginger', cropCategory: 'root' },
  // Alliums
  { name: 'Onion', cropCategory: 'allium' },
  { name: 'Green onion', cropCategory: 'allium' },
  { name: 'Garlic', cropCategory: 'allium' },
  { name: 'Leek', cropCategory: 'allium' },
  { name: 'Shallot', cropCategory: 'allium' },
  { name: 'Chives', cropCategory: 'allium' },
  // Herbs
  { name: 'Basil', cropCategory: 'herb' },
  { name: 'Thai basil', cropCategory: 'herb' },
  { name: 'Cilantro', cropCategory: 'herb' },
  { name: 'Parsley', cropCategory: 'herb' },
  { name: 'Dill', cropCategory: 'herb' },
  { name: 'Mint', cropCategory: 'herb' },
  { name: 'Rosemary', cropCategory: 'herb' },
  { name: 'Thyme', cropCategory: 'herb' },
  { name: 'Oregano', cropCategory: 'herb' },
  { name: 'Sage', cropCategory: 'herb' },
  { name: 'Tarragon', cropCategory: 'herb' },
  { name: 'Marjoram', cropCategory: 'herb' },
  { name: 'Lavender', cropCategory: 'herb' },
  { name: 'Lemongrass', cropCategory: 'herb' },
  // Legumes
  { name: 'Pea', cropCategory: 'legume' },
  { name: 'Snap pea', cropCategory: 'legume' },
  { name: 'Snow pea', cropCategory: 'legume' },
  { name: 'Green bean', cropCategory: 'legume' },
  { name: 'Bush bean', cropCategory: 'legume' },
  { name: 'Pole bean', cropCategory: 'legume' },
  { name: 'Fava bean', cropCategory: 'legume' },
  { name: 'Lima bean', cropCategory: 'legume' },
  { name: 'Chickpea', cropCategory: 'legume' },
  { name: 'Peanut', cropCategory: 'legume' },
  // Cucurbits
  { name: 'Cucumber', cropCategory: 'cucurbit' },
  { name: 'Zucchini', cropCategory: 'cucurbit' },
  { name: 'Yellow squash', cropCategory: 'cucurbit' },
  { name: 'Summer squash', cropCategory: 'cucurbit' },
  { name: 'Winter squash', cropCategory: 'cucurbit' },
  { name: 'Butternut squash', cropCategory: 'cucurbit' },
  { name: 'Acorn squash', cropCategory: 'cucurbit' },
  { name: 'Spaghetti squash', cropCategory: 'cucurbit' },
  { name: 'Delicata', cropCategory: 'cucurbit' },
  { name: 'Pattypan', cropCategory: 'cucurbit' },
  { name: 'Pumpkin', cropCategory: 'cucurbit' },
  { name: 'Watermelon', cropCategory: 'cucurbit' },
  { name: 'Cantaloupe', cropCategory: 'cucurbit' },
  { name: 'Melon', cropCategory: 'cucurbit' },
  // Fruit trees
  { name: 'Apple', cropCategory: 'fruit-tree' },
  { name: 'Pear', cropCategory: 'fruit-tree' },
  { name: 'Plum', cropCategory: 'fruit-tree' },
  { name: 'Peach', cropCategory: 'fruit-tree' },
  { name: 'Nectarine', cropCategory: 'fruit-tree' },
  { name: 'Cherry', cropCategory: 'fruit-tree' },
  { name: 'Apricot', cropCategory: 'fruit-tree' },
  { name: 'Fig', cropCategory: 'fruit-tree' },
  { name: 'Persimmon', cropCategory: 'fruit-tree' },
  { name: 'Pomegranate', cropCategory: 'fruit-tree' },
  { name: 'Lemon', cropCategory: 'fruit-tree' },
  { name: 'Lime', cropCategory: 'fruit-tree' },
  { name: 'Orange', cropCategory: 'fruit-tree' },
  { name: 'Mandarin', cropCategory: 'fruit-tree' },
  { name: 'Avocado', cropCategory: 'fruit-tree' },
  { name: 'Olive', cropCategory: 'fruit-tree' },
  // Berries
  { name: 'Strawberry', cropCategory: 'berry' },
  { name: 'Blueberry', cropCategory: 'berry' },
  { name: 'Raspberry', cropCategory: 'berry' },
  { name: 'Blackberry', cropCategory: 'berry' },
  { name: 'Boysenberry', cropCategory: 'berry' },
  { name: 'Gooseberry', cropCategory: 'berry' },
  { name: 'Currant', cropCategory: 'berry' },
  { name: 'Grape', cropCategory: 'berry' },
  { name: 'Cranberry', cropCategory: 'berry' },
  // Other
  { name: 'Corn', cropCategory: 'other' },
  { name: 'Sunflower', cropCategory: 'other' },
  { name: 'Rhubarb', cropCategory: 'other' },
  { name: 'Asparagus', cropCategory: 'other' },
  { name: 'Artichoke', cropCategory: 'other' },
  { name: 'Okra', cropCategory: 'other' },
  { name: 'Celery', cropCategory: 'other' },
];

const byLower = new Map(PLANT_CATALOG.map((p) => [p.name.toLowerCase(), p.cropCategory]));

/** The crop category for a known plant name (exact, case-insensitive), if any. */
export function categoryForPlant(name: string): CropCategory | undefined {
  return byLower.get(name.trim().toLowerCase());
}

/** Autocomplete suggestions for a query: prefix matches first, then substring.
 *  `extra` folds in names already used in this garden (deduped against catalog). */
export function suggestPlants(query: string, extra: string[] = [], limit = 7): PlantSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const pool: PlantSuggestion[] = [
    ...PLANT_CATALOG,
    ...extra
      .filter((n) => n.trim() && !byLower.has(n.trim().toLowerCase()))
      .map((n) => ({ name: n.trim(), cropCategory: categoryForPlant(n) ?? ('other' as CropCategory) })),
  ];
  const starts: PlantSuggestion[] = [];
  const contains: PlantSuggestion[] = [];
  const seen = new Set<string>();
  for (const p of pool) {
    const nl = p.name.toLowerCase();
    if (seen.has(nl) || nl === q) continue;
    if (nl.startsWith(q)) { starts.push(p); seen.add(nl); }
    else if (nl.includes(q)) { contains.push(p); seen.add(nl); }
  }
  return [...starts, ...contains].slice(0, limit);
}
