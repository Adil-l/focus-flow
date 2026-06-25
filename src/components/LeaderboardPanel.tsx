import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

type LeaderboardFilter = 'today' | 'week' | 'month' | 'global';

interface LeaderboardEntry {
  id: number;
  user: string;
  date: string;
  time: string;
  pomodoros: number;
}

const MOCK_DATA: LeaderboardEntry[] = [
  { id: 1, user: "MARIA DEL ROSARIO DUARTE", date: "20.01.1970", time: "11:40", pomodoros: 22 },
  { id: 2, user: "Suni A.", date: "19.01.1970", time: "11:22", pomodoros: 10 },
  { id: 3, user: "scoop night", date: "19.01.1970", time: "10:40", pomodoros: 64 },
  { id: 4, user: "Легнид Григорович", date: "18.01.1970", time: "09:10", pomodoros: 11 },
  { id: 5, user: "Gal Shoham", date: "20.01.1970", time: "09:07", pomodoros: 4 },
];

const FILTER_LABELS_PT: Record<LeaderboardFilter, string> = {
  today: 'Hoje',
  week: 'Semana',
  month: 'Mês',
  global: 'Global',
};

export default function LeaderboardPanel() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<LeaderboardFilter>('today');

  const getFilterLabel = (f: LeaderboardFilter) => {
    if (t.language === 'pt') {
      return FILTER_LABELS_PT[f];
    }
    return f;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="glass-panel p-6 w-[min(680px,92vw)] h-[80vh] flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white text-base flex items-center gap-2">
          <BarChart3 size={18} className="text-primary" /> {t.leaderboard}
          <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
            {t.language === 'pt' ? 'Demonstração' : 'Demo'}
          </span>
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

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <table className="w-full text-left text-xs text-white/70">
          <thead className="text-[10px] uppercase text-white/30 sticky top-0 bg-black/20">
            <tr>
              <th className="py-2 pl-2">#</th>
              <th className="py-2">{t.language === 'en' ? 'User' : 'Usuário'}</th>
              <th className="py-2">{t.language === 'en' ? 'Time' : 'Tempo'}</th>
              <th className="py-2 text-right pr-2">Pomodoros</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_DATA.map((row, i) => (
              <tr key={row.id} className="border-b border-white/[0.05] hover:bg-white/[0.02]">
                <td className="py-3 pl-2 font-bold text-white/50">{i + 1}</td>
                <td className="py-3">{row.user}</td>
                <td className="py-3 font-mono">{row.time}</td>
                <td className="py-3 text-right pr-2 font-bold text-primary">{row.pomodoros}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}