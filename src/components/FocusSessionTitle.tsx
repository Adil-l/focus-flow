import { useTranslation } from '@/lib/i18n';

interface FocusSessionTitleProps {
  /** Name of the currently active task, if any. */
  activeTaskName?: string;
  /** Open the Tasks panel to choose/define what to focus on. */
  onOpenTasks: () => void;
}

/**
 * Shown above the timer in Focus mode. With no active task it prompts
 * "What do you want to focus on?"; with one it shows the task name. Clicking
 * always opens the Tasks panel where the user defines/picks the focus.
 */
export default function FocusSessionTitle({ activeTaskName, onOpenTasks }: FocusSessionTitleProps) {
  const { t, language } = useTranslation();
  const prompt = language === 'pt' ? 'No que queres focar?' : 'What do you want to focus on?';

  return (
    <button
      onClick={onOpenTasks}
      title={language === 'pt' ? 'Abrir tarefas' : 'Open tasks'}
      className="mb-6 text-2xl md:text-3xl font-bold tracking-tight text-white/95 hover:text-white transition-colors text-center"
    >
      {activeTaskName || prompt}
    </button>
  );
}
