// A plant-name input with autocomplete over the plant catalog (+ names already
// used in this garden). Picking a suggestion fills the name and hands back its
// crop category so callers can pre-classify. Keyboard: ↑/↓ to move, Enter to
// pick the highlighted suggestion (or commit the typed text), Esc to dismiss.
import { useId, useMemo, useState, type KeyboardEvent } from 'react';
import { CROP_LABEL, type CropCategory } from '@/domain';
import { suggestPlants, type PlantSuggestion } from '@/data/plantCatalog';
import { CROP_DOT } from '@design/cropColors';

export function PlantAutocomplete({
  value, onChange, onPick, onEnter, onEscape, onBlur, existing = [],
  placeholder, autoFocus, inputClassName, wrapperClassName,
}: {
  value: string;
  onChange: (v: string) => void;
  onPick?: (name: string, cropCategory: CropCategory) => void;
  onEnter?: () => void;      // Enter with no highlighted suggestion (commit typed text)
  onEscape?: () => void;
  onBlur?: () => void;
  existing?: string[];
  placeholder?: string;
  autoFocus?: boolean;
  inputClassName?: string;
  wrapperClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const suggestions = useMemo(() => suggestPlants(value, existing), [value, existing]);
  const show = open && suggestions.length > 0;

  const pick = (s: PlantSuggestion) => {
    onChange(s.name);
    onPick?.(s.name, s.cropCategory);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (show && e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, suggestions.length - 1)); return; }
    if (show && e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, -1)); return; }
    if (e.key === 'Enter') {
      if (show && active >= 0) { e.preventDefault(); pick(suggestions[active]!); return; }
      onEnter?.();
      return;
    }
    if (e.key === 'Escape') { if (show) { setOpen(false); setActive(-1); } else onEscape?.(); }
  };

  return (
    <div className={`relative ${wrapperClassName ?? ''}`}>
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setActive(-1); }}
        onKeyDown={onKeyDown}
        onFocus={() => setOpen(true)}
        onBlur={() => { setOpen(false); onBlur?.(); }}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={show}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        className={inputClassName}
      />
      {show && (
        <ul id={listId} role="listbox"
          className="absolute left-0 top-full z-50 mt-1 w-max min-w-full max-w-[240px] max-h-56 overflow-auto rounded-card border border-line bg-card py-1">
          {suggestions.map((s, i) => (
            <li key={s.name} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
              <button type="button"
                // Commit before the input's blur fires, and keep focus on the input.
                onMouseDown={(e) => { e.preventDefault(); pick(s); }}
                onMouseEnter={() => setActive(i)}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] transition-colors ${i === active ? 'bg-paper' : 'hover:bg-paper'}`}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CROP_DOT[s.cropCategory] }} />
                <span className="text-ink truncate">{s.name}</span>
                <span className="ml-auto pl-2 text-[10px] text-muted shrink-0">{CROP_LABEL[s.cropCategory]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
