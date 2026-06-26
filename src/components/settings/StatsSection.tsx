import { lazy, Suspense } from 'react';
import type { HistoryEntry } from '@/stores/pomodoroStore';
import { useTranslation } from '@/lib/i18n';
import { SectionHeader } from './_shared';

// Lazy-load the heavy stats panel so it stays out of the main bundle until the
// Stats tab is actually viewed.
const StatsPanel = lazy(() => import('../StatsPanel'));

export default function StatsSection({
  title,
  subtitle,
  history,
  onClearHistory,
}: {
  title: string;
  subtitle: string;
  history: HistoryEntry[];
  onClearHistory: () => void;
}) {
  const { t, language } = useTranslation();
  return (
    <div className="space-y-8">
      <SectionHeader title={title} subtitle={subtitle} />
      <Suspense fallback={<div className="text-sm text-white/30">{language === 'pt' ? 'Carregando…' : 'Loading…'}</div>}>
        <StatsPanel history={history} onClearHistory={onClearHistory} />
      </Suspense>
    </div>
  );
}
