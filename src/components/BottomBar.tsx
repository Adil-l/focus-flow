import { Flame, Home, Lightbulb, Settings, Maximize, ListTodo, Music, FileText, BarChart3 } from 'lucide-react';

export type PanelView = 'none' | 'tasks' | 'sounds' | 'notepad' | 'stats' | 'settings';
export type DashboardMode = 'home' | 'focus' | 'ambient';

interface BottomBarProps {
  streak: number;
  activePanel: PanelView;
  mode: DashboardMode;
  onPanelChange: (panel: PanelView) => void;
  onModeChange: (mode: DashboardMode) => void;
  onFullscreen: () => void;
}

export default function BottomBar({
  streak, activePanel, mode, onPanelChange, onModeChange, onFullscreen,
}: BottomBarProps) {
  const togglePanel = (panel: PanelView) => {
    onPanelChange(activePanel === panel ? 'none' : panel);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="glass-subtle border-t border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
          {/* Left: widgets */}
          <div className="flex items-center gap-1">
            {[
              { id: 'tasks' as PanelView, icon: ListTodo, label: 'Tarefas' },
              { id: 'sounds' as PanelView, icon: Music, label: 'Sons' },
              { id: 'notepad' as PanelView, icon: FileText, label: 'Notas' },
              { id: 'stats' as PanelView, icon: BarChart3, label: 'Stats' },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => togglePanel(id)}
                title={label}
                className={`p-2.5 rounded-lg transition-all ${
                  activePanel === id ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>

          {/* Right: nav */}
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5 text-streak mr-2">
              <Flame size={16} />
              <span className="text-xs font-bold">{streak}</span>
            </div>

            {[
              { id: 'home' as DashboardMode, icon: Home },
              { id: 'focus' as DashboardMode, icon: Lightbulb },
            ].map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onModeChange(id)}
                className={`p-2.5 rounded-lg transition-all ${
                  mode === id ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={18} />
              </button>
            ))}

            <button
              onClick={() => togglePanel('settings')}
              className={`p-2.5 rounded-lg transition-all ${
                activePanel === 'settings' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Settings size={18} />
            </button>

            <button
              onClick={onFullscreen}
              className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground transition-all"
            >
              <Maximize size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
