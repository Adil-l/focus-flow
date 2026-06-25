import { Target } from 'lucide-react';
import type { Settings, TimerMode } from '@/stores/pomodoroStore';
import { SectionHeader, Toggle } from './_shared';

const TIMER_MODES: { id: TimerMode; label: string }[] = [
  { id: 'pomodoro', label: 'Pomodoro' }, { id: 'countdown', label: 'Countdown' },
  { id: 'stopwatch', label: 'Stopwatch' }, { id: 'animedoro', label: 'Animedoro' }, { id: '52/17', label: '52/17' },
];

const TIMER_LENGTHS: { key: 'work' | 'short' | 'long'; label: string }[] = [
  { key: 'work', label: 'Focus' },
  { key: 'short', label: 'Short Break' },
  { key: 'long', label: 'Long Break' },
];

const TIMER_TOGGLES: { label: string; desc: string; badge?: string; key: string }[] = [
  { label: 'Use flip clock timer', desc: 'Display the clock with a flip animation.', badge: 'NEW', key: 'flipClock' },
  { label: 'Show timer progress bar', desc: 'Display a visual progress bar beneath the timer.', key: 'showProgressBar' },
  { label: 'Show notification', desc: 'Beta feature: Show a browser notification when the timer ends.', badge: 'BETA', key: 'showNotifications' },
  { label: 'Auto start timer on segment end', desc: 'This will run through the full focus sequence automatically.', key: 'autoNext' },
  { label: 'Show in-dashboard streak counter', desc: '', key: 'showStreakCounter' },
  { label: 'Show task in picture-in-picture', desc: '', key: 'pictureInPicture' },
];

const ALERT_SOUNDS = [
  { id: 'sparkle', label: '✨ Sparkle' },
  { id: 'train', label: '🚈 Train Arrival' },
  { id: 'commuter', label: '🚉 Commuter Jingle' },
  { id: 'gameshow', label: '🎲 Game Show' },
  { id: 'airport', label: '🛫 Airport' },
  { id: 'soft', label: '☁️ Soft' },
  { id: 'chime', label: '🔔 Chime' },
  { id: 'piano', label: '🎹 Piano' },
  { id: 'success', label: '🏆 Success' },
  { id: 'levelup', label: '👾 Level Up' },
  { id: 'applause', label: '👏 Applause' },
  { id: 'none', label: '🔕 No Alert' },
];

const STATIC_TALLIES = [
  { id: 'dots', label: 'Dots', emoji: '⚪' },
  { id: 'hearts', label: 'Hearts', emoji: '🤍' },
  { id: 'stars', label: '⭐️ Stars', emoji: '⭐' },
  { id: 'tomatoes', label: '🍅 Tomatoes', emoji: '🍅' },
  { id: 'bolts', label: '⚡️ Bolts', emoji: '⚡' },
  { id: 'graduation', label: '🎓 Graduation', emoji: '🎓' },
  { id: 'snowflake', label: '❄️ Snowflake', emoji: '❄️' },
  { id: 'snowman', label: '☃️ Snowman', emoji: '☃️' },
  { id: 'christmas', label: '🎄 Christmas Tree', emoji: '🎄' },
];

const DYNAMIC_TALLIES = [
  { id: 'growingtree', label: 'Growing Tree', emojis: '🌰🌱🌿🌳' },
  { id: 'flowerbloom', label: 'Flower Bloom', emojis: '🌱☀️🌷🌸' },
  { id: 'studygrind', label: 'Study Grind', emojis: '📚✏️🎓💼' },
  { id: 'spacetrip', label: 'Going To Space', emojis: '🚀🌙🛸🪐' },
  { id: 'nyc', label: 'NYC Vacation', emojis: '✈️🗽🍎🏙️' },
  { id: 'tokyo', label: 'Tokyo Vacation', emojis: '✈️🗾🍣🗼' },
  { id: 'beach', label: 'Beach Vacation', emojis: '✈️🌊🏖️🌴' },
  { id: 'mountain', label: 'Mountain Climb', emojis: '🧗⛰️🏔️🏕️' },
  { id: 'selfcare', label: 'Self Care Evening', emojis: '🛁🕯️🧖💆' },
  { id: 'mealprep', label: 'Meal Prep', emojis: '🥬🍳🥘🍽️' },
  { id: 'rainbow', label: 'Rain to Rainbow', emojis: '🌧️⛈️🌤️🌈' },
  { id: 'stem', label: 'STEM', emojis: '🔬🧪⚛️🧮' },
  { id: 'medical', label: 'Medical', emojis: '🩺💊💉🏥' },
  { id: 'law', label: 'Law', emojis: '⚖️📜🏛️👨‍⚖️' },
  { id: 'art', label: 'Art', emojis: '🎨✏️🖼️🖌️' },
];

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
  return (
    <div className="space-y-8">
      <SectionHeader title={title} subtitle={subtitle} />

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">⏱️ {timerModeLabel}</div>
          <div className="grid grid-cols-2 gap-2">
            {TIMER_MODES.map(mode => (
              <button key={mode.id} onClick={() => onUpdate({ timerMode: mode.id })}
                className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  settings.timerMode === mode.id ? 'bg-primary/20 border-primary/40 text-white' : 'bg-white/[0.04] border-white/5 text-white/30 hover:border-white/20'
                }`}>{mode.label}</button>
            ))}
          </div>
        </div>

        {/* Task ETA Mode (coming soon — not yet wired) */}
        <div className="flex items-start justify-between p-5 rounded-2xl bg-white/[0.04] border border-white/5 opacity-60">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Target size={16} />
              </div>
              <span className="text-sm font-bold text-white/80">
                Use Task ETA Mode timer
                <span className="text-[10px] bg-white/10 text-white/40 px-2 py-0.5 rounded-full ml-2 uppercase tracking-widest">Coming soon</span>
              </span>
            </div>
            <p className="text-[11px] text-white/40 mt-2 ml-11">Runs your timer according to task estimates.</p>
          </div>
        </div>

        {/* Timer Lengths */}
        <div className="space-y-3">
          <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">⏲️ Timer Lengths</div>
          <p className="text-[11px] text-white/40 ml-1 mb-3">For Task ETA Mode, adjust your timer settings in the tasks list.</p>
          <div className="grid grid-cols-3 gap-3">
            {TIMER_LENGTHS.map(({ key, label }) => (
              <div key={key} className="bg-white/[0.04] rounded-2xl p-5 border border-white/[0.05] transition-all hover:bg-white/[0.06]">
                <div className="text-[10px] text-white/30 font-black mb-3 uppercase tracking-widest">{label}</div>
                <div className="flex items-baseline gap-1">
                  <input type="number" value={settings[key]}
                    min={1} max={120}
                    onChange={e => onUpdate({ [key]: Math.max(1, Math.min(120, parseInt(e.target.value) || 1)) })}
                    className="bg-transparent text-3xl font-black text-white outline-none tabular-nums w-16" />
                  <span className="text-sm text-white/40">mins</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Timer Font */}
        <div className="bg-white/[0.04] rounded-2xl p-5 border border-white/[0.05]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white/80">Custom Timer Font</div>
              <p className="text-[11px] text-white/40 mt-1">Go to Clock settings to customize your timer and clock style.</p>
            </div>
            <button onClick={onNavigateToClock} className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-black">Open Settings</button>
          </div>
        </div>

        {/* Toggle Options */}
        <div className="space-y-3">
          <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">⚙️ OPÇÕES</div>

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
        <div className="space-y-3">
          <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">🔔 Alert Sound</div>
          <div className="grid grid-cols-3 gap-2">
            {ALERT_SOUNDS.map(s => (
              <button key={s.id} onClick={() => onUpdate({ alertSound: s.id })}
                className={`p-3 rounded-xl text-[11px] font-bold border transition-all ${
                  settings.alertSound === s.id ? 'bg-primary/20 border-primary/40 text-white' : 'bg-white/[0.04] border-white/5 text-white/40 hover:border-white/20'
                }`}>{s.label}</button>
            ))}
          </div>
        </div>

        {/* Session Tallies */}
        <div className="space-y-4">
          <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">📊 Session Tallies</div>
          <p className="text-[11px] text-white/40 ml-1 mb-3">Each tally represents one complete focus session.</p>

          {/* Static Session Tally */}
          <div>
            <div className="text-[11px] font-bold text-white/60 mb-2">Static Session Tally</div>
            <p className="text-[11px] text-white/30 mb-4">The same icon repeats for each session.</p>
            <div className="grid grid-cols-3 gap-3">
              {STATIC_TALLIES.map(tally => (
                <button key={tally.id} onClick={() => onUpdate({ tallyStyle: tally.id })}
                  className={`relative p-3.5 rounded-2xl text-[11px] font-bold border transition-all ${
                    settings.tallyStyle === tally.id ? 'bg-primary/20 border-primary/40 text-white scale-[1.02]' : 'bg-white/[0.04] border-white/5 text-white/40 hover:border-white/20'
                  }`}>
                  <div className="text-2xl mb-2">{tally.emoji}</div>
                  <div>{tally.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Session Tally */}
          <div className="mt-8">
            <div className="text-[11px] font-bold text-white/60 mb-2">Dynamic Session Tally</div>
            <p className="text-[11px] text-white/30 mb-4">Icons that evolve with each session.</p>
            <div className="grid grid-cols-3 gap-3">
              {DYNAMIC_TALLIES.map(tally => (
                <button key={tally.id} onClick={() => onUpdate({ tallyStyle: tally.id })}
                  className={`relative p-3.5 rounded-2xl text-[11px] font-bold border transition-all ${
                    settings.tallyStyle === tally.id ? 'bg-primary/20 border-primary/40 text-white scale-[1.02]' : 'bg-white/[0.04] border-white/5 text-white/40 hover:border-white/20'
                  }`}>
                  <div className="text-xl mb-2 tracking-widest">{tally.emojis}</div>
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
