import { motion } from 'framer-motion';
import { Gem, Check, Sparkles, Loader2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { startCheckout, openBillingPortal } from '@/lib/billing';
import { useTranslation } from '@/lib/i18n';

interface Tier {
  id: 'free' | 'plus';
  name: string;
  price: string;
  cadence: string;
  features: string[];
  highlight: boolean;
}

const TIERS: Tier[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    features: [
      'Pomodoro timer & breaks',
      'Tasks, notes & goals',
      'Core ambient sounds',
      'Streaks & achievements',
    ],
    highlight: false,
  },
  {
    id: 'plus',
    name: 'Plus',
    price: '$5',
    cadence: 'per month',
    features: [
      'Everything in Free',
      'Premium ambient soundscapes',
      'Cross-device cloud sync',
      'Priority support',
    ],
    highlight: true,
  },
];

export default function PricingPanel() {
  const { language } = useTranslation();
  const { isPremium, loading } = useSubscription();

  const isPt = language === 'pt';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="glass-panel p-8 w-[760px] max-h-[85vh] flex flex-col gap-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Sparkles size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg tracking-tight">
            {isPt ? 'Planos' : 'Pricing'}
          </h3>
          <p className="text-xs text-white/40 uppercase tracking-widest font-medium">
            {isPt ? 'Escolha o seu plano' : 'Choose your plan'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {TIERS.map((tier) => {
          const isPlus = tier.id === 'plus';
          const ownsThis = isPlus ? isPremium : !isPremium;

          return (
            <div
              key={tier.id}
              className={`relative rounded-[24px] p-6 flex flex-col gap-5 border transition-all ${
                tier.highlight
                  ? 'bg-gradient-to-br from-primary/15 to-transparent border-primary/30'
                  : 'bg-white/[0.03] border-white/[0.06]'
              }`}
            >
              {ownsThis && (
                <span className="absolute top-5 right-5 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  {isPt ? 'Atual' : 'Current'}
                </span>
              )}

              <div className="flex items-center gap-2">
                {isPlus && <Gem size={18} className="text-primary" />}
                <h4 className="text-white font-black text-xl tracking-tight">
                  {tier.name}
                </h4>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-white tracking-tighter">
                  {tier.price}
                </span>
                <span className="text-xs font-bold text-white/30">
                  {tier.cadence}
                </span>
              </div>

              <ul className="flex flex-col gap-2.5 flex-1">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-xs text-white/70"
                  >
                    <Check
                      size={14}
                      className={isPlus ? 'text-primary' : 'text-white/40'}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              {isPlus ? (
                isPremium ? (
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
                    onClick={() => void startCheckout()}
                    className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    {isPt ? 'Atualizar para Plus' : 'Upgrade to Plus'}
                  </button>
                )
              ) : (
                <div className="w-full py-3 rounded-xl bg-white/[0.04] text-white/40 text-sm font-bold text-center">
                  {isPremium
                    ? isPt
                      ? 'Plano básico'
                      : 'Base plan'
                    : isPt
                      ? 'O seu plano'
                      : 'Your plan'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-white/30 text-center">
        {isPt
          ? 'Pagamentos seguros via Stripe. Cancele quando quiser.'
          : 'Secure payments via Stripe. Cancel anytime.'}
      </p>
    </motion.div>
  );
}
