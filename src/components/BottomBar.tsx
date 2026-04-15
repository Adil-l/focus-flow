import { Flame, Home, Lightbulb, Settings, Maximize, ListTodo, Music, FileText, Gift } from 'lucide-react';

export type PanelView = 'none' | 'tasks' | 'sounds' | 'notepad';
export type DashboardMode = 'home' | 'focus' | 'ambient';

interface BottomBarProps {
  streak: number;
  activePanel: PanelView;
  mode: DashboardMode;
  onPanelChange: (panel: PanelView) => void;
  onModeChange: (mode: DashboardMode) => void;
  onFullscreen: () => void;
  onOpenSettings: () => void;
}

export default function BottomBar({
  streak, activePanel, mode, onPanelChange, onModeChange, onFullscreen, onOpenSettings,
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
          { id: 'tasks' as PanelView, icon: ListTodo },
          { id: 'sounds' as PanelView, icon: Music },
          { id: 'notepad' as PanelView, icon: FileText },
        ]).map(({ id, icon: Icon }) => (
          <button key={id} onClick={() => togglePanel(id)} className={iconBtn(activePanel === id)}>
            <Icon size={18} />
          </button>
        ))}
      </div>

      {/* Right nav */}
      <div className="flex gap-2 pointer-events-auto">
        <div className={`${iconBtn(false)} gap-1 px-3 w-auto`}>
          <Flame size={16} className="text-orange-400" />
          <span className="text-xs font-bold text-orange-400">{streak}</span>
        </div>

        {([
          { id: 'home' as DashboardMode, icon: Home },
          { id: 'focus' as DashboardMode, icon: Lightbulb },
        ]).map(({ id, icon: Icon }) => (
          <button key={id} onClick={() => onModeChange(id)} className={iconBtn(mode === id)}>
            <Icon size={18} />
          </button>
        ))}

        <button onClick={() => {}} className={iconBtn(false)}>
          <Gift size={18} />
        </button>

        <button onClick={onOpenSettings} className={iconBtn(false)}>
          <Settings size={18} />
        </button>

        <button onClick={onFullscreen} className={iconBtn(false)}>
          <Maximize size={18} />
        </button>
      </div>
    </div>
  );
}
