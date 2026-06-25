import { Bell, PartyPopper, LayoutDashboard } from 'lucide-react';
import { useGoals, getTodayProgress, getWeekProgress } from '@/stores/goalsStore';
import type { Settings, HistoryEntry } from '@/stores/pomodoroStore';
import { SectionHeader, Toggle } from './_shared';

const GOAL_INPUTS = [
  { key: 'dailySessions' as const, label: 'Daily sessions', min: 1, max: 20, unit: '', icon: '🎯' },
  { key: 'dailyMinutes' as const, label: 'Daily minutes', min: 15, max: 480, unit: 'm', icon: '⏱️' },
  { key: 'weeklySessions' as const, label: 'Weekly sessions', min: 5, max: 100, unit: '', icon: '📅' },
  { key: 'weeklyMinutes' as const, label: 'Weekly minutes', min: 60, max: 2400, unit: 'm', icon: '🔥' },
];

const pct = (done: number, target: number) => (target > 0 ? Math.min(100, Math.round((done / target) * 100)) : 0);

export default function GoalsSection({
  title,
  subtitle,
  history,
  settings,
  onUpdate,
}: {
  title: string;
  subtitle: string;
  history: HistoryEntry[];
  settings: Settings;
  onUpdate: (update: Partial<Settings>) => void;
}) {
  const { goals, setGoals } = useGoals();
  const today = getTodayProgress(history);
  const week = getWeekProgress(history);

  return (
    <div className="space-y-6">
      <SectionHeader title={title} subtitle={subtitle} />

      {/* Real progress */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-purple-500/15 to-violet-500/5 rounded-2xl p-4 border border-purple-500/20">
          <div className="text-[10px] font-black text-purple-400/60 uppercase tracking-[0.2em] mb-1">Today</div>
          <div className="text-2xl font-black text-white mb-0.5">{today.sessions}/{goals.dailySessions}</div>
          <div className="text-[11px] text-white/40">sessions · {today.minutes}/{goals.dailyMinutes}m</div>
          <div className="mt-3 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all" style={{ width: `${pct(today.sessions, goals.dailySessions)}%` }} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/15 to-green-500/5 rounded-2xl p-4 border border-emerald-500/20">
          <div className="text-[10px] font-black text-emerald-400/60 uppercase tracking-[0.2em] mb-1">This week</div>
          <div className="text-2xl font-black text-white mb-0.5">{week.sessions}/{goals.weeklySessions}</div>
          <div className="text-[11px] text-white/40">sessions · {week.minutes}/{goals.weeklyMinutes}m</div>
          <div className="mt-3 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all" style={{ width: `${pct(week.sessions, goals.weeklySessions)}%` }} />
          </div>
        </div>
      </div>

      {/* Goal targets (compact grid) */}
      <div>
        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1 mb-3">Set your targets</div>
        <div className="grid grid-cols-2 gap-3">
          {GOAL_INPUTS.map(goal => (
            <div key={goal.key} className="bg-white/[0.04] rounded-2xl p-4 border border-white/[0.05]">
              <div className="flex justify-between items-center mb-3">
                <span className="flex items-center gap-2 text-xs font-bold text-white/70"><span className="text-lg">{goal.icon}</span>{goal.label}</span>
                <span className="text-lg font-black text-white">{goals[goal.key]}{goal.unit}</span>
              </div>
              <input
                type="range"
                min={goal.min}
                max={goal.max}
                step={goal.key.includes('Minutes') ? 15 : 1}
                value={goals[goal.key]}
                onChange={e => setGoals({ [goal.key]: parseInt(e.target.value) })}
                aria-label={goal.label}
                className="w-full accent-primary h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Functional options */}
      <div className="space-y-3">
        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">When you hit a goal</div>
        <Toggle
          icon={<Bell size={16} />}
          label="Notify me"
          desc="Send a browser notification when the daily goal is reached."
          checked={settings.goalNotify}
          onChange={v => onUpdate({ goalNotify: v })}
        />
        <Toggle
          icon={<PartyPopper size={16} />}
          label="Celebrate"
          desc="Confetti when you complete the daily goal."
          checked={settings.goalCelebrate}
          onChange={v => onUpdate({ goalCelebrate: v })}
        />
        <Toggle
          icon={<LayoutDashboard size={16} />}
          label="Show on dashboard"
          desc="Display today's goal progress under the clock."
          checked={settings.goalShowOnDashboard}
          onChange={v => onUpdate({ goalShowOnDashboard: v })}
        />
      </div>
    </div>
  );
}
