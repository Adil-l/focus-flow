import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Lock } from 'lucide-react';
import { ACHIEVEMENTS, getLevelFromXP, TIER_COLORS, achName, achDesc } from '@/data/achievements';
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from '@/lib/i18n';

interface AchievementsPanelProps {
  xp: number;
  unlockedAchievements: string[];
}

type AchievementFilter = 'all' | 'unlocked' | 'locked' | 'leaderboard';

interface OnlineUserPresence {
  user_id: string;
  email?: string;
  xp?: number;
}

type PresenceState = Record<string, OnlineUserPresence[]>;

const FILTER_LABELS_PT: Record<AchievementFilter, string> = {
  all: 'Tudo',
  unlocked: 'Desbloqueados',
  locked: 'Bloqueados',
  leaderboard: 'Ranking',
};

export default function AchievementsPanel({ xp, unlockedAchievements }: AchievementsPanelProps) {
  const { t, language } = useTranslation();
  const [filter, setFilter] = useState<AchievementFilter>('all');
  const [onlineUsers, setOnlineUsers] = useState<OnlineUserPresence[]>([]);
  const levelInfo = getLevelFromXP(xp);

  useEffect(() => {
    const channel = createClient().channel('focus_room');
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState() as PresenceState;
      setOnlineUsers(Object.values(state).flat());
    }).subscribe();
    return () => { channel.unsubscribe(); };
  }, []);

  const filtered = ACHIEVEMENTS.filter(a => {
    if (filter === 'unlocked') return unlockedAchievements.includes(a.id);
    if (filter === 'locked') return !unlockedAchievements.includes(a.id);
    return true;
  });

  const getFilterLabel = (f: AchievementFilter) => {
    if (language === 'pt') {
      return FILTER_LABELS_PT[f];
    }
    return f;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="glass-panel p-6 w-[min(540px,92vw)] max-h-[85vh] flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            <Trophy size={16} className="text-yellow-400" />
          </div>
          <h3 className="font-semibold text-white text-base">{t.achievements}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Star size={14} className="text-yellow-400" />
          <span className="text-sm font-bold text-yellow-400">{xp} XP</span>
        </div>
      </div>

      <div className="flex gap-1 mb-3">
        {(['all', 'unlocked', 'locked', 'leaderboard'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              filter === f ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
            }`}>
            {getFilterLabel(f)}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1.5">
        <AnimatePresence mode="wait">
          {filter === 'leaderboard' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              {onlineUsers.length === 0 && <p className="text-center text-white/20 py-10">{language === 'pt' ? 'Ninguém online' : 'No focusers online'}</p>}
              {onlineUsers.map((u, i) => (
                <div key={u.user_id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04]">
                  <span className="text-sm font-bold text-white/30 w-6">#{i + 1}</span>
                  <div className="flex-1 text-sm text-white/80">{u.email ?? u.user_id}</div>
                  <span className="text-xs font-bold text-primary">{u.xp ?? 0} XP</span>
                </div>
              ))}
            </motion.div>
          ) : (
            filtered.map(a => {
              const unlocked = unlockedAchievements.includes(a.id);
              return (
                <motion.div key={a.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={`flex items-center gap-3 p-3 rounded-xl ${unlocked ? 'bg-white/[0.06]' : 'bg-white/[0.02] opacity-50'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${unlocked ? `bg-gradient-to-br ${TIER_COLORS[a.tier]}` : 'bg-white/[0.06]'}`}>
                    {unlocked ? a.icon : <Lock size={14} className="text-white/30" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${unlocked ? 'text-white' : 'text-white/50'}`}>{achName(a, language === 'pt')}</p>
                    <p className="text-xs text-white/30 truncate">{achDesc(a, language === 'pt')}</p>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}