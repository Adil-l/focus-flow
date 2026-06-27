import { FileText, Users, Target, Trophy, BarChart3, Medal, Gem, Leaf, Settings, User, Share2, LifeBuoy } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

// The "More" menu — every secondary destination that doesn't earn a primary
// tab, as a tidy grid of large tap targets. Rendered inside a BottomSheet.
// Nothing is dropped from the desktop app; it's just one tap deeper.
export type MoreAction =
  | 'notepad' | 'focusroom' | 'goals' | 'achievements' | 'heatmap'
  | 'leaderboard' | 'pricing' | 'ambient' | 'settings' | 'login' | 'share' | 'sos';

interface MoreSheetProps {
  loggedIn: boolean;
  onAction: (action: MoreAction) => void;
}

export default function MoreSheet({ loggedIn, onAction }: MoreSheetProps) {
  const { language } = useTranslation();
  const pt = language === 'pt';

  const items: { action: MoreAction; icon: typeof FileText; label: string; tint?: string }[] = [
    { action: 'notepad', icon: FileText, label: pt ? 'Notas' : 'Notepad' },
    { action: 'goals', icon: Target, label: pt ? 'Metas' : 'Goals' },
    { action: 'achievements', icon: Trophy, label: pt ? 'Conquistas' : 'Achievements' },
    { action: 'heatmap', icon: BarChart3, label: pt ? 'Mapa de calor' : 'Heatmap' },
    { action: 'leaderboard', icon: Medal, label: pt ? 'Ranking' : 'Leaderboard' },
    { action: 'focusroom', icon: Users, label: pt ? 'Focus Room' : 'Focus Room' },
    { action: 'ambient', icon: Leaf, label: pt ? 'Ambiente' : 'Ambient' },
    { action: 'pricing', icon: Gem, label: pt ? 'Planos' : 'Pricing' },
    { action: 'share', icon: Share2, label: pt ? 'Partilhar' : 'Share' },
    { action: 'settings', icon: Settings, label: pt ? 'Definições' : 'Settings' },
    { action: 'login', icon: User, label: loggedIn ? (pt ? 'Conta' : 'Account') : (pt ? 'Entrar' : 'Log in') },
    { action: 'sos', icon: LifeBuoy, label: 'SOS', tint: 'text-violet-300' },
  ];

  return (
    <div className="glass-panel w-[min(540px,94vw)] max-h-[70vh] overflow-y-auto scrollbar-thin p-5">
      <h3 className="mb-4 text-sm font-black text-white">{pt ? 'Mais' : 'More'}</h3>
      <div className="grid grid-cols-3 gap-3">
        {items.map(({ action, icon: Icon, label, tint }) => (
          <button
            key={action}
            onClick={() => onAction(action)}
            className="flex min-h-[80px] flex-col items-center justify-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.04] px-2 py-3 text-center transition-all hover:bg-white/[0.08] active:scale-[0.97]"
          >
            <Icon size={22} className={tint ?? 'text-white/80'} />
            <span className="text-[11px] font-semibold leading-tight text-white/70">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
