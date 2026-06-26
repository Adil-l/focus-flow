export interface Achievement {
  id: string;
  name: string;
  namePt: string;
  description: string;
  descPt: string;
  icon: string;
  condition: (stats: AchievementStats) => boolean;
  xpReward: number;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
}

export interface AchievementStats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  tasksCompleted: number;
  level: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Session milestones
  { id: 'first-focus', name: 'First Focus', namePt: 'Primeiro Foco', description: 'Complete your first focus session', descPt: 'Conclua sua primeira sessão de foco', icon: '🌱', condition: s => s.totalSessions >= 1, xpReward: 10, tier: 'bronze' },
  { id: 'getting-started', name: 'Getting Started', namePt: 'Começando', description: 'Complete 10 focus sessions', descPt: 'Conclua 10 sessões de foco', icon: '🔥', condition: s => s.totalSessions >= 10, xpReward: 50, tier: 'bronze' },
  { id: 'focused-mind', name: 'Focused Mind', namePt: 'Mente Focada', description: 'Complete 50 focus sessions', descPt: 'Conclua 50 sessões de foco', icon: '🧠', condition: s => s.totalSessions >= 50, xpReward: 150, tier: 'silver' },
  { id: 'productivity-machine', name: 'Productivity Machine', namePt: 'Máquina de Produtividade', description: 'Complete 100 sessions', descPt: 'Conclua 100 sessões', icon: '⚙️', condition: s => s.totalSessions >= 100, xpReward: 300, tier: 'silver' },
  { id: 'focus-master', name: 'Focus Master', namePt: 'Mestre do Foco', description: 'Complete 500 sessions', descPt: 'Conclua 500 sessões', icon: '👑', condition: s => s.totalSessions >= 500, xpReward: 1000, tier: 'gold' },
  { id: 'legendary', name: 'Legendary', namePt: 'Lendário', description: 'Complete 1000 sessions', descPt: 'Conclua 1000 sessões', icon: '💎', condition: s => s.totalSessions >= 1000, xpReward: 2500, tier: 'diamond' },

  // Time milestones
  { id: 'one-hour', name: 'First Hour', namePt: 'Primeira Hora', description: 'Accumulate 1 hour of focus', descPt: 'Acumule 1 hora de foco', icon: '⏰', condition: s => s.totalMinutes >= 60, xpReward: 25, tier: 'bronze' },
  { id: 'ten-hours', name: 'Dedicated', namePt: 'Dedicado', description: 'Accumulate 10 hours of focus', descPt: 'Acumule 10 horas de foco', icon: '📚', condition: s => s.totalMinutes >= 600, xpReward: 200, tier: 'silver' },
  { id: 'hundred-hours', name: 'Century Club', namePt: 'Clube das 100 Horas', description: 'Accumulate 100 hours of focus', descPt: 'Acumule 100 horas de foco', icon: '🏆', condition: s => s.totalMinutes >= 6000, xpReward: 1500, tier: 'gold' },
  { id: 'thousand-hours', name: '1000 Hours', namePt: '1000 Horas', description: 'Accumulate 1000 hours of focus', descPt: 'Acumule 1000 horas de foco', icon: '🌟', condition: s => s.totalMinutes >= 60000, xpReward: 5000, tier: 'diamond' },

  // Streak milestones
  { id: 'streak-3', name: 'On a Roll', namePt: 'Embalado', description: '3 day streak', descPt: 'Sequência de 3 dias', icon: '🔥', condition: s => s.currentStreak >= 3, xpReward: 30, tier: 'bronze' },
  { id: 'streak-7', name: 'Weekly Warrior', namePt: 'Guerreiro Semanal', description: '7 day streak', descPt: 'Sequência de 7 dias', icon: '⚡', condition: s => s.currentStreak >= 7, xpReward: 100, tier: 'silver' },
  { id: 'streak-30', name: 'Monthly Master', namePt: 'Mestre Mensal', description: '30 day streak', descPt: 'Sequência de 30 dias', icon: '🌙', condition: s => s.currentStreak >= 30, xpReward: 500, tier: 'gold' },
  { id: 'streak-100', name: 'Unstoppable', namePt: 'Imparável', description: '100 day streak', descPt: 'Sequência de 100 dias', icon: '💫', condition: s => s.currentStreak >= 100, xpReward: 2000, tier: 'diamond' },

  // Tasks
  { id: 'task-1', name: 'Task Slayer', namePt: 'Caçador de Tarefas', description: 'Complete your first task', descPt: 'Conclua sua primeira tarefa', icon: '✅', condition: s => s.tasksCompleted >= 1, xpReward: 15, tier: 'bronze' },
  { id: 'task-25', name: 'Task Master', namePt: 'Mestre das Tarefas', description: 'Complete 25 tasks', descPt: 'Conclua 25 tarefas', icon: '📋', condition: s => s.tasksCompleted >= 25, xpReward: 200, tier: 'silver' },
  { id: 'task-100', name: 'Completionist', namePt: 'Completista', description: 'Complete 100 tasks', descPt: 'Conclua 100 tarefas', icon: '🎯', condition: s => s.tasksCompleted >= 100, xpReward: 750, tier: 'gold' },

  // Level
  { id: 'level-5', name: 'Rising Star', namePt: 'Estrela em Ascensão', description: 'Reach level 5', descPt: 'Alcance o nível 5', icon: '⭐', condition: s => s.level >= 5, xpReward: 100, tier: 'bronze' },
  { id: 'level-10', name: 'Expert', namePt: 'Especialista', description: 'Reach level 10', descPt: 'Alcance o nível 10', icon: '🌟', condition: s => s.level >= 10, xpReward: 300, tier: 'silver' },
  { id: 'level-25', name: 'Grandmaster', namePt: 'Grão-Mestre', description: 'Reach level 25', descPt: 'Alcance o nível 25', icon: '💎', condition: s => s.level >= 25, xpReward: 1000, tier: 'gold' },
];

export const LEVEL_THRESHOLDS = [
  0, 50, 120, 210, 320, 450, 600, 780, 1000, 1260,       // 1-10
  1560, 1900, 2300, 2760, 3280, 3880, 4560, 5340, 6220, 7200, // 11-20
  8300, 9520, 10880, 12380, 14040, 15880, 17900, 20120, 22560, 25240, // 21-30
];

export function getLevelFromXP(xp: number): { level: number; currentXP: number; xpForNext: number; progress: number } {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  const currentLevelXP = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextLevelXP = LEVEL_THRESHOLDS[level] || currentLevelXP + 1000;
  const progress = Math.min(100, ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);
  return { level, currentXP: xp - currentLevelXP, xpForNext: nextLevelXP - currentLevelXP, progress };
}

export const TIER_COLORS: Record<string, string> = {
  bronze: 'from-amber-700 to-amber-500',
  silver: 'from-gray-400 to-gray-200',
  gold: 'from-yellow-500 to-yellow-300',
  diamond: 'from-cyan-400 to-blue-300',
};

export const achName = (a: Achievement, pt: boolean) => pt ? a.namePt : a.name;
export const achDesc = (a: Achievement, pt: boolean) => pt ? a.descPt : a.description;
