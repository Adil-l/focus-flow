import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n';

// Friction shown when the user tries to turn OFF the "Distracting / Social"
// website blocker BEFORE their committed time is up. To proceed they must TYPE
// (no pasting / drag-drop) a reason of at least `requiredChars` characters.
// This protects them from impulsively bailing on a commitment they made to
// themselves to protect their focus.

interface SocialCommitmentGateProps {
  requiredChars: number;     // minimum reason length, e.g. 50 or 100
  remainingLabel: string;    // time left in the commitment, e.g. "2d 3h"
  onConfirm: (reason: string) => void; // called only when allowed + user confirms
  onCancel: () => void;      // user backs out, stays committed
}

export default function SocialCommitmentGate({
  requiredChars,
  remainingLabel,
  onConfirm,
  onCancel,
}: SocialCommitmentGateProps) {
  const { language } = useTranslation();
  const pt = language === 'pt';

  const [reason, setReason] = useState('');
  const len = reason.trim().length;
  const canConfirm = len >= requiredChars;

  const blockPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    toast(pt ? 'Colar está desativado — escreve à mão.' : 'Pasting is disabled — type it out.');
  };

  const confirm = () => {
    if (!canConfirm) return;
    onConfirm(reason.trim());
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center overflow-y-auto bg-[#0c0a12]/95 p-4"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="max-h-[100dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.03] p-7"
      >
        <Lock size={40} className="mx-auto mb-3 text-violet-300" />

        <div className="mb-2 text-center text-xl font-black text-white">
          {pt ? 'Estás no meio de um compromisso' : "You're mid-commitment"}
        </div>

        <div className="mb-4 flex items-center justify-center gap-1.5 text-[12px] font-bold text-amber-300/90">
          <Clock size={14} className="shrink-0" />
          <span>
            {pt ? `Ainda faltam ${remainingLabel}` : `${remainingLabel} left`}
          </span>
        </div>

        <p className="mb-5 text-center text-[13px] leading-relaxed text-white/60">
          {pt
            ? 'Foste tu que escolheste bloquear sites sociais e distrações para proteger o teu foco. Se queres mesmo desbloquear antes do tempo, escreve à mão o porquê.'
            : 'You chose to block social & distracting sites to protect your focus. If you really want to unblock early, type out why — by hand.'}
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          onPaste={blockPaste}
          onDrop={(e) => e.preventDefault()}
          onDragOver={(e) => e.preventDefault()}
          placeholder={
            pt
              ? `Escreve à mão, em pelo menos ${requiredChars} caracteres, porque queres mesmo desbloquear. (colar desativado · fica no teu dispositivo)`
              : `Type by hand, at least ${requiredChars} characters, why you really want to unblock. (pasting disabled · stays on your device)`
          }
          className="mb-2 min-h-[140px] w-full resize-y rounded-xl border border-white/10 bg-black/30 p-3 text-base text-white outline-none focus:border-violet-500/60"
        />

        <p className={`mb-5 text-[12px] font-bold ${canConfirm ? 'text-emerald-400/80' : 'text-amber-300/80'}`}>
          {len}/{requiredChars}{' '}
          {pt ? 'caracteres · à mão' : 'characters · typed by hand'}
          {!canConfirm &&
            (pt
              ? ` — escreve pelo menos ${requiredChars} para continuar.`
              : ` — write at least ${requiredChars} to continue.`)}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onCancel}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white"
          >
            <ShieldCheck size={16} className="shrink-0" />
            {pt ? 'Manter bloqueado 💪' : 'Stay blocked 💪'}
          </button>
          <button
            onClick={confirm}
            disabled={!canConfirm}
            className="min-h-[48px] rounded-xl bg-white/10 py-3 text-sm font-bold text-rose-300/90 disabled:cursor-not-allowed disabled:text-white/40 disabled:opacity-50"
          >
            {pt ? 'Desbloquear mesmo assim' : 'Unblock anyway'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
