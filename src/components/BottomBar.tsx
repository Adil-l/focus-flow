import { Flame, Home, Lightbulb, Leaf, Settings, Maximize, ListTodo, FileText, Trophy, Target, BarChart3, Medal, Keyboard, Zap, Users, User, Music, Gem, Share2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import type { AppMode } from '@/stores/modeStore';

export type PanelView = 'none' | 'tasks' | 'notepad' | 'achievements' | 'goals' | 'heatmap' | 'focusroom' | 'leaderboard' | 'sounds' | 'pricing';

interface BottomBarProps {
  streak: number;
  activePanel: PanelView;
  level: number;
  xp: number;
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onPanelChange: (panel: PanelView) => void;
  onFullscreen: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onShare: () => void;
}

export default function BottomBar({
  streak, activePanel, level, xp, mode, onModeChange, onPanelChange, onFullscreen, onOpenSettings, onOpenAuth, onShare,
}: BottomBarProps) {
  const { t } = useTranslation();
  const togglePanel = (panel: PanelView) => {
    onPanelChange(activePanel === panel ? 'none' : panel);
  };

  const iconBtn = (active: boolean) =>
    `w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
      active ? 'bg-primary/25 text-white' : 'bg-white/[0.06] text-white/50 hover:text-white/80 hover:bg-white/[0.1]'
    }`;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex items-end justify-between pointer-events-none">
      {/* Left widgets */}
      <div className="flex gap-2 pointer-events-auto">
        {([
          { id: 'tasks' as PanelView, icon: ListTodo, label: t.tasks },
          { id: 'sounds' as PanelView, icon: Music, label: t.language === 'pt' ? 'Sons' : 'Sounds' },
          { id: 'notepad' as PanelView, icon: FileText, label: t.notepad },
          { id: 'focusroom' as PanelView, icon: Users, label: t.focusRoom },
          { id: 'goals' as PanelView, icon: Target, label: t.goals },
          { id: 'achievements' as PanelView, icon: Trophy, label: t.achievements },
          { id: 'heatmap' as PanelView, icon: BarChart3, label: t.heatmap },
           { id: 'leaderboard' as PanelView, icon: Medal, label: t.leaderboard },
           { id: 'pricing' as PanelView, icon: Gem, label: t.language === 'pt' ? 'Planos' : 'Pricing' },
         ]).map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => togglePanel(id)} className={iconBtn(activePanel === id) + ' border border-white/20'} title={label}>
            <Icon size={18} />
          </button>
        ))}
      </div>

      {/* Right nav */}
      <div className="flex gap-2 pointer-events-auto">
        {/* Streak */}
        <div className={`${iconBtn(false)} gap-1 px-3 w-auto`}>
          <Flame size={16} className="text-orange-400" />
          <span className="text-xs font-bold text-orange-400">{streak}</span>
        </div>

        {/* Mode switcher: ambient / home / focus */}
        <div className="flex gap-1 bg-white/[0.06] border border-white/20 rounded-xl p-1">
          {([
            { id: 'ambient' as AppMode, icon: Leaf, label: t.language === 'pt' ? 'Ambiente' : 'Ambient' },
            { id: 'home' as AppMode, icon: Home, label: 'Home' },
            { id: 'focus' as AppMode, icon: Lightbulb, label: 'Focus' },
          ]).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => onModeChange(id)}
              title={label}
              aria-label={label}
              aria-pressed={mode === id}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                mode === id ? 'bg-primary/30 text-white' : 'text-white/50 hover:text-white/80'
              }`}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        <button onClick={onShare} className={iconBtn(false)} title={t.language === 'pt' ? 'Partilhar' : 'Share'}>
          <Share2 size={18} />
        </button>

        <button onClick={onOpenSettings} className={iconBtn(false)} title={t.settings}>
          <Settings size={18} />
        </button>

        <button onClick={onOpenAuth} className={iconBtn(false)} title={t.language === 'en' ? 'Login' : 'Entrar'}>
          <User size={18} />
        </button>

        <button onClick={onFullscreen} className={iconBtn(false)} title={t.fullscreen}>
          <Maximize size={18} />
        </button>
      </div>
    </div>
  );
}
