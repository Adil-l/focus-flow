import { motion } from 'framer-motion';
import { X, Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';

/** "Share Focus Flow with Friends" — copy link or native share sheet. */
export default function ShareModal({ onClose }: { onClose: () => void }) {
  const url = typeof window !== 'undefined' ? window.location.origin : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    } catch {
      toast.error('Could not copy the link.');
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Focus Flow', text: 'Focus better with Focus Flow', url });
      } catch {
        /* user dismissed */
      }
    } else {
      void copyLink();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/15 rounded-[32px] p-12 flex flex-col items-center text-center"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-6 left-6 p-2 rounded-full hover:bg-white/10 text-white/70 transition-all"
        >
          <X size={22} />
        </button>

        <h2 className="text-3xl font-black text-white mb-4 leading-tight">Share Focus Flow<br />with Friends</h2>
        <p className="text-white/60 mb-8 text-sm">
          Love using Focus Flow? Share it with a friend and help them get more done!
        </p>

        <div className="flex gap-8">
          <button onClick={copyLink} className="flex flex-col items-center gap-2 group">
            <div className="w-16 h-16 rounded-2xl bg-primary group-hover:bg-primary/90 flex items-center justify-center transition-all">
              <Copy size={24} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">Copy Link</span>
          </button>
          <button onClick={nativeShare} className="flex flex-col items-center gap-2 group">
            <div className="w-16 h-16 rounded-2xl bg-primary group-hover:bg-primary/90 flex items-center justify-center transition-all">
              <Share2 size={24} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">Share</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
