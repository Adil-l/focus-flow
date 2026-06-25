import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Trophy } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import type { HistoryEntry } from '@/stores/pomodoroStore';

type LeaderboardFilter = 'today' | 'week' | 'month' | 'global';

interface DayStat {
  date: string; // YYYY-MM-DD
  label: string;
  pomodoros: number;
  minutes: number;
  isToday: boolean;
}

const FILTER_LABELS_PT: Record<LeaderboardFilter, string> = {
  today: 'Hoje',
  week: 'Semana',
  month: 'Mês',
  global: 'Geral',
};

const WINDOW_DAYS: Record<LeaderboardFilter, number | null> = {
  today: 1,
  week: 7,
  month: 30,
  global: null,
};

const localDate = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const fmtTime = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

/**
 * Personal focus leaderboard: ranks YOUR best focus days by pomodoros
 * completed, derived from real session history. The filter chooses how far
 * back to look. No fake/remote data — a real global board would need a backend.
 */
export default function LeaderboardPanel({ history }: { history: HistoryEntry[] }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<LeaderboardFilter>('week');

  const getFilterLabel = (f: LeaderboardFilter) =>
    t.language === 'pt' ? FILTER_LABELS_PT[f] : f;

  const days = useMemo<DayStat[]>(() => {
    const todayStr = localDate(Date.now());
    const cutoff = (() => {
      const win = WINDOW_DAYS[filter];
      if (win === null) return 0;
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (win - 1));
      return d.getTime();
    })();

    const byDay = new Map<string, { pomodoros: number; seconds: number }>();
    for (const e of history) {
      if (e.type !== 'work') continue;
      if (e.ts < cutoff) continue;
      const key = localDate(e.ts);
      const cur = byDay.get(key) ?? { pomodoros: 0, seconds: 0 };
      cur.pomodoros += 1;
      cur.seconds += e.duration;
      byDay.set(key, cur);
    }

    return [...byDay.entries()]
      .map(([date, v]) => ({
        date,
        label: new Date(`${date}T00:00:00`).toLocaleDateString(t.language === 'pt' ? 'pt-PT' : 'en-US', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
        }),
        pomodoros: v.pomodoros,
        minutes: v.seconds / 60,
        isToday: date === todayStr,
      }))
      .sort((a, b) => b.pomodoros - a.pomodoros || b.minutes - a.minutes);
  }, [history, filter, t.language]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="glass-panel p-6 w-[min(680px,92vw)] h-[80vh] flex flex-col"
    >
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h3 className="font-semibold text-white text-base flex items-center gap-2">
          <BarChart3 size={18} className="text-primary" /> {t.leaderboard}
        </h3>
        <div className="flex gap-1 bg-white/[0.04] p-1 rounded-lg">
          {(['today', 'week', 'month', 'global'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase ${filter === f ? 'bg-white/10 text-white' : 'text-white/40'}`}>
              {getFilterLabel(f)}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-white/40 mb-3">
        {t.language === 'pt'
          ? 'Os teus melhores dias de foco, ordenados por pomodoros concluídos.'
          : 'Your best focus days, ranked by completed pomodoros.'}
      </p>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {days.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-white/40">
            <Trophy size={36} className="text-white/20" />
            <p className="text-sm font-bold">
              {t.language === 'pt' ? 'Ainda sem sessões neste período' : 'No sessions in this period yet'}
            </p>
            <p className="text-xs max-w-xs">
              {t.language === 'pt'
                ? 'Conclui um pomodoro de foco para apareceres aqui.'
                : 'Complete a focus pomodoro to show up here.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs text-white/70">
            <thead className="text-[10px] uppercase text-white/30 sticky top-0 bg-black/20">
              <tr>
                <th className="py-2 pl-2">#</th>
                <th className="py-2">{t.language === 'en' ? 'Day' : 'Dia'}</th>
                <th className="py-2">{t.language === 'en' ? 'Focus time' : 'Tempo de foco'}</th>
                <th className="py-2 text-right pr-2">Pomodoros</th>
              </tr>
            </thead>
            <tbody>
              {days.map((row, i) => (
                <tr key={row.date} className={`border-b border-white/[0.05] hover:bg-white/[0.02] ${row.isToday ? 'bg-primary/10' : ''}`}>
                  <td className="py-3 pl-2 font-bold text-white/50">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </td>
                  <td className="py-3 capitalize">
                    {row.label}
                    {row.isToday && <span className="ml-2 text-[9px] font-black uppercase tracking-widest text-primary">{t.language === 'pt' ? 'Hoje' : 'Today'}</span>}
                  </td>
                  <td className="py-3 font-mono">{fmtTime(row.minutes)}</td>
                  <td className="py-3 text-right pr-2 font-bold text-primary">{row.pomodoros}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
}
