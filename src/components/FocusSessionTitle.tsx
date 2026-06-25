import { useState, useEffect, useRef } from 'react';
import { Pencil } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

const KEY = 'pomo:focusTitle';

/**
 * Focus-session title shown above the timer. Default (unnamed) state shows the
 * prompt "What do you want to focus on?"; once named it shows the title with a
 * pencil to rename. Persisted to localStorage.
 */
export default function FocusSessionTitle() {
  const { t } = useTranslation();
  const [title, setTitle] = useState(() => localStorage.getItem(KEY) || '');
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const prompt = t.language === 'pt' ? 'No que queres focar?' : 'What do you want to focus on?';

  const save = () => {
    const next = title.trim();
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
          placeholder={t.language === 'pt' ? 'Nomeie a sessão…' : 'Name your session…'}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
          aria-label="Session name"
          className="bg-white/10 rounded-xl px-4 py-1.5 text-2xl font-bold text-center outline-none focus:ring-2 ring-primary/40 w-[300px] placeholder:text-white/30"
        />
      ) : title ? (
        <button
          onClick={() => setEditing(true)}
          className="group flex items-center gap-2.5 text-2xl font-bold tracking-tight hover:text-white transition-colors"
          title="Rename this session"
        >
          {title}
          <Pencil size={16} className="text-white/40 group-hover:text-white/70 transition-colors" />
        </button>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="text-3xl font-bold tracking-tight text-white/95 hover:text-white transition-colors"
          title="Name your focus session"
        >
          {prompt}
        </button>
      )}
    </div>
  );
}
