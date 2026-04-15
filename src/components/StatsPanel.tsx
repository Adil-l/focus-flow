import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Flame, Clock, CalendarDays, Target, Download } from 'lucide-react';
import type { HistoryEntry } from '@/stores/pomodoroStore';
import { getStatsFromHistory, calculateStreak } from '@/stores/pomodoroStore';

interface StatsPanelProps {
  history: HistoryEntry[];
  onClearHistory: () => void;
}

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function StatsPanel({ history, onClearHistory }: StatsPanelProps) {
  const stats = useMemo(() => getStatsFromHistory(history), [history]);
  const streak = useMemo(() => calculateStreak(history), [history]);

  const barData = stats.chartLabels.map((label, i) => ({
    day: label.slice(5),
    minutes: stats.chartData[i],
  }));

  const pieData = Object.entries(stats.categories).map(([name, value]) => ({ name, value }));

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'pomodoro-history.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    let csv = 'timestamp,type,duration_seconds,category\n';
    history.forEach(r => {
      csv += `${new Date(r.ts).toISOString()},${r.type},${r.duration},${r.category || ''}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'pomodoro-history.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Clock, label: 'Horas Focadas', value: stats.totalHours, color: 'text-primary' },
          { icon: Target, label: 'Sessões', value: stats.totalSessions, color: 'text-success' },
          { icon: CalendarDays, label: 'Dias Ativos', value: stats.totalDays, color: 'text-warning' },
          { icon: Flame, label: 'Streak', value: `${streak}d`, color: 'text-streak' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="glass rounded-xl p-4 text-center">
            <Icon size={20} className={`mx-auto mb-2 ${color}`} />
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Últimos 7 dias</h4>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData}>
                <XAxis dataKey="day" tick={{ fill: 'hsl(220 10% 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(220 10% 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(220 20% 10%)', border: '1px solid hsl(220 15% 20%)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'hsl(220 20% 70%)' }}
                />
                <Bar dataKey="minutes" fill="hsl(210 100% 56%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">Sem dados ainda</p>
          )}
        </div>

        <div className="glass rounded-xl p-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Categorias</h4>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'hsl(220 20% 10%)', border: '1px solid hsl(220 15% 20%)', borderRadius: 8, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">Sem dados ainda</p>
          )}
        </div>
      </div>

      {/* Export */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={exportJSON} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-sm text-muted-foreground hover:text-foreground transition-all">
          <Download size={14} /> JSON
        </button>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-sm text-muted-foreground hover:text-foreground transition-all">
          <Download size={14} /> CSV
        </button>
        <button onClick={onClearHistory} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-destructive/10 text-sm text-destructive hover:bg-destructive/20 transition-all ml-auto">
          Limpar Histórico
        </button>
      </div>
    </div>
  );
}
