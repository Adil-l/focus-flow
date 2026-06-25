import { SectionHeader } from './_shared';

const SHORTCUTS = [
  { key: 'Space', action: 'Start / Pause timer' },
  { key: 'R', action: 'Reset timer' },
  { key: 'S', action: 'Skip break' },
  { key: 'T', action: 'Toggle tasks' },
  { key: 'N', action: 'Toggle notepad' },
  { key: ',', action: 'Open settings' },
  { key: 'F', action: 'Toggle fullscreen' },
  { key: '1-3', action: 'Switch timer modes' },
];

export default function ShortcutsSection({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-5">
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="grid grid-cols-2 gap-2">
        {SHORTCUTS.map(s => (
          <div
            key={s.key}
            className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/5 group hover:bg-white/[0.05] transition-all"
          >
            <span className="text-[12px] font-bold text-white/60 group-hover:text-white/90 min-w-0 truncate">{s.action}</span>
            <kbd className="px-2.5 py-1.5 rounded-lg bg-black/40 text-[11px] font-black font-mono text-primary border border-white/10 shrink-0">
              {s.key}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
}
