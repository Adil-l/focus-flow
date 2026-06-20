import { Flame, Home, Lightbulb, Settings, Maximize, ListTodo, FileText, Trophy, Target, BarChart3, Medal, Keyboard, Zap, Users, User, Music, Gem } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export type PanelView = 'none' | 'tasks' | 'notepad' | 'achievements' | 'goals' | 'heatmap' | 'focusroom' | 'leaderboard' | 'sounds' | 'pricing';
export type DashboardMode = 'home';

interface BottomBarProps {
  streak: number;
  activePanel: PanelView;
  level: number;
  xp: number;
  onPanelChange: (panel: PanelView) => void;
  onFullscreen: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
}

export default function BottomBar({
  streak, activePanel, level, xp, onPanelChange, onFullscreen, onOpenSettings, onOpenAuth,
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
