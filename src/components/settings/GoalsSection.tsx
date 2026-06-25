import { useGoals } from '@/stores/goalsStore';
import { SectionHeader } from './_shared';

const GOAL_INPUTS = [
  { key: 'dailySessions' as const, label: 'Sessões Diárias', min: 1, max: 20, unit: '', color: 'purple', icon: '🎯' },
  { key: 'dailyMinutes' as const, label: 'Minutos Diários', min: 15, max: 480, unit: 'm', color: 'blue', icon: '⏱️' },
  { key: 'weeklySessions' as const, label: 'Sessões Semanais', min: 5, max: 100, unit: '', color: 'emerald', icon: '📅' },
  { key: 'weeklyMinutes' as const, label: 'Minutos Semanais', min: 60, max: 2400, unit: 'm', color: 'orange', icon: '🔥' },
];

// These options are not wired to any store yet. They are rendered as clearly
// disabled "coming soon" rows rather than fake interactive toggles.
const UPCOMING_OPTIONS = [
  { label: 'Notificar quando meta for atingida', desc: 'Receber aviso quando completar o objetivo diário' },
  { label: 'Resetar automaticamente', desc: 'Zerar progresso no começo de cada dia' },
  { label: 'Mostrar contador no dashboard', desc: 'Exibir progresso na página principal' },
  { label: 'Celebração ao completar', desc: 'Efeito especial quando meta for alcançada' },
];

export default function GoalsSection({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const { goals, setGoals } = useGoals();

  return (
    <div className="space-y-8">
      <SectionHeader title={title} subtitle={subtitle} />

      {/* Cards de Progresso Atual */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-purple-500/15 to-violet-500/5 rounded-[24px] p-5 border border-purple-500/20">
          <div className="text-[10px] font-black text-purple-400/60 uppercase tracking-[0.2em] mb-2">HOJE</div>
          <div className="text-3xl font-black text-white mb-1">0/{goals.dailySessions}</div>
          <div className="text-xs text-white/40">sessões concluídas</div>
          <div className="mt-4 w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full" style={{ width: '0%' }} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/15 to-green-500/5 rounded-[24px] p-5 border border-emerald-500/20">
          <div className="text-[10px] font-black text-emerald-400/60 uppercase tracking-[0.2em] mb-2">ESTA SEMANA</div>
          <div className="text-3xl font-black text-white mb-1">0/{goals.weeklySessions}</div>
          <div className="text-xs text-white/40">sessões concluídas</div>
          <div className="mt-4 w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full" style={{ width: '0%' }} />
          </div>
        </div>
      </div>

      {/* Configuração das Metas */}
      <div className="space-y-6">
        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">⚙️ DEFINIR OBJETIVOS</div>

        <div className="grid grid-cols-2 gap-3">
          {GOAL_INPUTS.map(goal => (
            <div key={goal.key} className="bg-white/[0.04] rounded-[20px] p-4 border border-white/[0.05] transition-all hover:bg-white/[0.06] hover:scale-[1.02] group">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{goal.icon}</span>
                  <div>
                    <div className="text-sm font-black text-white/80">{goal.label}</div>
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">OBJETIVO</div>
                  </div>
                </div>
                <div className="text-2xl font-black text-white">{goals[goal.key]}{goal.unit}</div>
              </div>
              <input
                type="range"
                min={goal.min}
                max={goal.max}
                step={goal.key.includes('Minutes') ? 15 : 1}
                value={goals[goal.key]}
                onChange={e => setGoals({ [goal.key]: parseInt(e.target.value) })}
                className="w-full accent-primary h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Metas Mensais */}
      <div className="bg-white/[0.04] rounded-[24px] p-6 border border-white/[0.05]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-[10px] font-black text-yellow-400/70 uppercase tracking-[0.2em] mb-1">⭐ META MENSAL</div>
            <div className="text-base font-black text-white/90">Desafio do Mês</div>
          </div>
          <div className="text-3xl">🏆</div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
            <span className="text-sm text-white/60">Dias consecutivos</span>
            <span className="text-sm font-black text-yellow-400">30 dias</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
            <span className="text-sm text-white/60">Horas totais</span>
            <span className="text-sm font-black text-yellow-400">50 horas</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
            <span className="text-sm text-white/60">Consistência</span>
            <span className="text-sm font-black text-yellow-400">90%</span>
          </div>
        </div>
      </div>

      {/* Opções Adicionais (coming soon — not yet wired) */}
      <div className="space-y-3">
        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">⚡ OPÇÕES</div>

        {UPCOMING_OPTIONS.map((opt, i) => (
          <div key={i} className="flex items-start justify-between p-4 rounded-2xl bg-white/[0.04] border border-white/5 opacity-60">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white/80">{opt.label}</span>
                <span className="text-[10px] bg-white/10 text-white/40 px-2 py-0.5 rounded-full uppercase tracking-widest">Em breve</span>
              </div>
              <div className="text-[11px] text-white/40 mt-1">{opt.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
