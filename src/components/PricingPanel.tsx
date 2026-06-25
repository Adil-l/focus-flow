import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gem, Check, Sparkles, Loader2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { startCheckout, openBillingPortal } from '@/lib/billing';
import { useTranslation } from '@/lib/i18n';

type Cycle = 'monthly' | 'annual' | 'lifetime';

interface PlusOption {
  price: string;
  cadence: string;
  sub?: string;
  // Client-side price id hint; the server still validates against its allow-list.
  priceId?: string;
}

const PLUS_OPTIONS: Record<Cycle, PlusOption> = {
  monthly: { price: '$4.99', cadence: 'per month', priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID },
  annual: { price: '$29.99', cadence: 'per year', sub: '$2.50/mo · save 50%', priceId: import.meta.env.VITE_STRIPE_PRO_ANNUAL_PRICE_ID },
  lifetime: { price: '$79', cadence: 'one-time', sub: 'pay once, yours forever', priceId: import.meta.env.VITE_STRIPE_LIFETIME_PRICE_ID },
};

const PLUS_FEATURES = [
  'Everything in Free',
  'Premium soundscapes + binaural beats',
  'Sound mixer (layer multiple sounds)',
  'Advanced stats, history & trends',
  'Premium themes & Clear mode',
  'Cross-device cloud sync',
];

const FREE_FEATURES = [
  'Pomodoro timer & breaks',
  'Tasks, notes & goals',
  'Core ambient sounds',
  'Streaks & achievements',
];

export default function PricingPanel() {
  const { language } = useTranslation();
  const { isPremium, loading } = useSubscription();
  const [cycle, setCycle] = useState<Cycle>('annual');
  const isPt = language === 'pt';

  const plus = PLUS_OPTIONS[cycle];
  const cycleLabels: Record<Cycle, string> = isPt
    ? { monthly: 'Mensal', annual: 'Anual', lifetime: 'Vitalício' }
    : { monthly: 'Monthly', annual: 'Annual', lifetime: 'Lifetime' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="glass-panel p-6 w-[min(680px,92vw)] max-h-[85vh] flex flex-col gap-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Sparkles size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg tracking-tight">{isPt ? 'Planos' : 'Pricing'}</h3>
          <p className="text-xs text-white/40 uppercase tracking-widest font-medium">
            {isPt ? 'Escolha o seu plano' : 'Choose your plan'}
          </p>
        </div>
      </div>

      {/* Billing cycle toggle */}
      <div className="flex gap-1 bg-white/[0.04] p-1 rounded-xl self-start">
        {(['monthly', 'annual', 'lifetime'] as Cycle[]).map((c) => (
          <button
            key={c}
            onClick={() => setCycle(c)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              cycle === c ? 'bg-primary/30 text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            {cycleLabels[c]}
            {c === 'annual' && <span className="ml-1 text-[9px] text-emerald-400">-50%</span>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Free */}
        <div className="relative rounded-[24px] p-6 flex flex-col gap-5 border bg-white/[0.03] border-white/[0.06]">
          {!isPremium && (
            <span className="absolute top-5 right-5 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
              {isPt ? 'Atual' : 'Current'}
            </span>
          )}
          <h4 className="text-white font-black text-xl tracking-tight">Free</h4>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white tracking-tighter">$0</span>
            <span className="text-xs font-bold text-white/30">{isPt ? 'para sempre' : 'forever'}</span>
          </div>
          <ul className="flex flex-col gap-2.5 flex-1">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-white/70">
                <Check size={14} className="text-white/40" /> {f}
              </li>
            ))}
          </ul>
          <div className="w-full py-3 rounded-xl bg-white/[0.04] text-white/40 text-sm font-bold text-center">
            {isPremium ? (isPt ? 'Plano básico' : 'Base plan') : (isPt ? 'O seu plano' : 'Your plan')}
          </div>
        </div>

        {/* Plus */}
        <div className="relative rounded-[24px] p-6 flex flex-col gap-5 border bg-gradient-to-br from-primary/15 to-transparent border-primary/30">
          {isPremium && (
            <span className="absolute top-5 right-5 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
              {isPt ? 'Atual' : 'Current'}
            </span>
          )}
          <div className="flex items-center gap-2">
            <Gem size={18} className="text-primary" />
            <h4 className="text-white font-black text-xl tracking-tight">Plus</h4>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-white tracking-tighter">{plus.price}</span>
              <span className="text-xs font-bold text-white/30">{plus.cadence}</span>
            </div>
            {plus.sub && <span className="text-[11px] font-bold text-emerald-400">{plus.sub}</span>}
          </div>
          <ul className="flex flex-col gap-2.5 flex-1">
            {PLUS_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-white/70">
                <Check size={14} className="text-primary" /> {f}
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
              {isPt ? 'Gerir assinatura' : 'Manage billing'}
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={() => void startCheckout(plus.priceId)}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_8px_30px_hsl(258_90%_66%/0.35)]"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {isPt ? 'Atualizar para Plus' : 'Upgrade to Plus'}
            </button>
          )}
        </div>
      </div>

      <p className="text-[11px] text-white/30 text-center">
        {isPt ? 'Pagamentos seguros via Stripe. Cancele quando quiser.' : 'Secure payments via Stripe. Cancel anytime.'}
      </p>
    </motion.div>
  );
}
