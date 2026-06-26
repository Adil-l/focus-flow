import { Target } from 'lucide-react';
import type { Settings, TimerMode } from '@/stores/pomodoroStore';
import { useTranslation } from '@/lib/i18n';
import { SectionHeader, Toggle } from './_shared';

export default function TimerSection({
  title,
  subtitle,
  settings,
  onUpdate,
  onNavigateToClock,
  timerModeLabel,
}: {
  title: string;
  subtitle: string;
  settings: Settings;
  onUpdate: (update: Partial<Settings>) => void;
  onNavigateToClock: () => void;
  timerModeLabel: string;
}) {
  const { t, language } = useTranslation();

  const TIMER_MODES: { id: TimerMode; label: string }[] = [
    { id: 'pomodoro', label: 'Pomodoro' }, { id: 'countdown', label: language === 'pt' ? 'Contagem Regressiva' : 'Countdown' },
    { id: 'stopwatch', label: language === 'pt' ? 'Cronômetro' : 'Stopwatch' }, { id: 'animedoro', label: 'Animedoro' }, { id: '52/17', label: '52/17' },
  ];

  const TIMER_LENGTHS: { key: 'work' | 'short' | 'long'; label: string }[] = [
    { key: 'work', label: language === 'pt' ? 'Foco' : 'Focus' },
    { key: 'short', label: language === 'pt' ? 'Intervalo Curto' : 'Short Break' },
    { key: 'long', label: language === 'pt' ? 'Intervalo Longo' : 'Long Break' },
  ];

  const TIMER_TOGGLES: { label: string; desc: string; badge?: string; key: string }[] = [
    { label: language === 'pt' ? 'Usar timer flip' : 'Use flip clock timer', desc: language === 'pt' ? 'Exibe o relógio com uma animação de flip.' : 'Display the clock with a flip animation.', badge: 'NEW', key: 'flipClock' },
    { label: language === 'pt' ? 'Mostrar barra de progresso do timer' : 'Show timer progress bar', desc: language === 'pt' ? 'Exibe uma barra de progresso visual abaixo do timer.' : 'Display a visual progress bar beneath the timer.', key: 'showProgressBar' },
    { label: language === 'pt' ? 'Mostrar notificação' : 'Show notification', desc: language === 'pt' ? 'Recurso beta: mostra uma notificação do navegador quando o timer termina.' : 'Beta feature: Show a browser notification when the timer ends.', badge: 'BETA', key: 'showNotifications' },
    { label: language === 'pt' ? 'Iniciar timer automaticamente ao fim do segmento' : 'Auto start timer on segment end', desc: language === 'pt' ? 'Isto percorre automaticamente toda a sequência de foco.' : 'This will run through the full focus sequence automatically.', key: 'autoNext' },
    { label: language === 'pt' ? 'Mostrar contador de sequência no painel' : 'Show in-dashboard streak counter', desc: '', key: 'showStreakCounter' },
    { label: language === 'pt' ? 'Mostrar tarefa em picture-in-picture' : 'Show task in picture-in-picture', desc: '', key: 'pictureInPicture' },
  ];

  const ALERT_SOUNDS = [
    { id: 'sparkle', label: language === 'pt' ? '✨ Brilho' : '✨ Sparkle' },
    { id: 'train', label: language === 'pt' ? '🚈 Chegada do Trem' : '🚈 Train Arrival' },
    { id: 'commuter', label: language === 'pt' ? '🚉 Jingle do Metrô' : '🚉 Commuter Jingle' },
    { id: 'gameshow', label: language === 'pt' ? '🎲 Programa de TV' : '🎲 Game Show' },
    { id: 'airport', label: language === 'pt' ? '🛫 Aeroporto' : '🛫 Airport' },
    { id: 'soft', label: language === 'pt' ? '☁️ Suave' : '☁️ Soft' },
    { id: 'chime', label: language === 'pt' ? '🔔 Sino' : '🔔 Chime' },
    { id: 'piano', label: language === 'pt' ? '🎹 Piano' : '🎹 Piano' },
    { id: 'success', label: language === 'pt' ? '🏆 Sucesso' : '🏆 Success' },
    { id: 'levelup', label: language === 'pt' ? '👾 Subir de Nível' : '👾 Level Up' },
    { id: 'applause', label: language === 'pt' ? '👏 Aplausos' : '👏 Applause' },
    { id: 'none', label: language === 'pt' ? '🔕 Sem Alerta' : '🔕 No Alert' },
  ];

  const STATIC_TALLIES = [
    { id: 'dots', label: language === 'pt' ? 'Pontos' : 'Dots', emoji: '⚪' },
    { id: 'hearts', label: language === 'pt' ? 'Corações' : 'Hearts', emoji: '🤍' },
    { id: 'stars', label: language === 'pt' ? '⭐️ Estrelas' : '⭐️ Stars', emoji: '⭐' },
    { id: 'tomatoes', label: language === 'pt' ? '🍅 Tomates' : '🍅 Tomatoes', emoji: '🍅' },
    { id: 'bolts', label: language === 'pt' ? '⚡️ Raios' : '⚡️ Bolts', emoji: '⚡' },
    { id: 'graduation', label: language === 'pt' ? '🎓 Formatura' : '🎓 Graduation', emoji: '🎓' },
    { id: 'snowflake', label: language === 'pt' ? '❄️ Floco de Neve' : '❄️ Snowflake', emoji: '❄️' },
    { id: 'snowman', label: language === 'pt' ? '☃️ Boneco de Neve' : '☃️ Snowman', emoji: '☃️' },
    { id: 'christmas', label: language === 'pt' ? '🎄 Árvore de Natal' : '🎄 Christmas Tree', emoji: '🎄' },
  ];

  const DYNAMIC_TALLIES = [
    { id: 'growingtree', label: language === 'pt' ? 'Árvore Crescendo' : 'Growing Tree', emojis: '🌰🌱🌿🌳' },
    { id: 'flowerbloom', label: language === 'pt' ? 'Flor Desabrochando' : 'Flower Bloom', emojis: '🌱☀️🌷🌸' },
    { id: 'studygrind', label: language === 'pt' ? 'Maratona de Estudo' : 'Study Grind', emojis: '📚✏️🎓💼' },
    { id: 'spacetrip', label: language === 'pt' ? 'Indo ao Espaço' : 'Going To Space', emojis: '🚀🌙🛸🪐' },
    { id: 'nyc', label: language === 'pt' ? 'Férias em NYC' : 'NYC Vacation', emojis: '✈️🗽🍎🏙️' },
    { id: 'tokyo', label: language === 'pt' ? 'Férias em Tóquio' : 'Tokyo Vacation', emojis: '✈️🗾🍣🗼' },
    { id: 'beach', label: language === 'pt' ? 'Férias na Praia' : 'Beach Vacation', emojis: '✈️🌊🏖️🌴' },
    { id: 'mountain', label: language === 'pt' ? 'Escalada na Montanha' : 'Mountain Climb', emojis: '🧗⛰️🏔️🏕️' },
    { id: 'selfcare', label: language === 'pt' ? 'Noite de Autocuidado' : 'Self Care Evening', emojis: '🛁🕯️🧖💆' },
    { id: 'mealprep', label: language === 'pt' ? 'Preparo de Refeições' : 'Meal Prep', emojis: '🥬🍳🥘🍽️' },
    { id: 'rainbow', label: language === 'pt' ? 'Chuva ao Arco-íris' : 'Rain to Rainbow', emojis: '🌧️⛈️🌤️🌈' },
    { id: 'stem', label: language === 'pt' ? 'STEM' : 'STEM', emojis: '🔬🧪⚛️🧮' },
    { id: 'medical', label: language === 'pt' ? 'Medicina' : 'Medical', emojis: '🩺💊💉🏥' },
    { id: 'law', label: language === 'pt' ? 'Direito' : 'Law', emojis: '⚖️📜🏛️👨‍⚖️' },
    { id: 'art', label: language === 'pt' ? 'Arte' : 'Art', emojis: '🎨✏️🖼️🖌️' },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title={title} subtitle={subtitle} />

      <div className="space-y-5">
        <div className="space-y-2.5">
          <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">⏱️ {timerModeLabel}</div>
          <div className="grid grid-cols-3 gap-2">
            {TIMER_MODES.map(mode => (
              <button key={mode.id} onClick={() => onUpdate({ timerMode: mode.id })}
                className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  settings.timerMode === mode.id ? 'bg-primary/20 border-primary/40 text-white' : 'bg-white/[0.04] border-white/5 text-white/30 hover:border-white/20'
                }`}>{mode.label}</button>
            ))}
          </div>
        </div>

        {/* Task ETA Mode */}
        <Toggle
          icon={<Target size={15} />}
          label={language === 'pt' ? 'Usar Modo ETA da Tarefa' : 'Use Task ETA Mode'}
          desc={language === 'pt' ? 'Mostra a hora prevista de conclusão da sua tarefa ativa, com base nos pomodoros estimados restantes.' : 'Show the projected finish time for your active task, based on its remaining estimated pomodoros.'}
          checked={settings.taskEtaMode}
          onChange={v => onUpdate({ taskEtaMode: v })}
        />

        {/* Timer Lengths */}
        <div className="space-y-2.5">
          <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">⏲️ {language === 'pt' ? 'Durações do Timer' : 'Timer Lengths'}</div>
          <p className="text-[11px] text-white/40 ml-1 mb-2">{language === 'pt' ? 'Para o Modo ETA da Tarefa, ajuste as configurações do timer na lista de tarefas.' : 'For Task ETA Mode, adjust your timer settings in the tasks list.'}</p>
          <div className="grid grid-cols-3 gap-2.5">
            {TIMER_LENGTHS.map(({ key, label }) => (
              <div key={key} className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05] transition-all hover:bg-white/[0.06]">
                <div className="text-[10px] text-white/30 font-black mb-2 uppercase tracking-widest">{label}</div>
                <div className="flex items-baseline gap-1">
                  <input type="number" value={settings[key]}
                    min={1} max={120}
                    onChange={e => onUpdate({ [key]: Math.max(1, Math.min(120, parseInt(e.target.value) || 1)) })}
                    className="bg-transparent text-2xl font-black text-white outline-none tabular-nums w-12" />
                  <span className="text-xs text-white/40">min</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Timer Font */}
        <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05]">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-white/80">{language === 'pt' ? 'Fonte Personalizada do Timer' : 'Custom Timer Font'}</div>
              <p className="text-[11px] text-white/40 mt-0.5">{language === 'pt' ? 'Personalize o estilo do timer e do relógio nas configurações do Relógio.' : 'Customize your timer & clock style in Clock settings.'}</p>
            </div>
            <button onClick={onNavigateToClock} className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-black shrink-0">{language === 'pt' ? 'Abrir' : 'Open'}</button>
          </div>
        </div>

        {/* Toggle Options */}
        <div className="space-y-2">
          <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">⚙️ {language === 'pt' ? 'OPÇÕES' : 'OPTIONS'}</div>

          {TIMER_TOGGLES.map((opt, i) => (
            <Toggle
              key={i}
              label={opt.label}
              desc={opt.desc}
              badge={opt.badge && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{opt.badge}</span>}
              checked={Boolean(settings[opt.key as keyof Settings] ?? false)}
              onChange={checked => onUpdate({ [opt.key]: checked } as Partial<Settings>)}
            />
          ))}
        </div>

        {/* Alert Sound */}
        <div className="space-y-2.5">
          <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">🔔 {language === 'pt' ? 'Som de Alerta' : 'Alert Sound'}</div>
          <div className="grid grid-cols-3 gap-2">
            {ALERT_SOUNDS.map(s => (
              <button key={s.id} onClick={() => onUpdate({ alertSound: s.id })}
                className={`py-2.5 px-2 rounded-lg text-[11px] font-bold border transition-all ${
                  settings.alertSound === s.id ? 'bg-primary/20 border-primary/40 text-white' : 'bg-white/[0.04] border-white/5 text-white/40 hover:border-white/20'
                }`}>{s.label}</button>
            ))}
          </div>
        </div>

        {/* Session Tallies */}
        <div className="space-y-3">
          <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">📊 {language === 'pt' ? 'Marcadores de Sessão' : 'Session Tallies'}</div>
          <p className="text-[11px] text-white/40 ml-1">{language === 'pt' ? 'Cada marcador representa uma sessão de foco completa.' : 'Each tally represents one complete focus session.'}</p>

          {/* Static Session Tally */}
          <div>
            <div className="text-[11px] font-bold text-white/60 mb-2">{language === 'pt' ? 'Estático · o mesmo ícone se repete' : 'Static · the same icon repeats'}</div>
            <div className="grid grid-cols-3 gap-2">
              {STATIC_TALLIES.map(tally => (
                <button key={tally.id} onClick={() => onUpdate({ tallyStyle: tally.id })}
                  className={`relative p-2.5 rounded-xl text-[11px] font-bold border transition-all ${
                    settings.tallyStyle === tally.id ? 'bg-primary/20 border-primary/40 text-white scale-[1.02]' : 'bg-white/[0.04] border-white/5 text-white/40 hover:border-white/20'
                  }`}>
                  <div className="text-xl mb-1">{tally.emoji}</div>
                  <div>{tally.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Session Tally */}
          <div className="mt-4">
            <div className="text-[11px] font-bold text-white/60 mb-2">{language === 'pt' ? 'Dinâmico · ícones que evoluem' : 'Dynamic · icons that evolve'}</div>
            <div className="grid grid-cols-3 gap-2">
              {DYNAMIC_TALLIES.map(tally => (
                <button key={tally.id} onClick={() => onUpdate({ tallyStyle: tally.id })}
                  className={`relative p-2.5 rounded-xl text-[11px] font-bold border transition-all ${
                    settings.tallyStyle === tally.id ? 'bg-primary/20 border-primary/40 text-white scale-[1.02]' : 'bg-white/[0.04] border-white/5 text-white/40 hover:border-white/20'
                  }`}>
                  <div className="text-base mb-1 tracking-widest">{tally.emojis}</div>
                  <div>{tally.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
