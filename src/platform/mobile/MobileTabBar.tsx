import { Home, ListTodo, Timer, Music, Menu } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import type { AppMode } from '@/stores/modeStore';
import type { PanelView } from '@/components/BottomBar';

// Mobile primary navigation — a fixed bottom tab bar (Instagram / WhatsApp
// pattern) with the Timer raised in the centre (the app's hero action). Every
// item is a generous 56px+ tap target. Secondary destinations live behind
// "More" (see MoreSheet). Desktop keeps the original BottomBar.
interface MobileTabBarProps {
  mode: AppMode;
  activePanel: PanelView;
  moreOpen: boolean;
  onHome: () => void;
  onTasks: () => void;
  onFocus: () => void;
  onSounds: () => void;
  onMore: () => void;
}

export default function MobileTabBar({
  mode, activePanel, moreOpen, onHome, onTasks, onFocus, onSounds, onMore,
}: MobileTabBarProps) {
  const { language } = useTranslation();
  const pt = language === 'pt';

  // A tab is "active" only when its surface is the one showing.
  const noSheet = activePanel === 'none' && !moreOpen;
  const homeActive = mode === 'home' && noSheet;
  const focusActive = mode === 'focus' && noSheet;
  const tasksActive = activePanel === 'tasks';
  const soundsActive = activePanel === 'sounds';

  const item = (active: boolean) =>
    `flex flex-1 flex-col items-center justify-center gap-0.5 h-full min-h-[56px] transition-colors ${
      active ? 'text-white' : 'text-white/45'
    }`;

  return (
    <nav
      className="mobile-tabbar fixed inset-x-0 bottom-0 z-[100] flex items-stretch glass-bar"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label={pt ? 'Navegação principal' : 'Primary navigation'}
    >
      <button onClick={onHome} className={item(homeActive)} aria-pressed={homeActive}>
        <Home size={22} />
        <span className="text-[10px] font-semibold">{pt ? 'Início' : 'Home'}</span>
      </button>

      <button onClick={onTasks} className={item(tasksActive)} aria-pressed={tasksActive}>
        <ListTodo size={22} />
        <span className="text-[10px] font-semibold">{pt ? 'Tarefas' : 'Tasks'}</span>
      </button>

      {/* Centre: raised Timer button (the hero action). */}
      <div className="flex w-[20%] items-start justify-center">
        <button
          onClick={onFocus}
          aria-pressed={focusActive}
          aria-label={pt ? 'Temporizador' : 'Timer'}
          className={`-mt-5 flex h-14 w-14 flex-col items-center justify-center rounded-full border-4 border-[#15101e] shadow-lg transition-all ${
            focusActive
              ? 'bg-primary text-white shadow-primary/40'
              : 'bg-primary/90 text-white hover:bg-primary'
          }`}
        >
          <Timer size={26} />
        </button>
      </div>

      <button onClick={onSounds} className={item(soundsActive)} aria-pressed={soundsActive}>
        <Music size={22} />
        <span className="text-[10px] font-semibold">{pt ? 'Sons' : 'Sounds'}</span>
      </button>

      <button onClick={onMore} className={item(moreOpen)} aria-pressed={moreOpen}>
        <Menu size={22} />
        <span className="text-[10px] font-semibold">{pt ? 'Mais' : 'More'}</span>
      </button>
    </nav>
  );
}
