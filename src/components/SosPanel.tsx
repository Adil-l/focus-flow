import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { LifeBuoy, Phone, Wind, Footprints, Eye, HeartHandshake, TrendingUp, X, Check } from 'lucide-react';
import { logUrge } from '@/stores/recoveryStore';
import { openExternal } from '@/lib/openExternal';
import { useTranslation } from '@/lib/i18n';
import ResourcesPanel from '@/components/ResourcesPanel';
import RecoveryPanel from '@/components/RecoveryPanel';

const CONTACT_KEY = 'pomo:support-contact';

// Always-available "I'm struggling" panel. Offers coping alternatives instead of
// an off-ramp to blocked content — never gated or delayed. Completing one logs a
// "resisted" win.
export default function SosPanel({ onClose }: { onClose: () => void }) {
  const { t, language } = useTranslation();
  const isPt = language === 'pt';
  const [showResources, setShowResources] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [breathing, setBreathing] = useState(false);
  const [contact, setContact] = useState(() => {
    try { return localStorage.getItem(CONTACT_KEY) || ''; } catch { return ''; }
  });

  const saveContact = (v: string) => {
    setContact(v);
    try { localStorage.setItem(CONTACT_KEY, v); } catch { /* ignore */ }
  };

  const rodeItOut = () => {
    logUrge({ type: 'resisted', method: 'sos' });
    onClose();
  };

  const callContact = () => {
    const num = contact.replace(/[^0-9+]/g, '');
    if (!num) { toast(isPt ? 'Guarda primeiro um número, em baixo.' : 'Save a phone number first, below.'); return; }
    void openExternal(`tel:${num}`);
  };

  if (showResources) return <ResourcesPanel onClose={() => setShowResources(false)} />;
  if (showRecovery) return <RecoveryPanel onClose={() => setShowRecovery(false)} />;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center overflow-auto bg-[#0c0a12]/95 p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-7">
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-black text-white">
            <LifeBuoy size={22} className="text-violet-300" /> {isPt ? 'Tu consegues' : "You've got this"}
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={18} /></button>
        </div>
        <p className="mb-5 text-[13px] text-white/55">
          {isPt
            ? 'O impulso vai passar. Experimenta uma destas em vez de desbloquear seja o que for.'
            : 'The urge will pass. Try one of these instead — no need to unblock anything.'}
        </p>

        {breathing ? (
          <div className="py-6 text-center">
            <motion.div
              className="mx-auto mb-4 rounded-full"
              style={{ width: 140, height: 140, background: 'radial-gradient(circle, rgba(124,58,237,0.4), transparent 70%)' }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="mb-4 text-sm text-white/70">{isPt ? 'Inspira… segura… expira. Segue o círculo.' : 'Breathe in… hold… out. Follow the circle.'}</div>
            <button onClick={() => setBreathing(false)} className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold text-white/70">{isPt ? 'Concluído' : 'Done'}</button>
          </div>
        ) : (
          <div className="mb-5 space-y-2">
            <button onClick={() => setBreathing(true)} className="flex w-full items-center gap-3 rounded-xl bg-white/[0.04] p-3.5 text-left text-[13px] font-semibold text-white hover:bg-white/[0.08]">
              <Wind size={18} className="text-violet-300" /> {isPt ? 'Exercício de respiração' : 'Breathing exercise'}
            </button>
            <button
              onClick={callContact}
              className="flex w-full items-center gap-3 rounded-xl bg-white/[0.04] p-3.5 text-left text-[13px] font-semibold text-white hover:bg-white/[0.08]"
            >
              <Phone size={18} className="text-violet-300" /> {isPt ? 'Liga a alguém de confiança' : 'Call someone you trust'}
            </button>
            <input
              value={contact}
              onChange={(e) => saveContact(e.target.value)}
              placeholder={isPt ? 'Guardar um número (opcional)' : 'Save a phone number (optional)'}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-[12px] text-white outline-none"
            />
            <div className="rounded-xl bg-white/[0.04] p-3.5 text-[13px] text-white/80">
              <div className="mb-1 flex items-center gap-2 font-semibold"><Footprints size={18} className="text-violet-300" /> {isPt ? 'Mexe-te 5 minutos' : 'Move for 5 minutes'}</div>
              <div className="text-[12px] text-white/50">{isPt ? 'Levanta-te, anda, bebe água, molha a cara com água fria.' : 'Stand up, walk, get water, splash cold water on your face.'}</div>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-3.5 text-[13px] text-white/80">
              <div className="mb-1 flex items-center gap-2 font-semibold"><Eye size={18} className="text-violet-300" /> {isPt ? 'Ancora-te (5-4-3-2-1)' : 'Ground yourself (5-4-3-2-1)'}</div>
              <div className="text-[12px] text-white/50">{isPt ? 'Nomeia 5 coisas que vês, 4 que sentes, 3 que ouves, 2 que cheiras, 1 que saboreias.' : 'Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.'}</div>
            </div>
          </div>
        )}

        <button onClick={() => setShowRecovery(true)} className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.06] py-2.5 text-[12px] font-bold text-white/70">
          <TrendingUp size={16} className="text-violet-300" /> {isPt ? 'O teu progresso' : 'Your recovery progress'}
        </button>
        <button onClick={() => setShowResources(true)} className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.06] py-2.5 text-[12px] font-bold text-white/70">
          <HeartHandshake size={16} className="text-violet-300" /> {isPt ? 'Fala com alguém preparado para ajudar' : 'Talk to someone trained to help'}
        </button>
        <button onClick={rodeItOut} className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white">
          <Check size={16} /> {isPt ? 'Aguentei o impulso' : 'I rode it out'}
        </button>
      </div>
    </div>
  );
}
