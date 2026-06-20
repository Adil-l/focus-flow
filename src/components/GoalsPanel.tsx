import { motion } from 'framer-motion';
import { Target, TrendingUp, Calendar, Zap, Clock, Trophy } from 'lucide-react';
import type { Goals } from '@/stores/goalsStore';
import { useTranslation } from '@/lib/i18n';

interface GoalsPanelProps {
  goals: Goals;
  todayMinutes: number;
  todaySessions: number;
  weekMinutes: number;
  weekSessions: number;
}

function ProgressRing({ progress, size = 70, stroke = 5, color = 'hsl(270 80% 65%)' }: { progress: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(progress, 100) / 100);
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(0 0% 100% / 0.06)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }} />
    </svg>
  );
}

export default function GoalsPanel({ goals, todayMinutes, todaySessions, weekMinutes, weekSessions }: GoalsPanelProps) {
  const { t } = useTranslation();
  const dailyMinPct = goals.dailyMinutes > 0 ? (todayMinutes / goals.dailyMinutes) * 100 : 0;
  const dailySesPct = goals.dailySessions > 0 ? (todaySessions / goals.dailySessions) * 100 : 0;
  const weekMinPct = goals.weeklyMinutes > 0 ? (weekMinutes / goals.weeklyMinutes) * 100 : 0;
  const weekSesPct = goals.weeklySessions > 0 ? (weekSessions / goals.weeklySessions) * 100 : 0;

  const cards = [
    { 
      id: 'daily-focus',
      label: t.language === 'en' ? 'Daily Focus' : 'Foco Diário', 
      current: todayMinutes, 
      target: goals.dailyMinutes, 
      unit: 'min',
      pct: dailyMinPct, 
      color: 'text-purple-400',
      stroke: 'hsl(270 80% 65%)',
      icon: Clock
    },
    { 
      id: 'daily-sessions',
      label: t.language === 'en' ? 'Daily Sessions' : 'Sessões Diárias', 
      current: todaySessions, 
      target: goals.dailySessions, 
      unit: '',
      pct: dailySesPct, 
      color: 'text-pink-400',
      stroke: 'hsl(340 70% 55%)',
      icon: Zap
    },
    { 
      id: 'weekly-focus',
      label: t.language === 'en' ? 'Weekly Focus' : 'Foco Semanal', 
      current: weekMinutes, 
      target: goals.weeklyMinutes, 
      unit: 'min',
      pct: weekMinPct, 
      color: 'text-blue-400',
      stroke: 'hsl(200 80% 55%)',
      icon: Calendar
    },
    { 
      id: 'weekly-sessions',
      label: t.language === 'en' ? 'Weekly Sessions' : 'Sessões Semanais', 
      current: weekSessions, 
      target: goals.weeklySessions, 
      unit: '',
      pct: weekSesPct, 
      color: 'text-emerald-400',
      stroke: 'hsl(145 65% 46%)',
      icon: Trophy
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="glass-panel p-8 w-[900px] max-h-[85vh] flex flex-col gap-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Target size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg tracking-tight">{t.goals}</h3>
            <p className="text-xs text-white/40 uppercase tracking-widest font-medium">
              {t.language === 'en' ? 'Progress Overview' : 'Visão Geral do Progresso'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/5">
          <TrendingUp size={14} className="text-primary" />
          <span className="text-xs font-bold text-white/60">
            {t.language === 'en' ? 'Active Streak' : 'Sequência Ativa'}: 7d
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {cards.map(card => (
          <motion.div 
            key={card.id}
            whileHover={{ y: -2 }}
            className="bg-white/[0.03] border border-white/[0.06] rounded-[24px] p-5 flex items-center gap-5 transition-all hover:bg-white/[0.06] hover:border-white/[0.1]"
          >
            <div className="relative flex-shrink-0">
              <ProgressRing progress={card.pct} color={card.stroke} size={70} stroke={6} />
              <div className="absolute inset-0 flex items-center justify-center">
                <card.icon size={20} className={`${card.color} opacity-80`} />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-1">{card.label}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white tracking-tighter">
                  {card.current}
                </span>
                <span className="text-xs font-bold text-white/20">
                  / {card.target}{card.unit}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full opacity-50`} 
                    style={{ backgroundColor: card.stroke, width: `${Math.min(card.pct, 100)}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(card.pct, 100)}%` }}
                  />
                </div>
                <span className={`text-[10px] font-black ${card.color}`}>
                  {Math.round(card.pct)}%
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-2 p-5 rounded-[24px] bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-2xl">
            🚀
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              {t.language === 'en' ? 'Keep it up!' : 'Continue assim!'}
            </h4>
            <p className="text-xs text-white/50">
              {t.language === 'en' 
                ? 'You are closer to your weekly focus goal than yesterday.' 
                : 'Você está mais perto da sua meta semanal do que ontem.'}
            </p>
          </div>
        </div>
        <div className="h-8 w-[1px] bg-white/10" />
        <div className="text-right">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">
            {t.language === 'en' ? 'Estimated completion' : 'Conclusão estimada'}
          </p>
          <p className="text-xs font-black text-primary">2 {t.language === 'en' ? 'days' : 'dias'}</p>
        </div>
      </div>
    </motion.div>
  );
}
