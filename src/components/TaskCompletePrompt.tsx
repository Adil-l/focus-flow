import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Plus, Clock, SkipForward, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

// Shown right after the break when the active task reaches its planned number of
// sessions. Lets the user finish the task, keep going (one more session or a
// custom number of minutes), or move on to the next task. Keeps the task's
// pomodoro counter in sync with what the user actually does.
interface TaskCompletePromptProps {
  taskName: string;
  done: number;
  est: number;
  workMinutes: number;
  hasNextTask: boolean;
  onComplete: () => void;
  onAddSession: () => void;
  onAddMinutes: (minutes: number) => void;
  onNextTask: () => void;
  onClose: () => void;
}

export default function TaskCompletePrompt({
  taskName, done, est, workMinutes, hasNextTask,
  onComplete, onAddSession, onAddMinutes, onNextTask, onClose,
}: TaskCompletePromptProps) {
  const { language } = useTranslation();
  const pt = language === 'pt';
  const [minutes, setMinutes] = useState(10);

  const rowBase =
    'flex w-full items-center justify-center gap-2 rounded-xl min-h-[48px] px-4 text-sm font-bold transition-all active:scale-[0.98]';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass-panel relative my-auto w-full max-w-sm p-6"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          aria-label={pt ? 'Continuar depois' : 'Decide later'}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="mb-1 flex items-center gap-2 text-lg font-black text-white">
          <CheckCircle2 size={22} className="text-emerald-400" />
          {pt ? 'Tarefa terminada?' : 'Task done?'}
        </div>
        <p className="mb-5 text-[13px] text-white/60">
          {pt ? 'Concluíste todas as sessões planeadas de' : 'You finished all planned sessions for'}{' '}
          <span className="font-semibold text-white/85">{taskName}</span>{' '}
          <span className="whitespace-nowrap text-white/40">({done}/{est})</span>.
        </p>

        <div className="space-y-2.5">
          <button
            onClick={onComplete}
            className={`${rowBase} bg-emerald-500/90 text-white hover:bg-emerald-500`}
          >
            <CheckCircle2 size={18} /> {pt ? 'Marcar como concluída' : 'Mark as done'}
          </button>

          <button
            onClick={onAddSession}
            className={`${rowBase} bg-white/[0.06] text-white hover:bg-white/[0.1] border border-white/10`}
          >
            <Plus size={18} /> {pt ? `Mais 1 sessão (+${workMinutes} min)` : `One more session (+${workMinutes} min)`}
          </button>

          {/* Custom minutes */}
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2">
            <Clock size={18} className="ml-1 shrink-0 text-white/50" />
            <input
              type="number"
              min={1}
              max={180}
              inputMode="numeric"
              value={minutes}
              onChange={(e) => setMinutes(Math.max(1, Math.min(180, Number(e.target.value) || 1)))}
              className="w-14 min-h-[40px] rounded-lg border border-white/10 bg-black/30 px-2 text-center text-base font-bold text-white outline-none focus:border-primary/60"
              aria-label={pt ? 'Minutos extra' : 'Extra minutes'}
            />
            <span className="text-xs text-white/50">min</span>
            <button
              onClick={() => onAddMinutes(minutes)}
              className="ml-auto flex min-h-[40px] items-center gap-1.5 rounded-lg bg-primary/80 px-4 text-sm font-bold text-white hover:bg-primary active:scale-[0.98]"
            >
              <Plus size={16} /> {pt ? 'Adicionar' : 'Add'}
            </button>
          </div>

          {hasNextTask && (
            <button
              onClick={onNextTask}
              className={`${rowBase} bg-white/[0.06] text-white/80 hover:bg-white/[0.1] border border-white/10`}
            >
              <SkipForward size={18} /> {pt ? 'Avançar para a próxima tarefa' : 'Move to next task'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
