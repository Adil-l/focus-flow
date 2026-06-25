import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getRandomQuote } from '@/data/quotes';
import { useTranslation } from '@/lib/i18n';

interface ClockDisplayProps {
  format: '12h' | '24h';
  showSeconds: boolean;
  displayName: string;
  timezone?: string;
  clockFont?: string;
  clockStyle?: string;
  fontScale?: number;
  showGreetings?: boolean;
  quoteCategory?: string;
  showClock?: boolean;
  showQuote?: boolean;
  showLogo?: boolean;
}

export default function ClockDisplay({ 
  format, 
  showSeconds, 
  displayName, 
  timezone,
  clockFont = 'default',
  clockStyle = 'default',
  fontScale = 1,
  showGreetings = true,
  quoteCategory = 'all',
  showClock = true,
  showQuote = true,
  showLogo = true
}: ClockDisplayProps) {
  const { t } = useTranslation();
  const [now, setNow] = useState(new Date());

  // Garante que a citação seja buscada sempre que a categoria mudar
  const [quote, setQuote] = useState(() => getRandomQuote(quoteCategory));
  
  // Atualiza a citação quando a categoria mudar
  useEffect(() => {
    setQuote(getRandomQuote(quoteCategory));
  }, [quoteCategory]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Atualiza frase automaticamente de 5 em 5 minutos
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuote(getRandomQuote(quoteCategory));
    }, 5 * 60 * 1000); // 5 minutos = 300000ms
    
    return () => clearInterval(quoteInterval);
  }, [quoteCategory]);

  const zonedParts = useMemo(() => {
    const safeTimeZone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: safeTimeZone,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).formatToParts(now);

      const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? now.getHours());
      const minute = parts.find((part) => part.type === 'minute')?.value ?? String(now.getMinutes()).padStart(2, '0');
      const second = parts.find((part) => part.type === 'second')?.value ?? String(now.getSeconds()).padStart(2, '0');

      return { hour, minute, second, safeTimeZone };
    } catch {
      return {
        hour: now.getHours(),
        minute: String(now.getMinutes()).padStart(2, '0'),
        second: String(now.getSeconds()).padStart(2, '0'),
        safeTimeZone,
      };
    }
  }, [now, timezone]);

  const timeString = useMemo(() => {
    let h = zonedParts.hour;
    const m = zonedParts.minute;
    const s = zonedParts.second;
    const ampm = h >= 12 ? 'PM' : 'AM';

    if (format === '12h') h = h % 12 || 12;
    const hStr = String(h).padStart(2, '0');

    return { h: hStr, m, s, ampm: format === '12h' ? ampm : '' };
  }, [format, zonedParts]);

  const greeting = useMemo(() => {
    const hour = zonedParts.hour;
    if (t.language === 'pt') {
      if (hour < 12) return 'Bom dia';
      if (hour < 18) return 'Boa tarde';
      return 'Boa noite';
    }
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, [zonedParts.hour, t.language]);

  // Day-aware second line that sets the tone (mirrors Flocus's contextual greeting).
  const greetingSub = useMemo(() => {
    const day = new Date().getDay(); // 0 = Sunday … 6 = Saturday
    const pt = t.language === 'pt';
    if (day === 1) return pt ? 'Vamos dar o tom da semana.' : "Let's set the tone for the week.";
    if (day === 5) return pt ? 'Termine a semana com força.' : 'Finish the week strong.';
    if (day === 0 || day === 6) return pt ? 'Aproveite um ritmo mais calmo hoje.' : 'Enjoy a slower pace today.';
    return pt ? 'Vamos fazer hoje valer a pena.' : "Let's make today count.";
  }, [t.language]);

   const fontClass = useMemo(() => {
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
       case 'handwritten': return 'font-handwritten font-normal';
       case 'calligraphy': return 'font-handwritten italic text-[1.1em]';
       case 'brush': return 'font-handwritten font-bold';
       case 'graffiti': return 'font-anton font-black';
       
       // TECHNO / SCI-FI
       case 'robotic': return 'font-robotic tracking-[0.3em] font-bold';
       case 'digital': return 'font-digital tracking-tighter font-black';
       case 'lcd': return 'font-digital tracking-[0.1em]';
       case 'techmono': return 'font-techmono tracking-wide font-normal';
       case 'michroma': return 'font-michroma tracking-[0.2em] font-normal';
       case 'quantico': return 'font-quantico font-medium tracking-wide';
       case 'audiowide': return 'font-audiowide tracking-[0.15em] font-normal';
       case 'exo2': return 'font-exo2 font-semibold tracking-wide';
       case 'square': return 'font-bebas font-black tracking-[0.05em]';
       
       // RETRO / OLD SCHOOL
       case 'retro': return 'font-retro tracking-wide text-[0.8em]';
       case 'typewriter': return 'font-spacemono tracking-wide font-medium';
       case 'groovy': return 'font-poppins font-semibold italic';
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
   }, [clockStyle]);

  if (clockStyle === 'minimal') {
      return (
        <div className="absolute top-8 left-10 right-10 z-20 pointer-events-none select-none flex justify-between items-center">
            <div className={`text-3xl text-white/90 ${fontClass}`}>
                {timeString.h}:{timeString.m}{showSeconds && <span className="text-xl opacity-40">:{timeString.s}</span>}
            </div>
            {showGreetings && (
                <div className="text-right">
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{greeting}{displayName ? `, ${displayName}` : ''}</p>
                </div>
            )}
        </div>
      );
  }

  return (
    <div className="absolute inset-0 z-20 pointer-events-none select-none">
      {/* Wordmark — top-left */}
      {showLogo && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-6 left-8 flex items-baseline gap-2">
          <h1 className={`text-3xl font-extrabold text-white tracking-tighter ${fontClass}`}>Focus Flow</h1>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        </motion.div>
      )}

      {/* Quote — top-right */}
      {showQuote && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-6 right-8 text-right max-w-[300px] flex flex-col gap-2 pointer-events-auto">
          <p className="text-base font-medium text-white/80 leading-relaxed tracking-tight italic">
            "{quote?.text || ''}"
          </p>
          <div className="flex items-center justify-end gap-3">
            <div className="h-[1px] w-8 bg-white/10" />
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{quote?.author || ''}</p>
          </div>
        </motion.div>
      )}

      {/* Greeting + giant clock — centered */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center -mt-6">
        {showGreetings && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-3">
            <p className="text-2xl md:text-3xl font-bold text-white/95 tracking-tight">
              {greeting}{displayName ? `, ${displayName}` : ''}!
            </p>
            <p className="text-base md:text-lg text-white/55 font-medium mt-1">{greetingSub}</p>
          </motion.div>
        )}
        {showClock && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-baseline justify-center gap-1 leading-none text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.4)] ${fontClass}`}
            style={{ fontSize: 'clamp(4.5rem, 16vw, 12rem)', transform: `scale(${fontScale || 1})` }}
          >
            <span>{timeString.h}</span>
            <span className="text-primary/80 animate-pulse">:</span>
            <span>{timeString.m}</span>
            {showSeconds && (
              <>
                <span className="text-primary/40" style={{ fontSize: '0.4em' }}>:</span>
                <span className="opacity-40" style={{ fontSize: '0.4em' }}>{timeString.s}</span>
              </>
            )}
            {timeString.ampm && <span className="ml-2 font-black opacity-30" style={{ fontSize: '0.22em' }}>{timeString.ampm}</span>}
          </motion.div>
        )}
      </div>
    </div>
  );
}
