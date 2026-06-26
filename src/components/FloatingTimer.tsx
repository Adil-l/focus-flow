import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, PictureInPicture2 } from 'lucide-react';
import { usePiP } from '@/hooks/usePiP';
import { useTranslation } from '@/lib/i18n';
import type { SessionPhase } from '@/stores/pomodoroStore';

interface FloatingTimerProps {
  remaining: number;
  phase: SessionPhase;
  running: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const phaseLabel = (p: SessionPhase, isPt: boolean) =>
  p === 'work'
    ? (isPt ? 'Foco' : 'Focus')
    : p === 'short'
      ? (isPt ? 'Intervalo Curto' : 'Short Break')
      : (isPt ? 'Intervalo Longo' : 'Long Break');

interface CardProps extends FloatingTimerProps {
  variant: 'float' | 'pip';
  pipSupported?: boolean;
  onPiP?: () => void;
}

function TimerCard({ remaining, phase, running, onStart, onPause, onReset, variant, pipSupported, onPiP }: CardProps) {
  const { t, language } = useTranslation();
  const isPt = language === 'pt';
  const isPip = variant === 'pip';
  return (
    <div
      className={
        isPip
          ? 'w-full h-full flex flex-col items-center justify-center gap-3 text-white select-none'
          : 'glass-panel px-5 py-4 flex flex-col items-center gap-3 text-white select-none w-[200px]'
      }
    >
      <span className="text-[11px] font-bold uppercase tracking-widest text-white/60">{phaseLabel(phase, isPt)}</span>
      <span className={`font-mono-timer tabular-nums ${isPip ? 'text-6xl' : 'text-4xl'} font-black`}>{fmt(remaining)}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={running ? onPause : onStart}
          className="w-9 h-9 rounded-full bg-primary/80 hover:bg-primary flex items-center justify-center transition-colors"
          aria-label={running ? (isPt ? 'Pausar timer' : 'Pause timer') : (isPt ? 'Iniciar timer' : 'Start timer')}
        >
          {running ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          onClick={onReset}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          aria-label={isPt ? 'Reiniciar timer' : 'Reset timer'}
        >
          <RotateCcw size={15} />
        </button>
        {!isPip && pipSupported && (
          <button
            onClick={onPiP}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label={isPt ? 'Abrir timer numa janela flutuante' : 'Open timer in a floating window'}
            title="Picture-in-Picture"
          >
            <PictureInPicture2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Draggable compact timer overlay (used in Ambient mode / when enabled). Shares
 * the single useTimer instance via props, and can pop into a Document
 * Picture-in-Picture window that stays on top outside the browser.
 */
export default function FloatingTimer(props: FloatingTimerProps) {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const { supported, pipWindow, open } = usePiP();

  return (
    <div ref={constraintsRef} className="fixed inset-0 z-50 pointer-events-none">
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragMomentum={false}
        dragElastic={0.05}
        className="absolute top-6 right-6 pointer-events-auto cursor-grab active:cursor-grabbing"
      >
        <TimerCard {...props} variant="float" pipSupported={supported} onPiP={open} />
      </motion.div>

      {pipWindow &&
        createPortal(<TimerCard {...props} variant="pip" />, pipWindow.document.body)}
    </div>
  );
}
