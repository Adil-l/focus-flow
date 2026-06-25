import { MessageSquareQuote, Clock, Sparkles } from 'lucide-react';
import type { Settings } from '@/stores/pomodoroStore';
import { SectionHeader } from './_shared';

const QUOTE_CATEGORIES = ['motivational', 'inspirational', 'selfcare', 'productivity', 'wisdom'];

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
  return (
    <div className="space-y-8">
      <SectionHeader title={title} subtitle={subtitle} />

      <div className="space-y-6">
        <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.04] border border-white/5 transition-all hover:bg-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <MessageSquareQuote size={16} />
            </div>
            <span className="text-sm font-bold text-white/80">{showGreetingsLabel}</span>
          </div>
          <label className="relative inline-flex cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showGreetings}
              onChange={e => onUpdate({ showGreetings: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-white/10 peer-checked:bg-primary/50 rounded-full transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
          </label>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.04] border border-white/5 transition-all hover:bg-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Clock size={16} />
              </div>
              <span className="text-sm font-bold text-white/80">Mostrar Relógio</span>
            </div>
            <label className="relative inline-flex cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showClock}
                onChange={e => onUpdate({ showClock: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-white/10 peer-checked:bg-primary/50 rounded-full transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
            </label>
          </div>

          <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.04] border border-white/5 transition-all hover:bg-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <MessageSquareQuote size={16} />
              </div>
              <span className="text-sm font-bold text-white/80">Mostrar Frase Motivacional</span>
            </div>
            <label className="relative inline-flex cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showQuote}
                onChange={e => onUpdate({ showQuote: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-white/10 peer-checked:bg-primary/50 rounded-full transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
            </label>
          </div>

          <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.04] border border-white/5 transition-all hover:bg-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles size={16} />
              </div>
              <span className="text-sm font-bold text-white/80">Mostrar Logotipo Focus Flow</span>
            </div>
            <label className="relative inline-flex cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showLogo}
                onChange={e => onUpdate({ showLogo: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-white/10 peer-checked:bg-primary/50 rounded-full transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
            </label>
          </div>
        </div>

        <div className="space-y-4 bg-white/[0.04] p-6 rounded-2xl border border-white/5">
          <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">{quoteCategoryLabel}</div>
          <div className="grid grid-cols-1 gap-2">
            {QUOTE_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => onUpdate({ quoteCategory: cat })}
                className={`px-4 py-4 rounded-xl text-xs font-black uppercase tracking-widest border transition-all text-left flex items-center justify-between ${
                  settings.quoteCategory === cat ? 'bg-primary/20 border-primary/40 text-white scale-[1.02]' : 'bg-black/20 border-white/5 text-white/30 hover:border-white/20'
                }`}
              >
                <span>{cat}</span>
                {settings.quoteCategory === cat && <Sparkles size={12} className="text-primary fill-current" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
