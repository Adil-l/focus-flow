import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import type { SessionPhase } from '@/stores/pomodoroStore';
import { useTranslation } from '@/lib/i18n';

interface TimerDisplayProps {
  remaining: number;
  phase: SessionPhase;
  running: boolean;
  progress: number;
  sessions: number;
  tallyStyle: string;
  clockStyle?: string;
  fontScale?: number;
  verticalOffset?: number;
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

const tallyIcons: Record<string, string | string[]> = {
  // Static
  dots: '⚪',
  hearts: '🤍',
  stars: '⭐',
  tomatoes: '🍅',
  bolts: '⚡',
  graduation: '🎓',
  snowflake: '❄️',
  snowman: '☃️',
  christmas: '🎄',
  lightning: '⚡',
  trees: '🌳',

  // Dynamic (evoluem com cada sessão)
  growingtree: ['🌰', '🌱', '🌿', '🌳', '🌲', '🌴', '🎄', '🏔️'],
  flowerbloom: ['🌱', '☀️', '🌷', '🌸', '🌺', '🌹', '🌻', '🌼'],
  studygrind: ['📚', '✏️', '📝', '🎓', '💼', '🏢', '🏛️', '👑'],
  spacetrip: ['🚀', '🌙', '🛸', '🪐', '⭐', '🌌', '👨‍🚀', '🌍'],
  nyc: ['✈️', '🗽', '🍎', '🏙️', '🚕', '🗼', '🎭', '🍕'],
  tokyo: ['✈️', '🗾', '🍣', '🗼', '⛩️', '🎌', '🍜', '🌸'],
  beach: ['✈️', '🌊', '🏖️', '🌴', '🏄', '☀️', '🍹', '🌅'],
  mountain: ['🧗', '⛰️', '🏔️', '🏕️', '⛺', '🌄', '🦅', '🏆'],
  selfcare: ['🛁', '🕯️', '🧖', '💆', '💅', '🧘', '😌', '✨'],
  mealprep: ['🥬', '🍳', '🥘', '🍽️', '🥗', '👨‍🍳', '🍴', '😋'],
  rainbow: ['🌧️', '⛈️', '🌤️', '🌈', '☀️', '🦋', '🌺', '✨'],
  stem: ['🔬', '🧪', '⚛️', '🧮', '💻', '🔧', '🚀', '🧠'],
  medical: ['🩺', '💊', '💉', '🏥', '👨‍⚕️', '💙', '💚', '❤️'],
  law: ['⚖️', '📜', '🏛️', '👨‍⚖️', '📚', '🎩', '✒️', '🏆'],
  art: ['🎨', '✏️', '🖼️', '🖌️', '🎭', '🎵', '🎬', '✨'],
};

export default function TimerDisplay({
  remaining, phase, running, progress, sessions, tallyStyle,
  clockStyle = 'default',
  fontScale = 1,
  verticalOffset = 1,
  onStart, onPause, onReset, onResetSegment, onSkipBreak, onPhaseSelect,
  isCompact = false,
}: TimerDisplayProps) {
  const { t } = useTranslation();
  console.log('✅ Tally style selecionado:', tallyStyle);
  const icon = tallyIcons[tallyStyle] || '⚪';

  const baseSize = `calc(1em * ${fontScale})`;

   const timerFontClass = (() => {
     switch (clockStyle) {
       // BASIC
       case 'default': return 'font-inter font-black tracking-tighter uppercase';
       case 'minimal': return 'font-inter tracking-tighter font-light font-extralight';
       case 'minimallight': return 'font-inter tracking-tighter font-thin text-white/70';
       case 'serif': return 'font-serif italic font-medium';
       case 'serifcondensed': return 'font-serif tracking-tighter font-semibold';
       case 'poppins': return 'font-poppins font-semibold';
       case 'bebas': return 'font-bebas tracking-widest font-normal';
       case 'rajdhani': return 'font-rajdhani font-medium tracking-wide';
       case 'teko': return 'font-teko font-semibold tracking-wide';
       case 'anton': return 'font-anton tracking-wider font-normal';
       case 'staatliches': return 'font-staatliches tracking-wide font-normal';
       
       // SCRIPT / HANDWRITING
       case 'handwritten': return 'font-handwritten font-normal text-[1.3em]';
       case 'calligraphy': return 'font-handwritten italic text-[1.4em]';
       case 'brush': return 'font-handwritten font-bold text-[1.35em]';
       case 'graffiti': return 'font-anton font-black text-[1.1em]';
       
       // TECHNO / SCI-FI
       case 'robotic': return 'font-robotic tracking-[0.3em] font-bold text-[1.2em]';
       case 'digital': return 'font-digital tracking-tighter font-black text-[1.3em]';
       case 'lcd': return 'font-digital tracking-[0.1em] text-[1.4em]';
       case 'techmono': return 'font-techmono tracking-wide font-normal text-[1.15em]';
       case 'michroma': return 'font-michroma tracking-[0.2em] font-normal text-[1.2em]';
       case 'quantico': return 'font-quantico font-medium tracking-wide text-[1.1em]';
       case 'audiowide': return 'font-audiowide tracking-[0.15em] font-normal text-[1.25em]';
       case 'exo2': return 'font-exo2 font-semibold tracking-wide text-[1.1em]';
       case 'square': return 'font-bebas font-black tracking-[0.05em] text-[1.1em]';
       
       // RETRO / OLD SCHOOL
       case 'retro': return 'font-retro tracking-wide text-[1.1em]';
       case 'typewriter': return 'font-spacemono tracking-wide font-medium';
       case 'groovy': return 'font-poppins font-semibold italic text-[1.05em]';
       case 'oldschool': return 'font-bebas tracking-widest font-bold';
       case 'stencil': return 'font-anton tracking-wider';
       case 'army': return 'font-staatliches tracking-wide font-black';
       
       // CARTOON / COMIC
       case 'comic': return 'font-poppins font-bold';
       case 'cartoon': return 'font-handwritten font-bold text-[1.1em]';
       case 'curly': return 'font-serif italic';
       case 'playful': return 'font-poppins';
       
       // GOTHIC / MEDIEVAL
       case 'gothic': return 'font-serif font-black';
       case 'medieval': return 'font-serif italic font-bold';
       case 'celtic': return 'font-serif';
       
       // FOREIGN LOOK
       case 'chinese': return 'font-inter font-black';
       case 'japanese': return 'font-inter tracking-[0.05em]';
       case 'arabic': return 'font-serif';
       case 'mexican': return 'font-bebas font-bold';
       case 'russian': return 'font-rajdhani';
       case 'greek': return 'font-serif italic';
       
       default: return 'font-inter font-black tracking-tighter uppercase';
     }
   })();

  if (isCompact) {
    return (
      <div className="flex flex-col items-center justify-center">
         <motion.div
           className={`${timerFontClass} text-[140px] md:text-[220px] text-white leading-none text-glow select-none`}
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
        {t.work === 'Focus' ? 'What do you want to focus on?' : 'No que você deseja focar?'}
      </motion.h2>

      {/* Phase tabs */}
      <div className="flex gap-3 mb-4">
        {([
          { id: 'work' as SessionPhase, label: t.work },
          { id: 'short' as SessionPhase, label: t.shortBreak },
          { id: 'long' as SessionPhase, label: t.longBreak },
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
      <div className="flex items-center gap-1.5 mb-2 mt-4 h-6">
        {Array.from({ length: Math.min(sessions, 8) }).map((_, i) => {
          const currentIcon = Array.isArray(icon) 
            ? icon[i % icon.length] 
            : icon;

          return (
            <motion.span
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`text-2xl ${tallyStyle === 'dots' ? 'text-white/80' : ''}`}
            >
              {currentIcon}
            </motion.span>
          );
        })}
        {sessions > 8 && (
          <span className="text-xs text-white/40">+{sessions - 8}</span>
        )}
      </div>

      {/* Giant timer */}
      <motion.div
        className={`${timerFontClass} text-white leading-none text-glow select-none`}
        style={{ 
          fontSize: `calc(120px * ${fontScale})`,
          lineHeight: 0.85,
          transform: `translateY(${ (verticalOffset - 1) * -60 }px)`,
        }}
      >
        {formatTime(remaining)}
      </motion.div>

      {/* Controls */}
      <div className="flex items-center gap-3 mt-6" style={{ transform: `translateY(${ (verticalOffset - 1) * -60 }px)` }}>
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
          {running ? t.pause : t.start}
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
            {t.skipBreak}
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
