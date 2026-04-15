import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward, RefreshCw } from 'lucide-react';
import type { SessionPhase } from '@/stores/pomodoroStore';

interface TimerDisplayProps {
  remaining: number;
  phase: SessionPhase;
  running: boolean;
  progress: number;
  sessions: number;
  tallyStyle: string;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onResetSegment: () => void;
  onSkipBreak: () => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const phaseLabels: Record<SessionPhase, string> = {
  work: 'FOCO',
  short: 'PAUSA CURTA',
  long: 'PAUSA LONGA',
};

const phaseColors: Record<SessionPhase, string> = {
  work: 'text-primary',
  short: 'text-success',
  long: 'text-warning',
};

const phaseGlows: Record<SessionPhase, string> = {
  work: 'shadow-[0_0_60px_hsl(210_100%_56%/0.2)]',
  short: 'shadow-[0_0_60px_hsl(145_65%_46%/0.2)]',
  long: 'shadow-[0_0_60px_hsl(38_92%_55%/0.2)]',
};

const tallyIcons: Record<string, string> = {
  dots: '●',
  hearts: '❤️',
  stars: '⭐',
  tomatoes: '🍅',
  lightning: '⚡',
  snowflakes: '❄️',
  trees: '🌳',
};

export default function TimerDisplay({
  remaining, phase, running, progress, sessions, tallyStyle,
  onStart, onPause, onReset, onResetSegment, onSkipBreak,
}: TimerDisplayProps) {
  const icon = tallyIcons[tallyStyle] || '●';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-3xl p-8 md:p-12 text-center relative overflow-hidden ${phaseGlows[phase]}`}
    >
      {/* Phase label */}
      <motion.div
        key={phase}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-sm font-semibold tracking-[0.2em] mb-6 ${phaseColors[phase]}`}
      >
        {phaseLabels[phase]}
      </motion.div>

      {/* Timer */}
      <motion.div
        className="font-mono-timer text-7xl md:text-9xl font-bold text-foreground leading-none mb-6"
        animate={running ? { scale: [1, 1.01, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {formatTime(remaining)}
      </motion.div>

      {/* Progress bar */}
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-8 mx-auto max-w-md">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: phase === 'work'
              ? 'linear-gradient(90deg, hsl(210 100% 56%), hsl(160 84% 44%))'
              : phase === 'short'
              ? 'hsl(145 65% 46%)'
              : 'hsl(38 92% 55%)',
          }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onResetSegment}
          className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all"
          title="Reset segmento"
        >
          <RefreshCw size={18} />
        </button>

        <button
          onClick={onReset}
          className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all"
          title="Reset tudo"
        >
          <RotateCcw size={18} />
        </button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={running ? onPause : onStart}
          className={`px-10 py-4 rounded-2xl font-semibold text-lg transition-all ${
            running
              ? 'bg-secondary text-foreground hover:bg-secondary/80'
              : 'bg-primary text-primary-foreground hover:opacity-90'
          }`}
          style={!running ? {
            boxShadow: '0 0 30px hsl(210 100% 56% / 0.3)',
          } : undefined}
        >
          {running ? (
            <span className="flex items-center gap-2"><Pause size={20} /> PAUSAR</span>
          ) : (
            <span className="flex items-center gap-2"><Play size={20} /> INICIAR</span>
          )}
        </motion.button>

        {phase !== 'work' && (
          <button
            onClick={onSkipBreak}
            className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all"
            title="Pular pausa"
          >
            <SkipForward size={18} />
          </button>
        )}
      </div>

      {/* Session tallies */}
      <div className="mt-6 flex items-center justify-center gap-1.5">
        {Array.from({ length: Math.min(sessions, 12) }).map((_, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-lg"
          >
            {icon}
          </motion.span>
        ))}
        {sessions > 12 && (
          <span className="text-sm text-muted-foreground ml-1">+{sessions - 12}</span>
        )}
        {sessions === 0 && (
          <span className="text-sm text-muted-foreground">Nenhuma sessão ainda</span>
        )}
      </div>
    </motion.div>
  );
}
