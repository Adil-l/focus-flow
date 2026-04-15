import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Flame, Clock, CalendarDays, Target, Download } from 'lucide-react';
import type { HistoryEntry } from '@/stores/pomodoroStore';
import { getStatsFromHistory, calculateStreak } from '@/stores/pomodoroStore';

interface StatsPanelProps {
  history: HistoryEntry[];
  onClearHistory: () => void;
}

const CHART_COLORS = ['#A855F7', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'];

export default function StatsPanel({ history, onClearHistory }: StatsPanelProps) {
  const stats = useMemo(() => getStatsFromHistory(history), [history]);
  const streak = useMemo(() => calculateStreak(history), [history]);

  const barData = stats.chartLabels.map((label, i) => ({ day: label.slice(5), minutes: stats.chartData[i] }));
  const pieData = Object.entries(stats.categories).map(([name, value]) => ({ name, value }));

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'pomodoro-history.json'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Clock, label: 'Focus Hours', value: stats.totalHours, color: 'text-purple-400' },
          { icon: Target, label: 'Sessions', value: stats.totalSessions, color: 'text-green-400' },
          { icon: CalendarDays, label: 'Days Active', value: stats.totalDays, color: 'text-yellow-400' },
          { icon: Flame, label: 'Streak', value: `${streak}d`, color: 'text-orange-400' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white/[0.04] rounded-xl p-3 text-center">
            <Icon size={18} className={`mx-auto mb-1.5 ${color}`} />
            <div className={`text-xl font-bold ${color}`}>{value}</div>
            <div className="text-[11px] text-white/40 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {barData.length > 0 && (
        <div className="bg-white/[0.04] rounded-xl p-3">
          <h4 className="text-xs text-white/40 mb-2">Recent Productivity</h4>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={barData}>
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(270 35% 10%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11, color: '#fff' }} />
              <Bar dataKey="minutes" fill="hsl(270 80% 65%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={exportJSON} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] text-xs text-white/50 hover:text-white transition-all">
          <Download size={12} /> Export
        </button>
        <button onClick={onClearHistory} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-xs text-red-400 hover:bg-red-500/20 transition-all ml-auto">
          Clear
        </button>
      </div>
    </div>
  );
}
