import { useState } from 'react';
import { Type } from 'lucide-react';
import type { Settings } from '@/stores/pomodoroStore';
import { SectionHeader, Toggle } from './_shared';

const CLOCK_FORMATS = [
  { id: '12h', label: '12-hour Clock', preview: '2:24' },
  { id: '24h', label: '24-hour Clock', preview: '14:24' },
];

const CLOCK_TOGGLES: { key: keyof Settings; label: string; desc: string; badge?: string }[] = [
  { key: 'flipClock', label: 'Use flip clock', desc: 'Display the clock with a flip animation.', badge: 'NEW' },
  { key: 'showSeconds', label: 'Show clock seconds', desc: 'Get a detailed time view. Turn off to hide seconds.' },
  { key: 'showDynamicGreetings', label: 'Show dynamic greetings', desc: 'Turn off for generic greetings.' },
  { key: 'showGreetings', label: 'Show greetings', desc: 'Turn off to hide dashboard greetings.' },
];

const FONT_CATEGORIES = [
  { id: 'all', label: '✓ Todos', emoji: '📚' },
  { id: 'cartoon', label: 'Cartoon', emoji: '🎨' },
  { id: 'retro', label: 'Retro', emoji: '🎮' },
  { id: 'techno', label: 'Techno', emoji: '🤖' },
  { id: 'gothic', label: 'Gothic', emoji: '🏰' },
  { id: 'basic', label: 'Basic', emoji: '📝' },
  { id: 'script', label: 'Script', emoji: '✍️' },
  { id: 'decorative', label: 'Decorative', emoji: '✨' },
  { id: 'foreign', label: 'Foreign', emoji: '🌍' },
  { id: 'dingbats', label: 'Dingbats', emoji: '🎭' },
  { id: 'holiday', label: 'Holiday', emoji: '🎄' },
];

const CLOCK_FONTS: { id: string; label: string; font: string; category: string[] }[] = [
  // DEFAULT & BASIC
  { id: 'default', label: 'Default', font: 'font-inter font-black tracking-tighter', category: ['all', 'basic'] },
  { id: 'minimal', label: 'Minimal', font: 'font-inter tracking-tighter font-light font-extralight', category: ['all', 'basic'] },
  { id: 'serif', label: 'Serif', font: 'font-serif italic font-medium', category: ['all', 'basic'] },
  { id: 'handwritten', label: 'Handwritten', font: 'font-handwritten font-normal', category: ['all', 'script'] },
  { id: 'minimallight', label: 'Minimal Light', font: 'font-inter tracking-tighter font-thin', category: ['all', 'basic'] },
  { id: 'serifcondensed', label: 'Serif Condensed', font: 'font-serif tracking-tighter font-semibold', category: ['all', 'basic'] },

  // TECHNO / SCI-FI
  { id: 'robotic', label: '🤖 Robotic', font: 'font-robotic tracking-[0.3em] font-bold', category: ['all', 'techno'] },
  { id: 'digital', label: '📟 Digital', font: 'font-digital tracking-tighter font-black', category: ['all', 'techno'] },
  { id: 'techmono', label: 'Tech Mono', font: 'font-techmono tracking-wide font-normal', category: ['all', 'techno'] },
  { id: 'lcd', label: 'LCD', font: 'font-digital tracking-tighter', category: ['all', 'techno'] },
  { id: 'square', label: 'Square', font: 'font-bebas tracking-widest', category: ['all', 'techno'] },
  { id: 'michroma', label: 'Michroma', font: 'font-michroma tracking-[0.2em] font-normal', category: ['all', 'techno'] },
  { id: 'quantico', label: 'Quantico', font: 'font-quantico font-medium tracking-wide', category: ['all', 'techno'] },
  { id: 'audiowide', label: 'Audiowide', font: 'font-audiowide tracking-[0.15em] font-normal', category: ['all', 'techno'] },
  { id: 'exo2', label: 'Exo 2', font: 'font-exo2 font-semibold tracking-wide', category: ['all', 'techno'] },

  // RETRO / OLD SCHOOL
  { id: 'retro', label: '🎮 Retro', font: 'font-retro tracking-wide text-[0.8em]', category: ['all', 'retro'] },
  { id: 'typewriter', label: '⌨️ Typewriter', font: 'font-spacemono tracking-wide font-medium', category: ['all', 'retro'] },
  { id: 'groovy', label: '🌼 Groovy', font: 'font-poppins font-semibold italic', category: ['all', 'retro'] },
  { id: 'oldschool', label: '🎱 Old School', font: 'font-bebas tracking-widest', category: ['all', 'retro'] },
  { id: 'stencil', label: '⚔️ Stencil', font: 'font-anton tracking-wider', category: ['all', 'retro'] },
  { id: 'army', label: '🎖️ Army', font: 'font-staatliches tracking-wide', category: ['all', 'retro'] },

  // CARTOON / COMIC
  { id: 'comic', label: '💬 Comic', font: 'font-poppins font-bold', category: ['all', 'cartoon'] },
  { id: 'cartoon', label: '🎨 Cartoon', font: 'font-handwritten font-bold', category: ['all', 'cartoon'] },
  { id: 'curly', label: '🌀 Curly', font: 'font-serif italic', category: ['all', 'cartoon'] },
  { id: 'playful', label: '🎈 Playful', font: 'font-poppins', category: ['all', 'cartoon'] },

  // GOTHIC / MEDIEVAL
  { id: 'gothic', label: '🏰 Gothic', font: 'font-serif font-black', category: ['all', 'gothic'] },
  { id: 'medieval', label: '⚔️ Medieval', font: 'font-serif italic', category: ['all', 'gothic'] },
  { id: 'celtic', label: '🍀 Celtic', font: 'font-serif', category: ['all', 'gothic'] },

  // SCRIPT / CALLIGRAPHY
  { id: 'calligraphy', label: '🖋️ Calligraphy', font: 'font-handwritten', category: ['all', 'script'] },
  { id: 'brush', label: '🖌️ Brush', font: 'font-handwritten font-bold', category: ['all', 'script'] },
  { id: 'graffiti', label: '🎨 Graffiti', font: 'font-anton', category: ['all', 'script'] },

  // FOREIGN LOOK
  { id: 'chinese', label: '🇨🇳 Chinese', font: 'font-inter font-black', category: ['all', 'foreign'] },
  { id: 'japanese', label: '🇯🇵 Japanese', font: 'font-inter', category: ['all', 'foreign'] },
  { id: 'arabic', label: '🇸🇦 Arabic', font: 'font-serif', category: ['all', 'foreign'] },
  { id: 'mexican', label: '🇲🇽 Mexican', font: 'font-bebas', category: ['all', 'foreign'] },
  { id: 'russian', label: '🇷🇺 Russian', font: 'font-rajdhani', category: ['all', 'foreign'] },
  { id: 'greek', label: '🇬🇷 Greek', font: 'font-serif', category: ['all', 'foreign'] },

  // OTHERS
  { id: 'poppins', label: 'Poppins', font: 'font-poppins font-semibold', category: ['all', 'basic'] },
  { id: 'bebas', label: 'Bebas', font: 'font-bebas tracking-widest font-normal', category: ['all', 'basic'] },
  { id: 'rajdhani', label: 'Rajdhani', font: 'font-rajdhani font-medium tracking-wide', category: ['all', 'basic'] },
  { id: 'teko', label: 'Teko', font: 'font-teko font-semibold tracking-wide', category: ['all', 'basic'] },
  { id: 'anton', label: 'Anton', font: 'font-anton tracking-wider font-normal', category: ['all', 'basic'] },
  { id: 'staatliches', label: 'Staatliches', font: 'font-staatliches tracking-wide font-normal', category: ['all', 'basic'] },
];

export default function ClockSection({
  title,
  subtitle,
  settings,
  onUpdate,
}: {
  title: string;
  subtitle: string;
  settings: Settings;
  onUpdate: (update: Partial<Settings>) => void;
}) {
  const [fontCategory, setFontCategory] = useState('all');

  return (
    <div className="space-y-8">
      <SectionHeader title={title} subtitle={subtitle} />

      <div className="space-y-8">
        {/* Clock Format */}
        <div className="space-y-3">
          <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">⏰ CLOCK FORMAT</div>
          <p className="text-[11px] text-white/40 ml-1 mb-3">Choose between 12-hour or 24-hour clock format.</p>
          <div className="grid grid-cols-2 gap-4">
            {CLOCK_FORMATS.map(mode => (
              <button key={mode.id} onClick={() => onUpdate({ clockFormat: mode.id as Settings['clockFormat'] })}
                className={`aspect-video rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${
                  settings.clockFormat === mode.id ? 'ring-2 ring-primary border-transparent scale-[1.02]' : 'border-white/5 hover:border-white/20'
                }`}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                  opacity: settings.clockFormat === mode.id ? 1 : 0.7,
                }}>
                <div className="text-3xl font-black text-white drop-shadow-lg">{mode.preview}</div>
                <div className="text-[11px] font-bold text-white/80 mt-2">{mode.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Options */}
        <div className="space-y-3">
          <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">⚙️ OPÇÕES</div>

          {CLOCK_TOGGLES.map((opt, i) => (
            <Toggle
              key={i}
              label={opt.label}
              desc={opt.desc}
              badge={opt.badge && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{opt.badge}</span>}
              checked={Boolean(settings[opt.key] ?? false)}
              onChange={checked => onUpdate({ [opt.key]: checked } as Partial<Settings>)}
            />
          ))}
        </div>

        {/* Clock & Timer Style */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">🎨 CLOCK & TIMER FONTS</div>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black">+90 FONTS</span>
          </div>
          <p className="text-[11px] text-white/40 ml-1 mb-4">Escolha entre +90 fontes organizadas por categorias.</p>

          {/* Font Categories */}
          <div className="flex flex-wrap gap-2 mb-5">
            {FONT_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setFontCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  fontCategory === cat.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-white/[0.04] text-white/40 hover:text-white/60'
                }`}>
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          {/* Font Grid */}
          <div className="grid grid-cols-4 gap-3">
            {CLOCK_FONTS.filter(style => style.category.includes(fontCategory)).map(style => (
              <button key={style.id} onClick={() => onUpdate({ clockStyle: style.id as Settings['clockStyle'] })}
                className={`aspect-video rounded-2xl border transition-all flex flex-col items-center justify-center bg-gradient-to-br from-sky-500/20 to-cyan-600/10 ${
                  settings.clockStyle === style.id ? 'ring-2 ring-primary border-transparent scale-[1.02]' : 'border-white/5 hover:border-white/20'
                }`}>
                <div className="absolute top-2 left-2 text-[8px] font-bold text-white/30">flocus</div>
                <div className="absolute top-2 right-2 text-[6px] text-white/20">Success all depends on the second letter</div>

                <div className={`text-3xl text-white drop-shadow-md ${style.font}`}>9:24</div>

                <div className="absolute bottom-4 left-2 w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[6px]">⚙️</div>
                <div className="absolute bottom-4 right-2 flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-primary/40"></div>
                  <div className="w-3 h-3 rounded-full bg-white/10"></div>
                  <div className="w-3 h-3 rounded-full bg-white/10"></div>
                </div>

                <div className="text-[11px] font-bold text-white/80 mt-2">{style.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* FONT SIZE SCALE */}
        <div className="space-y-4 bg-white/[0.04] p-5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">
            <Type size={12} /> FONT SIZE SCALE
          </div>
          <p className="text-[11px] text-white/40 ml-1 mb-3">Ajuste o tamanho geral das fontes do relógio e timer.</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Tamanho</span>
              <span className="text-[10px] text-primary font-black bg-primary/10 px-2 py-0.5 rounded">{Math.round((settings.fontScale || 1) * 100)}%</span>
            </div>
            <input
              type="range" min={0.6} max={3} step={0.05} value={settings.fontScale || 1}
              onChange={e => onUpdate({ fontScale: parseFloat(e.target.value) })}
              className="w-full accent-primary h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* VERTICAL SPACING */}
        <div className="space-y-4 bg-white/[0.04] p-5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">
            <Type size={12} /> VERTICAL SPACING
          </div>
          <p className="text-[11px] text-white/40 ml-1 mb-3">Ajuste o espaço acima do contador de tempo.</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Espaçamento</span>
              <span className="text-[10px] text-primary font-black bg-primary/10 px-2 py-0.5 rounded">{Math.round((settings.timerVerticalOffset || 1) * 100)}%</span>
            </div>
            <input
              type="range" min={0} max={2} step={0.05} value={settings.timerVerticalOffset || 1}
              onChange={e => onUpdate({ timerVerticalOffset: parseFloat(e.target.value) })}
              className="w-full accent-primary h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Display Name */}
        <div className="space-y-4 bg-white/[0.04] p-5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">
            <Type size={12} /> Display Name
          </div>
          <input
            type="text"
            value={settings.displayName}
            onChange={e => onUpdate({ displayName: e.target.value })}
            placeholder="Seu nome..."
            className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/40 transition-all font-bold"
          />
        </div>
      </div>
    </div>
  );
}
