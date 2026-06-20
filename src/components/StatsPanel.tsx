import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Flame, Clock, CalendarDays, Target, Download, Filter, Star, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { HistoryEntry } from '@/stores/pomodoroStore';
import { getStatsFromHistory, calculateStreak } from '@/stores/pomodoroStore';
import { useTranslation } from '@/lib/i18n';
import { PremiumGate } from '@/components/PremiumGate';
import { flags } from '@/lib/flags';
import { usePremium } from '@/hooks/usePremium';
import { getCoachDebrief, type CoachDebrief } from '@/lib/ai';

interface StatsPanelProps {
  history: HistoryEntry[];
  onClearHistory: () => void;
}

type Period = 'day' | 'week' | 'month';

export default function StatsPanel({ history, onClearHistory }: StatsPanelProps) {
  const { t } = useTranslation();
  const { checkPremium } = usePremium();
  const [period, setPeriod] = useState<Period>('week');
  const [coach, setCoach] = useState<CoachDebrief | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const filteredHistory = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now);
    switch (period) {
      case 'day':
        cutoff.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
    }
    return history.filter(entry => entry.ts >= cutoff.getTime());
  }, [history, period]);

  const stats = useMemo(() => getStatsFromHistory(filteredHistory), [filteredHistory]);
  const streak = useMemo(() => calculateStreak(filteredHistory), [filteredHistory]);

  const barData = stats.chartLabels.map((label, i) => ({ 
    day: label.slice(8), // Just day number
    minutes: stats.chartData[i] 
  }));

  const pieData = [
    { name: t.work, value: stats.distribution.work, color: 'hsl(270 80% 65%)' },
    { name: t.language === 'en' ? 'Break' : 'Pausa', value: stats.distribution.break, color: 'hsl(142 70% 50%)' },
  ].filter(d => d.value > 0);

  const categoryData = Object.entries(stats.categories)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'pomodoro-history.json'; a.click(); URL.revokeObjectURL(url);
  };

  const handleCoach = async () => {
    if (coachLoading) return;
    if (!checkPremium('AI focus coach')) return; // Plus only (also enforced server-side)
    setCoachLoading(true);
    try {
      const snapshot = {
        window: period,
        totalHours: Number(stats.totalHours),
        totalSessions: stats.totalSessions,
        totalDays: stats.totalDays,
        streakDays: streak,
        avgSessionMin: stats.additionalMetrics.averageSession,
        longestSessionMin: stats.additionalMetrics.longestSession,
        focusScore: stats.additionalMetrics.focusScore,
        dailyMinutes: stats.chartData,
        topCategories: Object.entries(stats.categories).slice(0, 5).map(([name, minutes]) => ({ name, minutes })),
      };
      setCoach(await getCoachDebrief(snapshot));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Coach unavailable');
    } finally {
      setCoachLoading(false);
    }
  };

  return (
    <div className="space-y-2.5 min-h-[82vh] pr-1 scrollbar-thin pb-0">
      {/* AI Focus Coach (Plus, behind the aiCoach flag) */}
      {flags.aiCoach && (
        <div className="glass-panel p-4 shadow-lg shadow-black/10">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={14} className="text-primary" /> AI Focus Coach
            </h4>
            <button
              onClick={handleCoach}
              disabled={coachLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-bold hover:bg-primary/30 transition-all disabled:opacity-40"
            >
              {coachLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              {coach ? 'Refresh' : 'Get debrief'}
            </button>
          </div>
          {coach && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-bold text-white">{coach.headline}</p>
              <ul className="space-y-1">
                {coach.insights.map((insight, i) => (
                  <li key={i} className="text-xs text-white/60 flex gap-2"><span className="text-primary">•</span>{insight}</li>
                ))}
              </ul>
              <p className="text-xs text-primary/90 font-medium">💡 {coach.suggestion}</p>
            </div>
          )}
        </div>
      )}

      {/* Header com filtro */}
      <div className="glass-panel p-4 shadow-lg shadow-black/10">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider">{t.periodFilter}</h4>
          <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
            {(['day', 'week', 'month'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  period === p 
                    ? 'bg-gradient-to-r from-purple-500/70 to-violet-500/70 text-white shadow-lg shadow-purple-500/20' 
                    : 'bg-transparent text-white/50 hover:bg-white/10 hover:text-white'
                }`}
              >
                {p === 'day' ? t.day : p === 'week' ? t.week : t.month}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Clock, label: t.focusHours, value: stats.totalHours, color: 'text-purple-400', bg: 'bg-purple-500/10', description: t.totalFocusTime },
          { icon: Target, label: t.sessions, value: stats.totalSessions, color: 'text-green-400', bg: 'bg-green-500/10', description: t.totalSessionsCompleted },
          { icon: CalendarDays, label: t.daysActive, value: stats.totalDays, color: 'text-yellow-400', bg: 'bg-yellow-500/10', description: t.activeDays },
          { icon: Flame, label: t.streak, value: `${streak}d`, color: 'text-orange-400', bg: 'bg-orange-500/10', description: t.currentStreak },
        ].map(({ icon: Icon, label, value, color, bg, description }) => (
          <div key={label} className="glass-panel p-4 hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.97] transition-all duration-300 ease-out shadow-xl shadow-black/15 group">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${bg} ${color} group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={18} strokeWidth={2.5} />
              </div>
              <div className="text-[10px] font-medium text-white/40">{description}</div>
            </div>
            <div className="text-3xl font-extrabold text-white mb-1 text-glow tracking-tight">{value}</div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest">{label}</div>
          </div>
        ))}
      </div>

      {/* Premium: advanced metrics + trend/distribution charts (Plus only) */}
      <PremiumGate featureName={t.language === 'pt' ? 'Estatísticas avançadas' : 'Advanced stats'}>
      {/* Cards de métricas adicionais */}
      {stats.additionalMetrics && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Target, label: t.averageSession, value: `${stats.additionalMetrics.averageSession}m`, color: 'text-blue-400', bg: 'bg-blue-500/10', description: t.avgSessionDuration },
            { icon: Clock, label: t.longestSession, value: `${stats.additionalMetrics.longestSession}m`, color: 'text-violet-400', bg: 'bg-violet-500/10', description: t.maxSessionDuration },
            { icon: Star, label: t.focusScore, value: `${stats.additionalMetrics.focusScore}`, color: 'text-yellow-400', bg: 'bg-yellow-500/10', description: t.consistencyScore },
            { icon: TrendingUp, label: t.waveIndicator, value: `${stats.additionalMetrics.waveIndicator}m/d`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', description: t.weeklyTrend },
          ].map(({ icon: Icon, label, value, color, bg, description }) => (
            <div key={label} className="glass-panel p-4 hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.97] transition-all duration-300 ease-out shadow-xl shadow-black/15 group">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${bg} ${color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={18} strokeWidth={2.5} />
                </div>
                <div className="text-[10px] font-medium text-white/40">{description}</div>
              </div>
              <div className="text-3xl font-extrabold text-white mb-1 text-glow tracking-tight">{value}</div>
              <div className="text-[10px] text-white/50 uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Gráfico de produtividade */}
      {barData.length > 0 && (
        <div className="glass-panel p-4 shadow-lg shadow-black/10 hover:shadow-xl transition-all duration-300">
          <h4 className="text-xs font-medium text-white/40 mb-3 uppercase tracking-wider">{t.productivity7d}</h4>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={barData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: 'hsl(270 40% 8% / 0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 11, color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="minutes" fill="url(#barGradient)" radius={[6, 6, 0, 0]} animationDuration={1000} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(270 80% 75%)" />
                  <stop offset="100%" stopColor="hsl(270 80% 55%)" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gráficos de distribuição */}
      <div className="grid grid-cols-2 gap-3">
        {pieData.length > 0 && (
          <div className="glass-panel p-4 shadow-lg shadow-black/10 hover:shadow-xl transition-all duration-300">
            <h4 className="text-xs font-medium text-white/40 mb-3 uppercase tracking-wider">{t.timeDistribution}</h4>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <Pie data={pieData} dataKey="value" innerRadius={28} outerRadius={45} paddingAngle={6} animationDuration={1000}>
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(270 40% 8% / 0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 11, color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {categoryData.length > 0 && (
          <div className="glass-panel p-4 shadow-lg shadow-black/10 hover:shadow-xl transition-all duration-300">
            <h4 className="text-xs font-medium text-white/40 mb-3 uppercase tracking-wider">{t.topCategories}</h4>
            <div className="space-y-2">
              {categoryData.map((cat, i) => (
                <div key={cat.name} className="flex items-center justify-between group">
                  <div className="text-xs text-white/80 truncate flex-1 group-hover:text-white transition-colors">{cat.name}</div>
                  <div className="text-xs font-semibold text-white/60">{cat.value}m</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      </PremiumGate>

      {/* Botões de ação */}
      <div className="flex gap-2">
        <button onClick={exportJSON} className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-panel text-xs text-white/70 hover:text-white hover:scale-[1.02] transition-all duration-200 flex-1 justify-center shadow-lg shadow-black/10">
          <Download size={14} /> {t.exportJSON}
        </button>
        <button onClick={onClearHistory} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/15 text-xs text-red-400 hover:bg-red-500/25 hover:scale-[1.02] transition-all duration-200 border border-red-500/20">
          {t.clear}
        </button>
      </div>
    </div>
  );
}
