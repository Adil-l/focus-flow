import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Lock } from 'lucide-react';
import { ACHIEVEMENTS, getLevelFromXP, TIER_COLORS, type Achievement } from '@/data/achievements';

interface AchievementsPanelProps {
  xp: number;
  unlockedAchievements: string[];
}

export default function AchievementsPanel({ xp, unlockedAchievements }: AchievementsPanelProps) {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const levelInfo = getLevelFromXP(xp);

  const filtered = ACHIEVEMENTS.filter(a => {
    if (filter === 'unlocked') return unlockedAchievements.includes(a.id);
    if (filter === 'locked') return !unlockedAchievements.includes(a.id);
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="glass-panel p-5 w-[420px] max-h-[500px] flex flex-col"
    >
      {/* Header with level */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            <Trophy size={16} className="text-yellow-400" />
          </div>
          <h3 className="font-semibold text-white text-base">Achievements</h3>
        </div>
        <div className="flex items-center gap-2">
          <Star size={14} className="text-yellow-400" />
          <span className="text-sm font-bold text-yellow-400">{xp} XP</span>
        </div>
      </div>

      {/* Level bar */}
      <div className="mb-4 p-3 rounded-xl bg-white/[0.04]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-white">Level {levelInfo.level}</span>
          <span className="text-xs text-white/40">{levelInfo.currentXP}/{levelInfo.xpForNext} XP</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${levelInfo.progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1 mb-3">
        {(['all', 'unlocked', 'locked'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              filter === f ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
            }`}>
            {f} {f === 'unlocked' ? `(${unlockedAchievements.length})` : f === 'all' ? `(${ACHIEVEMENTS.length})` : ''}
          </button>
        ))}
      </div>

      {/* Achievement list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1.5">
        <AnimatePresence>
          {filtered.map(a => {
            const unlocked = unlockedAchievements.includes(a.id);
            return (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  unlocked ? 'bg-white/[0.06]' : 'bg-white/[0.02] opacity-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                  unlocked ? `bg-gradient-to-br ${TIER_COLORS[a.tier]}` : 'bg-white/[0.06]'
                }`}>
                  {unlocked ? a.icon : <Lock size={14} className="text-white/30" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${unlocked ? 'text-white' : 'text-white/50'}`}>{a.name}</p>
                  <p className="text-xs text-white/30 truncate">{a.description}</p>
                </div>
                <span className="text-xs font-semibold text-yellow-400/70">+{a.xpReward} XP</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
