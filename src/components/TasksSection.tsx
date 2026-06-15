// Tasks list + composer — the "plan" half of the garden. Check off, add, delete.
// Used at the bed, zone, and garden (punch-list) levels.
import { useState } from 'react';
import type { Task } from '@/domain';
import { Label } from '@design/primitives';

export function TasksSection({ tasks, onToggle, onAdd, onDelete, heading = 'Tasks', bedNameOf }: {
  tasks: Task[];
  onToggle: (id: string, done: boolean) => void;
  onAdd: (text: string) => void;
  onDelete: (id: string) => void;
  heading?: string;
  bedNameOf?: (bedId?: string) => string | undefined;
}) {
  const [text, setText] = useState('');
  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onAdd(t);
    setText('');
  };
  const open = tasks.filter((t) => !t.done).length;

  return (
    <div>
      <div className="mb-2"><Label className="text-clay">{heading}{tasks.length > 0 ? ` · ${open} open` : ''}</Label></div>

      {tasks.length > 0 && (
        <ul className="border-t border-line">
          {tasks.map((t) => (
            <li key={t.id} className="group flex items-start gap-3 py-2.5 border-b border-line-soft">
              <button type="button" onClick={() => onToggle(t.id, !t.done)} aria-pressed={t.done}
                aria-label={t.done ? 'Mark not done' : 'Mark done'}
                className={`mt-0.5 w-4 h-4 rounded-[4px] border shrink-0 flex items-center justify-center transition-colors ${t.done ? 'bg-live border-live text-card' : 'border-muted hover:border-ink70'}`}>
                {t.done && <span className="text-[10px] leading-none">✓</span>}
              </button>
              <span className={`flex-1 text-[14px] leading-snug ${t.done ? 'text-faint line-through' : 'text-ink70'}`}>
                {t.text}{bedNameOf && bedNameOf(t.bedId) && <span className="text-muted"> · {bedNameOf(t.bedId)}</span>}
              </span>
              <button type="button" onClick={() => onDelete(t.id)} aria-label="Delete task"
                className="text-faint hover:text-seal opacity-0 group-hover:opacity-100 focus:opacity-100 text-[11px] leading-none mt-1 transition-opacity">✕</button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex gap-2">
        <input
          value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          placeholder="Add a task…"
          className="flex-1 rounded-card border border-line focus:border-ink bg-card px-3 py-2 text-[13px] text-ink70 outline-none"
        />
        <button type="button" onClick={submit} disabled={!text.trim()}
          className="rounded-card bg-ink text-card px-3 py-1.5 text-[12px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-40 shrink-0">
          Add
        </button>
      </div>
    </div>
  );
}
