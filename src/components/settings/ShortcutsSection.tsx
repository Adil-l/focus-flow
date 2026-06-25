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
    <div className="space-y-8">
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="grid grid-cols-1 gap-2">
        {SHORTCUTS.map(s => (
          <div
            key={s.key}
            className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/5 group hover:bg-white/[0.05] transition-all"
          >
            <span className="text-sm font-bold text-white/60 group-hover:text-white/90">{s.action}</span>
            <kbd className="px-4 py-2 rounded-xl bg-black/40 text-xs font-black font-mono text-primary border border-white/10 shadow-2xl shadow-black/40">
              {s.key}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
}
