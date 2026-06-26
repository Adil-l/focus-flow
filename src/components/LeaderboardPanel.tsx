import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Trophy, Globe, LogIn, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import type { HistoryEntry } from '@/stores/pomodoroStore';
import { fetchLeaderboard, upsertMyStats, type LeaderboardRow } from '@/lib/leaderboard';

type LeaderboardFilter = 'today' | 'week' | 'month' | 'global';

interface DayStat {
  date: string;
  label: string;
  pomodoros: number;
  minutes: number;
  isToday: boolean;
}

const FILTER_LABELS_PT: Record<LeaderboardFilter, string> = {
  today: 'Hoje',
  week: 'Semana',
  month: 'Mês',
  global: 'Global',
};

const WINDOW_DAYS: Record<Exclude<LeaderboardFilter, 'global'>, number> = {
  today: 1,
  week: 7,
  month: 30,
};

const localDate = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const weekStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - 6);
  return d.getTime();
};

const fmtTime = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const medal = (i: number) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1);

interface LeaderboardPanelProps {
  history: HistoryEntry[];
  userId?: string | null;
  displayName?: string;
  optedIn?: boolean;
  onOptInChange?: (value: boolean) => void;
}

/**
 * Two boards in one panel:
 *  - today/week/month: YOUR best focus days from local session history.
 *  - global: a real opt-in cross-user board backed by Supabase (requires the
 *    leaderboard migration + sign-in). Degrades gracefully if unavailable.
 */
export default function LeaderboardPanel({ history, userId, displayName = '', optedIn = false, onOptInChange }: LeaderboardPanelProps) {
  const { t, language } = useTranslation();
  const [filter, setFilter] = useState<LeaderboardFilter>('week');
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loadingGlobal, setLoadingGlobal] = useState(false);

  const getFilterLabel = (f: LeaderboardFilter) =>
    language === 'pt' ? FILTER_LABELS_PT[f] : f;

  // My rolling stats, used to publish to the global board.
  const myStats = useMemo(() => {
    const todayStr = localDate(Date.now());
    const wkCut = weekStart();
    let pt = 0, mt = 0, pw = 0, mw = 0, total = 0;
    for (const e of history) {
      if (e.type !== 'work') continue;
      total += 1;
      const ds = localDate(e.ts);
      if (ds === todayStr) { pt += 1; mt += e.duration / 60; }
      if (e.ts >= wkCut) { pw += 1; mw += e.duration / 60; }
    }
    return {
      pomodoros_today: pt, minutes_today: Math.round(mt),
      pomodoros_week: pw, minutes_week: Math.round(mw),
      pomodoros_total: total,
    };
  }, [history]);

  // Personal best-days for the non-global tabs.
  const days = useMemo<DayStat[]>(() => {
    if (filter === 'global') return [];
    const todayStr = localDate(Date.now());
    const win = WINDOW_DAYS[filter];
    const cutoff = (() => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (win - 1));
      return d.getTime();
    })();

    const byDay = new Map<string, { pomodoros: number; seconds: number }>();
    for (const e of history) {
      if (e.type !== 'work' || e.ts < cutoff) continue;
      const key = localDate(e.ts);
      const cur = byDay.get(key) ?? { pomodoros: 0, seconds: 0 };
      cur.pomodoros += 1;
      cur.seconds += e.duration;
      byDay.set(key, cur);
    }
    return [...byDay.entries()]
      .map(([date, v]) => ({
        date,
        label: new Date(`${date}T00:00:00`).toLocaleDateString(language === 'pt' ? 'pt-PT' : 'en-US', { weekday: 'short', day: '2-digit', month: 'short' }),
        pomodoros: v.pomodoros,
        minutes: v.seconds / 60,
        isToday: date === todayStr,
      }))
      .sort((a, b) => b.pomodoros - a.pomodoros || b.minutes - a.minutes);
  }, [history, filter, language]);

  // Publish my stats and load the global board when that tab is active.
  useEffect(() => {
    if (filter !== 'global' || !userId) return;
    let cancelled = false;
    (async () => {
      setLoadingGlobal(true);
      await upsertMyStats(userId, displayName, myStats, optedIn);
      const data = await fetchLeaderboard();
      if (!cancelled) { setRows(data); setLoadingGlobal(false); }
    })();
    return () => { cancelled = true; };
  }, [filter, userId, displayName, optedIn, myStats]);

  const isPt = language === 'pt';

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

      {filter === 'global' ? (
        <GlobalBoard
          isPt={isPt}
          userId={userId}
          optedIn={optedIn}
          onOptInChange={onOptInChange}
          rows={rows}
          loading={loadingGlobal}
        />
      ) : (
        <>
          <p className="text-[11px] text-white/40 mb-3">
            {isPt ? 'Os teus melhores dias de foco, ordenados por pomodoros concluídos.' : 'Your best focus days, ranked by completed pomodoros.'}
          </p>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {days.length === 0 ? (
              <EmptyState isPt={isPt} />
            ) : (
              <table className="w-full text-left text-xs text-white/70">
                <thead className="text-[10px] uppercase text-white/30 sticky top-0 bg-black/20">
                  <tr>
                    <th className="py-2 pl-2">#</th>
                    <th className="py-2">{isPt ? 'Dia' : 'Day'}</th>
                    <th className="py-2">{isPt ? 'Tempo de foco' : 'Focus time'}</th>
                    <th className="py-2 text-right pr-2">Pomodoros</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map((row, i) => (
                    <tr key={row.date} className={`border-b border-white/[0.05] hover:bg-white/[0.02] ${row.isToday ? 'bg-primary/10' : ''}`}>
                      <td className="py-3 pl-2 font-bold text-white/50">{medal(i)}</td>
                      <td className="py-3 capitalize">
                        {row.label}
                        {row.isToday && <span className="ml-2 text-[9px] font-black uppercase tracking-widest text-primary">{isPt ? 'Hoje' : 'Today'}</span>}
                      </td>
                      <td className="py-3 font-mono">{fmtTime(row.minutes)}</td>
                      <td className="py-3 text-right pr-2 font-bold text-primary">{row.pomodoros}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}

function EmptyState({ isPt }: { isPt: boolean }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-white/40">
      <Trophy size={36} className="text-white/20" />
      <p className="text-sm font-bold">{isPt ? 'Ainda sem sessões neste período' : 'No sessions in this period yet'}</p>
      <p className="text-xs max-w-xs">{isPt ? 'Conclui um pomodoro de foco para apareceres aqui.' : 'Complete a focus pomodoro to show up here.'}</p>
    </div>
  );
}

function GlobalBoard({ isPt, userId, optedIn, onOptInChange, rows, loading }: {
  isPt: boolean;
  userId?: string | null;
  optedIn: boolean;
  onOptInChange?: (v: boolean) => void;
  rows: LeaderboardRow[];
  loading: boolean;
}) {
  if (!userId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 text-white/40">
        <Globe size={36} className="text-white/20" />
        <p className="text-sm font-bold text-white/70">{isPt ? 'Entra para juntares-te ao ranking global' : 'Sign in to join the global leaderboard'}</p>
        <p className="text-xs max-w-xs flex items-center gap-1.5"><LogIn size={13} /> {isPt ? 'Precisas de uma conta para competir.' : 'You need an account to compete.'}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 mb-3 p-3 rounded-xl bg-white/[0.04] border border-white/5">
        <div className="min-w-0">
          <div className="text-[13px] font-bold text-white/80">{isPt ? 'Aparecer no ranking global' : 'Show me on the global board'}</div>
          <p className="text-[11px] text-white/40">{isPt ? 'Partilha o teu nome e pomodoros desta semana.' : 'Shares your name and this week’s pomodoros.'}</p>
        </div>
        <label className="relative inline-flex cursor-pointer shrink-0">
          <input type="checkbox" checked={optedIn} onChange={e => onOptInChange?.(e.target.checked)} className="sr-only peer" />
          <div className="w-10 h-6 bg-white/10 peer-checked:bg-primary/50 rounded-full transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="h-full flex items-center justify-center text-white/40"><Loader2 size={22} className="animate-spin" /></div>
        ) : rows.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-white/40">
            <Globe size={36} className="text-white/20" />
            <p className="text-sm font-bold">{isPt ? 'Ainda ninguém no ranking' : 'No one on the board yet'}</p>
            <p className="text-xs max-w-xs">{optedIn ? (isPt ? 'Conclui pomodoros para subires!' : 'Complete pomodoros to climb!') : (isPt ? 'Ativa a opção acima para apareceres.' : 'Turn on the toggle above to appear.')}</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs text-white/70">
            <thead className="text-[10px] uppercase text-white/30 sticky top-0 bg-black/20">
              <tr>
                <th className="py-2 pl-2">#</th>
                <th className="py-2">{isPt ? 'Utilizador' : 'User'}</th>
                <th className="py-2 text-right">{isPt ? 'Semana' : 'Week'}</th>
                <th className="py-2 text-right pr-2">{isPt ? 'Total' : 'All-time'}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.user_id} className={`border-b border-white/[0.05] hover:bg-white/[0.02] ${row.user_id === userId ? 'bg-primary/10' : ''}`}>
                  <td className="py-3 pl-2 font-bold text-white/50">{medal(i)}</td>
                  <td className="py-3 truncate max-w-[220px]">
                    {row.display_name}
                    {row.user_id === userId && <span className="ml-2 text-[9px] font-black uppercase tracking-widest text-primary">{isPt ? 'Tu' : 'You'}</span>}
                  </td>
                  <td className="py-3 text-right font-bold text-primary">{row.pomodoros_week}</td>
                  <td className="py-3 text-right pr-2 text-white/50">{row.pomodoros_total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
