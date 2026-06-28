import { motion } from 'framer-motion';
import { X, Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n';

/** "Share Kipto with Friends" — copy link or native share sheet. */
export default function ShareModal({ onClose }: { onClose: () => void }) {
  const { t, language } = useTranslation();
  const url = typeof window !== 'undefined' ? window.location.origin : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(language === 'pt' ? 'Link copiado!' : 'Link copied!');
    } catch {
      toast.error(language === 'pt' ? 'Não foi possível copiar o link.' : 'Could not copy the link.');
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Kipto', text: language === 'pt' ? 'Concentre-se melhor com o Kipto' : 'Focus better with Kipto', url });
      } catch {
        /* user dismissed */
      }
    } else {
      void copyLink();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md max-h-[100dvh] overflow-y-auto bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/15 rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 flex flex-col items-center text-center"
      >
        <button
          onClick={onClose}
          aria-label={language === 'pt' ? 'Fechar' : 'Close'}
          className="absolute top-3 left-3 sm:top-4 sm:left-4 flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10 text-white/70 transition-all"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 sm:mb-4 mt-8 sm:mt-4 leading-tight">
          {language === 'pt' ? <>Partilhe o Kipto<br />com Amigos</> : <>Share Kipto<br />with Friends</>}
        </h2>
        <p className="text-white/60 mb-7 sm:mb-8 text-sm">
          {language === 'pt'
            ? 'Gosta de usar o Kipto? Partilhe com um amigo e ajude-o a render mais!'
            : 'Love using Kipto? Share it with a friend and help them get more done!'}
        </p>

        <div className="grid grid-cols-2 gap-3 sm:gap-8 w-full">
          <button onClick={copyLink} className="flex flex-col items-center gap-2 group rounded-2xl p-2 active:bg-white/5 transition-all">
            <div className="w-16 h-16 rounded-2xl bg-primary group-hover:bg-primary/90 flex items-center justify-center transition-all">
              <Copy size={24} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">{language === 'pt' ? 'Copiar Link' : 'Copy Link'}</span>
          </button>
          <button onClick={nativeShare} className="flex flex-col items-center gap-2 group rounded-2xl p-2 active:bg-white/5 transition-all">
            <div className="w-16 h-16 rounded-2xl bg-primary group-hover:bg-primary/90 flex items-center justify-center transition-all">
              <Share2 size={24} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">{language === 'pt' ? 'Partilhar' : 'Share'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
