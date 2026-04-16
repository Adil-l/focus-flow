import { Flame, Home, Lightbulb, Settings, Maximize, ListTodo, Music, FileText, Trophy, Target, BarChart3, Medal, Keyboard, Zap, Users } from 'lucide-react';

export type PanelView = 'none' | 'tasks' | 'sounds' | 'notepad' | 'achievements' | 'goals' | 'heatmap' | 'focusroom' | 'leaderboard';
export type DashboardMode = 'home' | 'focus' | 'ambient';

interface BottomBarProps {
  streak: number;
  activePanel: PanelView;
  mode: DashboardMode;
  level: number;
  xp: number;
  onPanelChange: (panel: PanelView) => void;
  onModeChange: (mode: DashboardMode) => void;
  onFullscreen: () => void;
  onOpenSettings: () => void;
  onToggleFocus?: () => void;
}

export default function BottomBar({
  streak, activePanel, mode, level, xp, onPanelChange, onModeChange, onFullscreen, onOpenSettings, onToggleFocus,
}: BottomBarProps) {
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
          { id: 'tasks' as PanelView, icon: ListTodo, label: 'Tasks (T)' },
          { id: 'sounds' as PanelView, icon: Music, label: 'Sounds (M)' },
          { id: 'notepad' as PanelView, icon: FileText, label: 'Notepad (N)' },
          { id: 'focusroom' as PanelView, icon: Users, label: 'Focus Room' },
          { id: 'goals' as PanelView, icon: Target, label: 'Goals' },
          { id: 'achievements' as PanelView, icon: Trophy, label: 'Achievements' },
          { id: 'heatmap' as PanelView, icon: BarChart3, label: 'Heatmap' },
          { id: 'leaderboard' as PanelView, icon: Medal, label: 'Leaderboard' },
        ]).map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => togglePanel(id)} className={iconBtn(activePanel === id)} title={label}>
            <Icon size={18} />
          </button>
        ))}
      </div>

      {/* Right nav */}
      <div className="flex gap-2 pointer-events-auto">
        {/* Mode switcher */}
        <div className="flex gap-1 bg-white/[0.06] rounded-xl p-1">
          {(['home', 'focus', 'ambient'] as DashboardMode[]).map(m => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border ${
                mode === m 
                  ? 'bg-primary/20 text-white border-primary/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
                  : 'bg-white/[0.06] text-white/40 border-transparent hover:text-white/60'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Streak */}
        <div className={`${iconBtn(false)} gap-1 px-3 w-auto`}>
          <Flame size={16} className="text-orange-400" />
          <span className="text-xs font-bold text-orange-400">{streak}</span>
        </div>

        <button onClick={onOpenSettings} className={iconBtn(false)} title="Settings (,)">
          <Settings size={18} />
        </button>

        <button onClick={onFullscreen} className={iconBtn(false)} title="Fullscreen (F)">
          <Maximize size={18} />
        </button>

        <button onClick={onToggleFocus} className={`${iconBtn(false)} bg-primary/20 text-primary hover:bg-primary/30 ml-2`} title="Focus Mode (Z)">
          <Zap size={18} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}
