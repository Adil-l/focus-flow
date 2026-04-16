import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
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
  onPhaseSelect: (phase: SessionPhase) => void;
  isCompact?: boolean;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

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
  onStart, onPause, onReset, onResetSegment, onSkipBreak, onPhaseSelect,
  isCompact = false,
}: TimerDisplayProps) {
  const icon = tallyIcons[tallyStyle] || '●';

  if (isCompact) {
    return (
      <div className="flex flex-col items-center justify-center">
        <motion.div
          className="font-mono-timer text-[140px] md:text-[220px] font-extrabold text-white leading-none text-glow select-none"
          animate={running ? { scale: [1, 1.01, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {formatTime(remaining)}
        </motion.div>
        
        <div className="flex items-center gap-6 mt-8">
          <button
            onClick={running ? onPause : onStart}
            className="w-20 h-20 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-all"
          >
            {running ? <Pause size={32} /> : <Play size={32} fill="currentColor" />}
          </button>
          
          <button
            onClick={onResetSegment}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/40 hover:text-white/60 transition-all"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center relative z-10">
      {/* "What do you want to focus on?" */}
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl md:text-2xl font-semibold text-white/90 mb-6 tracking-tight"
      >
        What do you want to focus on?
      </motion.h2>

      {/* Phase tabs */}
      <div className="flex gap-3 mb-4">
        {([
          { id: 'work' as SessionPhase, label: 'Focus' },
          { id: 'short' as SessionPhase, label: 'Short Break' },
          { id: 'long' as SessionPhase, label: 'Long Break' },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => onPhaseSelect(tab.id)}
            className={`phase-tab ${phase === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Session tallies */}
      <div className="flex items-center gap-1.5 mb-4 h-5">
        {Array.from({ length: Math.min(sessions, 8) }).map((_, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`text-xs ${tallyStyle === 'dots' ? 'text-white/80' : ''}`}
          >
            {icon}
          </motion.span>
        ))}
        {sessions > 8 && (
          <span className="text-xs text-white/40">+{sessions - 8}</span>
        )}
      </div>

      {/* Giant timer */}
      <motion.div
        className="font-mono-timer text-[120px] md:text-[180px] font-extrabold text-white leading-none text-glow select-none"
        animate={running ? { scale: [1, 1.005, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {formatTime(remaining)}
      </motion.div>

      {/* Controls */}
      <div className="flex items-center gap-3 mt-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={running ? onPause : onStart}
          className="px-8 py-3 rounded-full font-semibold text-sm text-white transition-all"
          style={{
            background: running
              ? 'hsl(270 30% 25% / 0.6)'
              : 'hsl(270 80% 65% / 0.5)',
            border: '1.5px solid hsl(270 80% 65% / 0.4)',
            boxShadow: running ? 'none' : '0 0 30px hsl(270 80% 65% / 0.3)',
          }}
        >
          {running ? 'Pause' : 'Start'}
        </motion.button>

        {phase !== 'work' && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onSkipBreak}
            className="px-6 py-3 rounded-full text-sm text-white/80 transition-all"
            style={{
              border: '1.5px solid hsl(0 0% 100% / 0.2)',
            }}
          >
            Skip Break
          </motion.button>
        )}

        <button
          onClick={onResetSegment}
          className="p-3 rounded-full text-white/50 hover:text-white/80 transition-all"
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
}
