import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Volume2, VolumeX, Coffee } from 'lucide-react';
import { soundManager, ALARM_URL } from '@/lib/audio';
import { useTranslation } from '@/lib/i18n';

interface LockOverlayProps {
  remaining: number;       // seconds left
  phase: 'short' | 'long';
  totalSeconds: number;    // full break length, for the progress ring
}

const R = 130;
const CIRC = 2 * Math.PI * R;

/**
 * Mandatory break screen. Full-screen, non-dismissable, reload-proof (driven by
 * an absolute timestamp upstream). No skip — it clears only when the break time
 * elapses. Sound is opt-in (default off) so it's calm, not alarming.
 */
export default function LockOverlay({ remaining, phase, totalSeconds }: LockOverlayProps) {
  const { t } = useTranslation();
  const [sound, setSound] = useState(false);

  useEffect(() => {
    if (sound) soundManager.play(ALARM_URL, 0.6, true);
    else soundManager.stop(ALARM_URL);
    return () => soundManager.stop(ALARM_URL);
  }, [sound]);

  // Block the usual escape keys/shortcuts while the overlay is up.
  useEffect(() => {
    const stop = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'F11') { e.preventDefault(); e.stopPropagation(); }
    };
    window.addEventListener('keydown', stop, true);
    return () => window.removeEventListener('keydown', stop, true);
  }, []);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const progress = totalSeconds > 0 ? Math.min(1, Math.max(0, 1 - remaining / totalSeconds)) : 0;
  const isPt = t.language === 'pt';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center p-6 text-center select-none"
      style={{ background: 'radial-gradient(130% 130% at 50% 0%, #1b2438 0%, #0a0e16 65%)', pointerEvents: 'all' }}
    >
      {/* breathing aura */}
      <motion.div
        aria-hidden
        className="absolute w-[420px] h-[420px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.25), transparent 70%)' }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative flex flex-col items-center"
      >
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.4em] text-primary/80 mb-6">
          <Coffee size={14} />
          {isPt ? 'Pausa obrigatória' : 'Mandatory break'}
        </div>

        {/* progress ring + countdown */}
        <div className="relative" style={{ width: 300, height: 300 }}>
          <svg width="300" height="300" className="-rotate-90">
            <circle cx="150" cy="150" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
            <circle
              cx="150" cy="150" r={R} fill="none" stroke="url(#g)" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - progress)}
              style={{ transition: 'stroke-dashoffset 0.5s linear' }}
            />
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-7xl font-black text-white tabular-nums tracking-tighter">
              {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
            </div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-white/40 font-bold mt-1">
              {phase === 'long' ? (isPt ? 'Pausa longa' : 'Long break') : (isPt ? 'Pausa curta' : 'Short break')}
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-black text-white mt-8 mb-2">
          {isPt ? 'Afasta-te do ecrã 🌿' : 'Step away from the screen 🌿'}
        </h2>
        <p className="text-white/45 text-sm max-w-sm leading-relaxed">
          {isPt
            ? 'Levanta-te, bebe água, respira. Isto desbloqueia sozinho quando a pausa terminar — nem o reload salta.'
            : 'Stand up, drink water, breathe. This unlocks on its own when the break ends — not even a reload skips it.'}
        </p>

        <button
          onClick={() => setSound((v) => !v)}
          className="mt-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/10 text-white/60 text-xs font-bold hover:bg-white/[0.1] transition-all"
        >
          {sound ? <Volume2 size={14} /> : <VolumeX size={14} />}
          {sound ? (isPt ? 'Som ligado' : 'Sound on') : (isPt ? 'Som desligado' : 'Sound off')}
        </button>
      </motion.div>
    </motion.div>
  );
}
