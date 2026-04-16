import { motion } from 'framer-motion';
import { Target, TrendingUp } from 'lucide-react';
import type { Goals } from '@/stores/goalsStore';

interface GoalsPanelProps {
  goals: Goals;
  todayMinutes: number;
  todaySessions: number;
  weekMinutes: number;
  weekSessions: number;
}

function ProgressRing({ progress, size = 60, stroke = 4, color = 'hsl(270 80% 65%)' }: { progress: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(progress, 100) / 100);
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(0 0% 100% / 0.06)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
    </svg>
  );
}

export default function GoalsPanel({ goals, todayMinutes, todaySessions, weekMinutes, weekSessions }: GoalsPanelProps) {
  const dailyMinPct = goals.dailyMinutes > 0 ? (todayMinutes / goals.dailyMinutes) * 100 : 0;
  const dailySesPct = goals.dailySessions > 0 ? (todaySessions / goals.dailySessions) * 100 : 0;
  const weekMinPct = goals.weeklyMinutes > 0 ? (weekMinutes / goals.weeklyMinutes) * 100 : 0;
  const weekSesPct = goals.weeklySessions > 0 ? (weekSessions / goals.weeklySessions) * 100 : 0;

  const items = [
    { label: 'Daily Focus', value: `${todayMinutes}/${goals.dailyMinutes} min`, pct: dailyMinPct, color: 'hsl(270 80% 65%)' },
    { label: 'Daily Sessions', value: `${todaySessions}/${goals.dailySessions}`, pct: dailySesPct, color: 'hsl(340 70% 55%)' },
    { label: 'Weekly Focus', value: `${weekMinutes}/${goals.weeklyMinutes} min`, pct: weekMinPct, color: 'hsl(200 80% 55%)' },
    { label: 'Weekly Sessions', value: `${weekSessions}/${goals.weeklySessions}`, pct: weekSesPct, color: 'hsl(145 65% 46%)' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="glass-panel p-8 w-[900px] max-h-[85vh] flex flex-col"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
          <Target size={16} className="text-green-400" />
        </div>
        <h3 className="font-semibold text-white text-base">Goals</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map(item => (
          <div key={item.label} className="flex flex-col items-center p-3 rounded-xl bg-white/[0.04]">
            <div className="relative mb-2">
              <ProgressRing progress={item.pct} color={item.color} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{Math.min(100, Math.round(item.pct))}%</span>
              </div>
            </div>
            <p className="text-[11px] font-medium text-white/70">{item.label}</p>
            <p className="text-[10px] text-white/40">{item.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
