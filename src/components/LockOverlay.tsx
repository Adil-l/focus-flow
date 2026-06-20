import { motion } from 'framer-motion';
import { Lock, Timer as TimerIcon, Play, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { soundManager, ALARM_URL } from '@/lib/audio';
import { useTranslation } from '@/lib/i18n';

interface LockOverlayProps {
  remaining: number;
  phase: 'short' | 'long';
  isRunning: boolean;
  onStart: () => void;
}

export default function LockOverlay({ remaining, phase, isRunning, onStart }: LockOverlayProps) {
  const { t } = useTranslation();
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!isRunning && !isMuted) {
      soundManager.play(ALARM_URL, 1.0, true, true);
    } else {
      soundManager.stop(ALARM_URL);
    }

    return () => {
      soundManager.stop(ALARM_URL);
    };
  }, [isRunning, isMuted]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const handleStart = () => {
    soundManager.stop(ALARM_URL);
    onStart();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => {
        if (!isMuted) soundManager.play(ALARM_URL, 1.0, true, true);
      }}
      className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center p-6 text-center select-none cursor-pointer"
      style={{ pointerEvents: 'all' }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-md w-full"
      >
        <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-8 relative border-2 border-red-600/50">
          <Lock size={40} className="text-red-500 animate-pulse" />
          <button 
            onClick={toggleMute}
            className="absolute -top-2 -right-2 p-2 bg-red-600 rounded-full text-white shadow-lg hover:bg-red-500 transition-colors z-10"
            title={t.language === 'en' ? "Toggle sound" : "Alternar som"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} className="animate-bounce" />}
          </button>
        </div>
        
        <h2 className="text-5xl font-black text-white mb-6 tracking-tighter">
          {t.language === 'en' ? 'MANDATORY BREAK' : 'PAUSA OBRIGATÓRIA'}
        </h2>
        
        <div className="space-y-4 mb-12">
          <p className="text-red-500 text-xl font-bold animate-pulse uppercase tracking-widest">
            {t.language === 'en' ? 'Action Required: Step away!' : 'Ação Necessária: Afaste-se da tela!'}
          </p>
          <p className="text-white/40 text-lg leading-relaxed">
            {t.language === 'en' 
              ? 'The alarm will keep playing until the break is over or you start the timer.' 
              : 'O alarme continuará tocando até que o tempo termine ou você inicie a pausa.'}
          </p>
        </div>

        <div className="bg-red-600/5 border border-red-600/20 rounded-[40px] p-10 backdrop-blur-md shadow-2xl shadow-red-900/20">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="w-full py-8 rounded-3xl bg-red-600 text-white text-2xl font-black flex items-center justify-center gap-4 hover:bg-red-500 active:scale-95 transition-all shadow-xl shadow-red-600/30"
            >
              <Play size={28} fill="currentColor" /> {t.language === 'en' ? 'START BREAK NOW' : 'INICIAR PAUSA AGORA'}
            </button>
          ) : (
            <>
              <div className="flex items-center justify-center gap-3 text-red-500/60 mb-4 uppercase tracking-[0.3em] text-[12px] font-black">
                <TimerIcon size={16} />
                <span>{t.language === 'en' ? 'Unlocks in' : 'Desbloqueia em'}</span>
              </div>
              <div className="text-8xl font-mono font-black text-white tracking-tighter tabular-nums">
                {formatTime(remaining)}
              </div>
              <div className="mt-8 h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                <motion.div 
                  className="h-full bg-red-600 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: remaining, ease: "linear" }}
                />
              </div>
            </>
          )}
        </div>

        <p className="mt-12 text-white/20 text-[10px] uppercase tracking-[0.5em] font-black">
          Focus Flow Security Protocol — V2.1
        </p>
      </motion.div>
    </motion.div>
  );
}
