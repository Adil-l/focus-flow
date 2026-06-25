import { useState, useEffect, useRef } from 'react';
import { Pencil } from 'lucide-react';

const KEY = 'pomo:focusTitle';

/** Editable focus-session title (e.g. "Creative Brainstorm"), shown above the timer. */
export default function FocusSessionTitle() {
  const [title, setTitle] = useState(() => localStorage.getItem(KEY) || 'Focus session');
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const save = () => {
    const next = title.trim() || 'Focus session';
    setTitle(next);
    localStorage.setItem(KEY, next);
    setEditing(false);
  };

  return (
    <div className="mb-6 flex items-center justify-center text-white">
      {editing ? (
        <input
          ref={inputRef}
          value={title}
          maxLength={40}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
          aria-label="Session name"
          className="bg-white/10 rounded-xl px-4 py-1.5 text-2xl font-bold text-center outline-none focus:ring-2 ring-primary/40 w-[280px]"
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="group flex items-center gap-2.5 text-2xl font-bold tracking-tight hover:text-white transition-colors"
          title="Rename this session"
        >
          {title}
          <Pencil size={16} className="text-white/40 group-hover:text-white/70 transition-colors" />
        </button>
      )}
    </div>
  );
}
