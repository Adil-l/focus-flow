import type { ReactNode } from 'react';
import { Gem } from 'lucide-react';
import { usePremium } from '@/hooks/usePremium';
import { startCheckout } from '@/lib/billing';
import { useTranslation } from '@/lib/i18n';

interface PremiumGateProps {
  children: ReactNode;
  featureName: string;
}

/**
 * Wraps premium-only UI. When the user is entitled the children render as-is;
 * otherwise the children are dimmed and a glassy upgrade CTA overlays them.
 * Clicking the overlay starts a real Stripe Checkout. This is UX gating only —
 * the server (webhook + RLS) is the true source of entitlement.
 */
export const PremiumGate = ({ children, featureName }: PremiumGateProps) => {
  const { isPremium } = usePremium();
  const { t, language } = useTranslation();

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative group rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          void startCheckout();
        }}
        className="absolute inset-0 z-50 cursor-pointer flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-md transition-all hover:bg-black/80"
      >
        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
          <Gem size={24} className="text-primary" />
        </div>
        <span className="text-sm font-bold text-white">{featureName}</span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-white bg-primary/30 border border-primary/40 px-4 py-1.5 rounded-full shadow-xl">
          {language === 'pt' ? 'Desbloquear com Plus' : 'Unlock with Plus'}
        </span>
      </button>
      <div className="opacity-20 pointer-events-none grayscale">{children}</div>
    </div>
  );
};

export default PremiumGate;
