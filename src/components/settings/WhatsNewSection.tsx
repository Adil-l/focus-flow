import { useTranslation } from '@/lib/i18n';
import { SectionHeader } from './_shared';

export default function WhatsNewSection({ title }: { title: string }) {
  const { t, language } = useTranslation();
  const items = [
    { v: 'v2.0', title: language === 'pt' ? 'Grande Atualização 🚀' : 'Major Update 🚀', desc: language === 'pt' ? 'Biblioteca de temas, gamificação (XP/níveis/distintivos), metas diárias, atalhos de teclado, modelos de tarefas, mapa de calor e muito mais!' : 'Theme library, gamification (XP/levels/badges), daily goals, keyboard shortcuts, task templates, heatmap, and more!' },
    { v: 'v1.0', title: language === 'pt' ? 'Lançamento' : 'Launch', desc: language === 'pt' ? 'Sistema Pomodoro completo com tarefas, sons, estatísticas e personalização.' : 'Full Pomodoro system with tasks, sounds, stats, and customization.' },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader title={title} />
      <div className="space-y-3">
        {items.map(item => (
          <div
            key={item.v}
            className="bg-white/[0.03] rounded-2xl p-5 border border-white/5 space-y-2 transition-all hover:bg-white/[0.05]"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-black bg-primary/20 text-primary px-2.5 py-0.5 rounded-full tracking-widest">{item.v}</span>
              <h4 className="text-sm font-black text-white">{item.title}</h4>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
