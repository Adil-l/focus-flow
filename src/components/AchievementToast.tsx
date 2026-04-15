import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import { TIER_COLORS, type Achievement } from '@/data/achievements';

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export default function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[200]"
        >
          <div className="glass-panel px-6 py-4 flex items-center gap-4 min-w-[320px]">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br ${TIER_COLORS[achievement.tier]}`}>
              {achievement.icon}
            </div>
            <div className="flex-1">
              <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wider">Achievement Unlocked!</p>
              <p className="text-sm font-bold text-white mt-0.5">{achievement.name}</p>
              <p className="text-xs text-white/40">{achievement.description} · +{achievement.xpReward} XP</p>
            </div>
            <button onClick={onDismiss} className="text-white/30 hover:text-white/60">
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
