import { MessageSquareQuote, Clock, Sparkles, Quote } from 'lucide-react';
import type { Settings } from '@/stores/pomodoroStore';
import { useTranslation } from '@/lib/i18n';
import { SectionHeader, Toggle } from './_shared';

const QUOTE_CATEGORIES = ['motivational', 'inspirational', 'selfcare', 'productivity', 'wisdom'];

const QUOTE_CATEGORY_LABELS_PT: Record<string, string> = {
  motivational: 'motivacional',
  inspirational: 'inspirador',
  selfcare: 'autocuidado',
  productivity: 'produtividade',
  wisdom: 'sabedoria',
};

export default function QuotesSection({
  title,
  subtitle,
  settings,
  onUpdate,
  showGreetingsLabel,
  quoteCategoryLabel,
}: {
  title: string;
  subtitle: string;
  settings: Settings;
  onUpdate: (update: Partial<Settings>) => void;
  showGreetingsLabel: string;
  quoteCategoryLabel: string;
}) {
  const { t, language } = useTranslation();
  return (
    <div className="space-y-6">
      <SectionHeader title={title} subtitle={subtitle} />

      <div className="space-y-2">
        <Toggle
          icon={<MessageSquareQuote size={15} />}
          label={showGreetingsLabel}
          checked={settings.showGreetings}
          onChange={v => onUpdate({ showGreetings: v })}
        />
        <Toggle
          icon={<Clock size={15} />}
          label={language === 'pt' ? 'Mostrar Relógio' : 'Show Clock'}
          checked={settings.showClock}
          onChange={v => onUpdate({ showClock: v })}
        />
        <Toggle
          icon={<Quote size={15} />}
          label={language === 'pt' ? 'Mostrar Frase Motivacional' : 'Show Motivational Quote'}
          checked={settings.showQuote}
          onChange={v => onUpdate({ showQuote: v })}
        />
        <Toggle
          icon={<Sparkles size={15} />}
          label={language === 'pt' ? 'Mostrar Logotipo Focus Flow' : 'Show Focus Flow Logo'}
          checked={settings.showLogo}
          onChange={v => onUpdate({ showLogo: v })}
        />
      </div>

      <div className="bg-white/[0.04] p-4 rounded-xl border border-white/5">
        <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">{quoteCategoryLabel}</div>
        <div className="grid grid-cols-2 gap-2">
          {QUOTE_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => onUpdate({ quoteCategory: cat })}
              className={`px-3 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest border transition-all flex items-center justify-between gap-1 ${
                settings.quoteCategory === cat ? 'bg-primary/20 border-primary/40 text-white' : 'bg-black/20 border-white/5 text-white/30 hover:border-white/20'
              }`}
            >
              <span className="truncate">{language === 'pt' ? (QUOTE_CATEGORY_LABELS_PT[cat] ?? cat) : cat}</span>
              {settings.quoteCategory === cat && <Sparkles size={11} className="text-primary fill-current shrink-0" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
