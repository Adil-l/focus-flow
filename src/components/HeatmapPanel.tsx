import { motion } from 'framer-motion';
import type { HistoryEntry } from '@/stores/pomodoroStore';

interface HeatmapPanelProps {
  history: HistoryEntry[];
}

function getHeatmapData(history: HistoryEntry[]) {
  const counts: Record<string, number> = {};
  history.filter(e => e.type === 'work').forEach(e => {
    const d = new Date(e.ts).toISOString().slice(0, 10);
    counts[d] = (counts[d] || 0) + 1;
  });

  // Last 365 days
  const days: { date: string; count: number; level: number }[] = [];
  const now = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = counts[key] || 0;
    const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 6 ? 3 : 4;
    days.push({ date: key, count, level });
  }
  return days;
}

const LEVEL_COLORS = [
  'bg-white/[0.04]',
  'bg-green-900/60',
  'bg-green-700/60',
  'bg-green-500/70',
  'bg-green-400/80',
];

export default function HeatmapPanel({ history }: HeatmapPanelProps) {
  const days = getHeatmapData(history);
  const weeks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const totalThisYear = history.filter(e => {
    const y = new Date(e.ts).getFullYear();
    return e.type === 'work' && y === new Date().getFullYear();
  }).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="glass-panel p-5 w-[420px]"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white text-base">📊 Activity Heatmap</h3>
        <span className="text-xs text-white/40">{totalThisYear} sessions this year</span>
      </div>

      <div className="flex gap-[3px] overflow-x-auto scrollbar-thin pb-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map(day => (
              <div
                key={day.date}
                className={`w-[11px] h-[11px] rounded-[2px] ${LEVEL_COLORS[day.level]} transition-all hover:ring-1 hover:ring-white/30`}
                title={`${day.date}: ${day.count} sessions`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[10px] text-white/30">Less</span>
        {LEVEL_COLORS.map((c, i) => (
          <div key={i} className={`w-[11px] h-[11px] rounded-[2px] ${c}`} />
        ))}
        <span className="text-[10px] text-white/30">More</span>
      </div>
    </motion.div>
  );
}
