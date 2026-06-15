// Observations log + composer. The "observe & refine" loop: log what you see,
// keep it year over year. Used at the planting and bed levels.
import { useState } from 'react';
import type { Observation } from '@/domain';
import { Label } from '@design/primitives';

export function NotesSection({ heading = 'Notes', notes, onAdd, onDelete, placeholder }: {
  heading?: string;
  notes: Observation[];
  onAdd: (text: string) => void;
  onDelete: (id: string) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState('');
  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onAdd(t);
    setText('');
  };

  return (
    <div>
      <div className="mb-2"><Label className="text-ink">{heading}</Label></div>

      {notes.length > 0 && (
        <ul className="flex flex-col gap-3 mb-3">
          {notes.map((o) => (
            <li key={o.id} className="group grid grid-cols-[42px_1fr_16px] gap-2 items-start">
              <span className="font-mono text-[10.5px] text-muted pt-0.5">{o.date}</span>
              <span className="text-[13px] text-ink70 leading-[1.5]">{o.text}</span>
              <button type="button" onClick={() => onDelete(o.id)} aria-label="Delete note"
                className="text-faint hover:text-seal opacity-0 group-hover:opacity-100 focus:opacity-100 text-[11px] leading-none mt-0.5 transition-opacity">✕</button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2">
        <textarea
          value={text} onChange={(e) => setText(e.target.value)} rows={2}
          onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit(); }}
          placeholder={placeholder ?? 'Log what you see — what thrived, what bolted, what to change next year…'}
          className="w-full rounded-card border border-line focus:border-ink bg-card px-3 py-2 text-[13px] text-ink70 outline-none resize-none leading-[1.5]"
        />
        <button type="button" onClick={submit} disabled={!text.trim()}
          className="self-start rounded-card bg-ink text-card px-3 py-1.5 text-[12px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-40">
          Add note
        </button>
      </div>
    </div>
  );
}
