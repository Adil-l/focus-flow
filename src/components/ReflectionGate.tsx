import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wind, ShieldCheck, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { logUrge } from '@/stores/recoveryStore';
import { useTranslation } from '@/lib/i18n';
import { nextCooldownMin, recordAttempt } from '@/lib/unblockEscalation';

// Friction shown BEFORE the user is allowed to weaken the blocker. The mode is
// chosen during onboarding:
//   'reflect' — name the urge, wait out a cooldown (urge-surfing), then confirm.
//   'confirm' — a single are-you-sure.
// The cooldown is anchored to an absolute timestamp in localStorage, so
// closing/reopening can't reset or skip the wait. Cancelling logs a "resisted".

const GATE_KEY = 'pomo:unblock-gate';

type Step = 'reason' | 'wait' | 'confirm';

function readUntil(): number | null {
  try {
    const raw = localStorage.getItem(GATE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    return typeof v?.until === 'number' ? v.until : null;
  } catch {
    return null;
  }
}

export default function ReflectionGate({
  onConfirm,
  onCancel,
  cooldownMin = 15,
  mode = 'reflect',
}: {
  onConfirm: () => void;
  onCancel: () => void;
  cooldownMin?: number;
  mode?: 'reflect' | 'confirm';
}) {
  const { language } = useTranslation();
  const isPt = language === 'pt';
  // Escalating cooldown preview for the next attempt (recorded only on start).
  const projected = nextCooldownMin(cooldownMin);

  const reasons = isPt
    ? ['Tédio', 'Stress', 'Solidão', 'Cansaço', 'Necessidade real']
    : ['Bored', 'Stressed', 'Lonely', 'Tired', 'Genuine need'];

  const existingUntil = readUntil();
  const [step, setStep] = useState<Step>(() => {
    if (existingUntil == null) return 'reason';
    return Date.now() >= existingUntil ? 'confirm' : 'wait';
  });
  const [until, setUntil] = useState<number | null>(existingUntil);
  const [now, setNow] = useState(() => Date.now());
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  // The written justification must be at least 100 words to proceed.
  const wordCount = note.trim() ? note.trim().split(/\s+/).length : 0;
  const canContinue = wordCount >= 100;

  useEffect(() => {
    if (step !== 'wait') return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [step]);

  useEffect(() => {
    if (step === 'wait' && until != null && now >= until) setStep('confirm');
  }, [step, until, now]);

  const startWait = () => {
    if (!canContinue) return; // a >= 100-word written reason is required
    const mins = nextCooldownMin(cooldownMin);
    recordAttempt();
    const u = Date.now() + mins * 60 * 1000;
    try { localStorage.setItem(GATE_KEY, JSON.stringify({ until: u, reason })); } catch { /* ignore */ }
    logUrge({ type: 'urge', trigger: reason, note: note || undefined });
    setUntil(u);
    setNow(Date.now());
    setStep('wait');
  };

  const cancel = (method: string) => {
    try { localStorage.removeItem(GATE_KEY); } catch { /* ignore */ }
    logUrge({ type: 'resisted', trigger: reason || 'unspecified', method });
    onCancel();
  };

  const confirm = () => {
    try { localStorage.removeItem(GATE_KEY); } catch { /* ignore */ }
    onConfirm();
  };

  const remaining = until ? Math.max(0, Math.ceil((until - now) / 1000)) : 0;
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;

  const wrap = (children: React.ReactNode) => (
    <div className="fixed inset-0 z-[300] flex items-center justify-center overflow-auto bg-[#0c0a12]/95 p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-7 text-center">{children}</div>
    </div>
  );

  // --- simple confirm mode -------------------------------------------------
  if (mode === 'confirm') {
    return wrap(
      <>
        <AlertTriangle size={40} className="mx-auto mb-3 text-amber-300" />
        <div className="mb-2 text-xl font-black text-white">
          {isPt ? 'Tens a certeza?' : 'Are you sure?'}
        </div>
        <p className="mb-6 text-[13px] text-white/60">
          {isPt
            ? 'Estás prestes a enfraquecer a tua proteção. Foi isto que pediste para te proteger.'
            : "You're about to weaken your protection — the thing you set up to protect yourself."}
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={() => cancel('confirm-gate')} className="rounded-xl bg-violet-600 py-3 text-sm font-bold text-white">
            {isPt ? 'Manter protegido 💪' : 'Stay protected 💪'}
          </button>
          <button onClick={confirm} className="rounded-xl bg-white/10 py-3 text-sm font-bold text-white/60">
            {isPt ? 'Sim, enfraquecer' : 'Yes, weaken it'}
          </button>
        </div>
      </>,
    );
  }

  // --- reflect mode (reason -> wait -> confirm) ----------------------------
  if (step === 'reason') {
    return wrap(
      <>
        <div className="mb-2 text-xl font-black text-white">{isPt ? 'Antes de desbloquear…' : 'Before you unblock…'}</div>
        <p className="mb-5 text-[13px] text-white/60">
          {isPt
            ? 'O que te faz querer desbloquear agora? Dar-lhe um nome ajuda o impulso a passar.'
            : "What's making you want to unblock right now? Naming it helps the urge pass."}
        </p>
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {reasons.map((r) => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={`rounded-full border px-3 py-1.5 text-[12px] font-bold ${reason === r ? 'border-violet-500 bg-violet-600 text-white' : 'border-white/10 bg-white/5 text-white/70'}`}
            >
              {r}
            </button>
          ))}
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onPaste={(e) => { e.preventDefault(); toast(isPt ? 'Colar está desativado — escreve à mão.' : 'Pasting is disabled — type it out.'); }}
          onDrop={(e) => e.preventDefault()}
          onDragOver={(e) => e.preventDefault()}
          placeholder={isPt ? 'Escreve à mão, em pelo menos 100 palavras, porque queres mesmo desbloquear. (colar desativado · fica no teu Mac)' : 'Type by hand, in at least 100 words, why you really want to unblock. (pasting disabled · stays on your Mac)'}
          className="mb-2 min-h-[160px] w-full resize-y rounded-xl border border-white/10 bg-black/30 p-3 text-[13px] text-white outline-none"
        />
        <p className={`mb-3 text-[11px] font-bold ${canContinue ? 'text-emerald-400/80' : 'text-amber-300/80'}`}>
          {wordCount}/100 {isPt ? 'palavras · à mão' : 'words · typed by hand'}{!canContinue && (isPt ? ' — escreve pelo menos 100 para continuar.' : ' — write at least 100 to continue.')}
        </p>
        <div className="flex gap-3">
          <button onClick={() => cancel('reflection-gate')} className="rounded-xl bg-white/10 px-5 py-3 text-sm font-bold text-white/70">
            {isPt ? 'Manter protegido' : 'Stay protected'}
          </button>
          <button onClick={startWait} disabled={!canContinue} className="flex-1 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">
            {isPt ? `Continuar (esperar ${projected} min)` : `Continue (${projected} min wait)`}
          </button>
        </div>
      </>,
    );
  }

  if (step === 'wait') {
    return wrap(
      <>
        <div className="mb-4 text-[11px] font-black uppercase tracking-widest text-violet-300">{isPt ? 'Surfa a onda' : 'Ride the wave'}</div>
        <div className="relative mx-auto mb-5 flex items-center justify-center" style={{ width: 180, height: 180 }}>
          <motion.div
            className="absolute rounded-full"
            style={{ width: 180, height: 180, background: 'radial-gradient(circle, rgba(124,58,237,0.35), transparent 70%)' }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <Wind size={40} className="relative text-violet-200" />
        </div>
        <div className="mb-2 text-4xl font-black tabular-nums text-white">
          {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
        </div>
        <p className="mx-auto mb-5 max-w-xs text-[13px] text-white/55">
          {isPt
            ? 'Os impulsos sobem, atingem o pico e descem — normalmente em minutos. Respira devagar: inspira 4, segura 4, expira 6. Não tens de agir.'
            : "Urges rise, peak, and fall — usually within minutes. Breathe slowly: in for 4, hold 4, out for 6. You don't have to act."}
        </p>
        <button onClick={() => cancel('reflection-gate')} className="rounded-xl bg-white/10 px-5 py-3 text-sm font-bold text-white/70">
          {isPt ? 'Estou bem — manter protegido' : "I'm good — stay protected"}
        </button>
      </>,
    );
  }

  return wrap(
    <>
      <ShieldCheck size={40} className="mx-auto mb-3 text-violet-300" />
      <div className="mb-2 text-xl font-black text-white">{isPt ? 'Esperaste até passar.' : 'You waited it out.'}</div>
      <p className="mb-6 text-[13px] text-white/60">
        {isPt
          ? 'O impulso já deve ter passado. Podes manter a proteção, ou desbloquear se ainda for mesmo preciso.'
          : 'Most urges are gone by now. You can stay protected, or unblock if you still truly need to.'}
      </p>
      <div className="flex flex-col gap-3">
        <button onClick={() => cancel('reflection-gate')} className="rounded-xl bg-violet-600 py-3 text-sm font-bold text-white">
          {isPt ? 'Manter protegido 💪' : 'Stay protected 💪'}
        </button>
        <button onClick={confirm} className="rounded-xl bg-white/10 py-3 text-sm font-bold text-white/60">
          {isPt ? 'Esperei e mesmo assim quero desbloquear' : "I've waited and still choose to unblock"}
        </button>
      </div>
    </>,
  );
}
