import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Rocket, X } from 'lucide-react';

// Bump VERSION when shipping notable changes; the card shows once per version.
const VERSION = '2025.06-modes-mixer';
const KEY = 'pomo:lastSeenVersion';

const CHANGES = [
  '🎛️ New sound mixer — layer rain, café, fire + binaural beats',
  '🏠 Home / Focus / Ambient modes with a floating timer & Picture-in-Picture',
  '✨ Plus: premium themes, advanced stats & cross-device sync',
];

/** Self-contained "What's New" card — appears once per version, dismissible. */
export default function WhatsNew() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(KEY) !== VERSION) setOpen(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(KEY, VERSION);
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.96 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] w-[340px] glass-panel p-5 pointer-events-auto"
        >
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="absolute top-3 right-3 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Rocket size={16} className="text-primary" />
            </div>
            <h4 className="text-sm font-black text-white">What's new</h4>
          </div>
          <ul className="space-y-2 mb-4">
            {CHANGES.map((c) => (
              <li key={c} className="text-xs text-white/70 leading-relaxed">{c}</li>
            ))}
          </ul>
          <button
            onClick={dismiss}
            className="w-full py-2 rounded-xl bg-primary/80 hover:bg-primary text-white text-xs font-bold transition-all"
          >
            Got it
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
