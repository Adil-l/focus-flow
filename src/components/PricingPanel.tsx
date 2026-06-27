import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gem, Check, Sparkles, Loader2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { startCheckout, openBillingPortal } from '@/lib/billing';
import { useTranslation } from '@/lib/i18n';

type Cycle = 'monthly' | 'annual' | 'lifetime';

interface PlusOption {
  price: string;
  cadenceKey: 'perMonth' | 'perYear' | 'oneTime';
  subKey?: 'annualSub' | 'lifetimeSub';
  // Client-side price id hint; the server still validates against its allow-list.
  priceId?: string;
}

const PLUS_OPTIONS: Record<Cycle, PlusOption> = {
  monthly: { price: '$4.99', cadenceKey: 'perMonth', priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID },
  annual: { price: '$29.99', cadenceKey: 'perYear', subKey: 'annualSub', priceId: import.meta.env.VITE_STRIPE_PRO_ANNUAL_PRICE_ID },
  lifetime: { price: '$79', cadenceKey: 'oneTime', subKey: 'lifetimeSub', priceId: import.meta.env.VITE_STRIPE_LIFETIME_PRICE_ID },
};

const PLUS_FEATURE_KEYS = [
  'plusFeatEverything',
  'plusFeatSoundscapes',
  'plusFeatMixer',
  'plusFeatStats',
  'plusFeatThemes',
  'plusFeatSync',
] as const;

const FREE_FEATURE_KEYS = [
  'freeFeatPomodoro',
  'freeFeatTasks',
  'freeFeatSounds',
  'freeFeatStreaks',
] as const;

export default function PricingPanel() {
  const { t } = useTranslation();
  const { isPremium, loading } = useSubscription();
  const [cycle, setCycle] = useState<Cycle>('annual');

  const plus = PLUS_OPTIONS[cycle];
  const cycleLabels: Record<Cycle, string> = {
    monthly: t.monthly,
    annual: t.annual,
    lifetime: t.lifetime,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="glass-panel p-4 sm:p-6 w-[min(680px,92vw)] max-h-[85vh] flex flex-col gap-4 sm:gap-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Sparkles size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg tracking-tight">{t.pricing}</h3>
          <p className="text-xs text-white/40 uppercase tracking-widest font-medium">
            {t.chooseYourPlan}
          </p>
        </div>
      </div>

      {/* Billing cycle toggle */}
      <div className="flex gap-1 bg-white/[0.04] p-1 rounded-xl self-start overflow-x-auto scrollbar-thin max-w-full">
        {(['monthly', 'annual', 'lifetime'] as Cycle[]).map((c) => (
          <button
            key={c}
            onClick={() => setCycle(c)}
            className={`flex-shrink-0 whitespace-nowrap px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              cycle === c ? 'bg-primary/30 text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            {cycleLabels[c]}
            {c === 'annual' && <span className="ml-1 text-[9px] text-emerald-400">-50%</span>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Free */}
        <div className="relative rounded-[24px] p-4 sm:p-6 flex flex-col gap-5 border bg-white/[0.03] border-white/[0.06]">
          {!isPremium && (
            <span className="absolute top-5 right-5 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
              {t.current}
            </span>
          )}
          <h4 className="text-white font-black text-xl tracking-tight">{t.free}</h4>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white tracking-tighter">$0</span>
            <span className="text-xs font-bold text-white/30">{t.forever}</span>
          </div>
          <ul className="flex flex-col gap-2.5 flex-1">
            {FREE_FEATURE_KEYS.map((key) => (
              <li key={key} className="flex items-center gap-2 text-xs text-white/70">
                <Check size={14} className="text-white/40" /> {t[key]}
              </li>
            ))}
          </ul>
          <div className="w-full py-3 rounded-xl bg-white/[0.04] text-white/40 text-sm font-bold text-center">
            {isPremium ? t.basePlan : t.yourPlan}
          </div>
        </div>

        {/* Plus */}
        <div className="relative rounded-[24px] p-4 sm:p-6 flex flex-col gap-5 border bg-gradient-to-br from-primary/15 to-transparent border-primary/30">
          {isPremium && (
            <span className="absolute top-5 right-5 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
              {t.current}
            </span>
          )}
          <div className="flex items-center gap-2">
            <Gem size={18} className="text-primary" />
            <h4 className="text-white font-black text-xl tracking-tight">Plus</h4>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-white tracking-tighter">{plus.price}</span>
              <span className="text-xs font-bold text-white/30">{t[plus.cadenceKey]}</span>
            </div>
            {plus.subKey && <span className="text-[11px] font-bold text-emerald-400">{t[plus.subKey]}</span>}
          </div>
          <ul className="flex flex-col gap-2.5 flex-1">
            {PLUS_FEATURE_KEYS.map((key) => (
              <li key={key} className="flex items-center gap-2 text-xs text-white/70">
                <Check size={14} className="text-primary" /> {t[key]}
              </li>
            ))}
          </ul>
          {isPremium ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => void openBillingPortal()}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {t.manageBilling}
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={() => void startCheckout(plus.priceId)}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_8px_30px_hsl(258_90%_66%/0.35)]"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {t.upgradeToPlus}
            </button>
          )}
        </div>
      </div>

      <p className="text-[11px] text-white/30 text-center">
        {t.securePayments}
      </p>
    </motion.div>
  );
}
