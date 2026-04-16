import { useMemo } from 'react';
import { PremiumGate } from '@/components/PremiumGate';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Flame, Clock, CalendarDays, Target, Download, Crown, Lock } from 'lucide-react';
import type { HistoryEntry } from '@/stores/pomodoroStore';
import { getStatsFromHistory, calculateStreak } from '@/stores/pomodoroStore';
import { useSubscription } from '@/stores/subscriptionStore';

interface StatsPanelProps {
  history: HistoryEntry[];
  onClearHistory: () => void;
}

const CHART_COLORS = ['#A855F7', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'];

export default function StatsPanel({ history, onClearHistory }: StatsPanelProps) {
  const stats = useMemo(() => getStatsFromHistory(history), [history]);
  const streak = useMemo(() => calculateStreak(history), [history]);
  const { isPremium } = useSubscription();

  const barData = stats.chartLabels.map((label, i) => ({ 
    day: label.slice(8), // Just day number
    minutes: stats.chartData[i] 
  }));

  const pieData = [
    { name: 'Focus', value: stats.distribution.work, color: 'hsl(270 80% 65%)' },
    { name: 'Break', value: stats.distribution.break, color: 'hsl(142 70% 50%)' },
  ].filter(d => d.value > 0);

  const categoryData = Object.entries(stats.categories)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'pomodoro-history.json'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin">
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Clock, label: 'Focus Hours', value: stats.totalHours, color: 'text-purple-400' },
          { icon: Target, label: 'Sessions', value: stats.totalSessions, color: 'text-green-400' },
          { icon: CalendarDays, label: 'Days Active', value: stats.totalDays, color: 'text-yellow-400' },
          { icon: Flame, label: 'Streak', value: `${streak}d`, color: 'text-orange-400' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white/[0.04] rounded-xl p-3 text-center border border-white/[0.05]">
            <Icon size={18} className={`mx-auto mb-1.5 ${color}`} />
            <div className={`text-xl font-bold ${color}`}>{value}</div>
            <div className="text-[11px] text-white/40 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {barData.length > 0 && (
        <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.05]">
          <h4 className="text-[11px] font-medium text-white/40 mb-3 uppercase tracking-wider">Productivity (7d)</h4>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={barData}>
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: 'hsl(270 35% 10%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11, color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="minutes" fill="hsl(270 80% 65%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
import { PremiumGate } from '@/components/PremiumGate';
// ...
        {pieData.length > 0 && (
          <PremiumGate featureName="Charts">
            <ResponsiveContainer width="100%" height={100}>
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={25} outerRadius={40} paddingAngle={5}>
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(270 35% 10%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </PremiumGate>
        )}

        {categoryData.length > 0 && (
          <PremiumGate featureName="Categories">
            <div className="space-y-1.5 mt-2">
              {categoryData.map((cat, i) => (
                <div key={cat.name} className="flex items-center justify-between gap-2">
                  <div className="text-[10px] text-white/60 truncate flex-1">{cat.name}</div>
                  <div className="text-[10px] font-medium text-white/40">{cat.value}m</div>
                </div>
              ))}
            </div>
          </PremiumGate>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={exportJSON} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.04] text-[11px] text-white/50 hover:text-white transition-all border border-white/[0.05] flex-1 justify-center">
          <Download size={12} /> Export JSON
        </button>
        <button onClick={onClearHistory} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-[11px] text-red-400 hover:bg-red-500/20 transition-all border border-red-500/10">
          Clear
        </button>
      </div>
    </div>
  );
}
