import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Reusable mobile bottom sheet — the phone equivalent of the desktop "panel
// dock". Slides up over a dimmed backdrop and OWNS the scroll: its content area
// is height-bounded (clearing the tab bar + home indicator) and scrolls, so any
// hosted panel — however tall (Pricing, Goals…) — is fully reachable.
//
// The hosted panels are desktop "floating cards" with their own height caps
// (max-h-[85vh] / h-[84vh]) and, in some, a nested scroll region. Those fight a
// sheet. The mobile.css `.sheet-scroll` rules neutralise them so there is ONE
// predictable scroller: this sheet. Dismiss via backdrop or the grab handle (no
// drag, so inner scrolling never triggers an accidental dismiss).
interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  /** Accessible label for the grab-handle close button. */
  closeLabel?: string;
  children: ReactNode;
}

export default function BottomSheet({ open, onClose, closeLabel = 'Close', children }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            key="sheet-panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-[95] flex flex-col items-center px-2"
            role="dialog"
            aria-modal="true"
            // Clear the tab bar + home indicator.
            style={{ paddingBottom: 'calc(5.25rem + env(safe-area-inset-bottom))' }}
          >
            <button
              onClick={onClose}
              aria-label={closeLabel}
              className="flex h-11 w-full max-w-[560px] flex-shrink-0 items-center justify-center"
            >
              <span className="h-1.5 w-10 rounded-full bg-white/40" />
            </button>
            {/* The single scroller. Bounded height so tall panels scroll here
                instead of running off the top of the screen. */}
            <div
              className="sheet-scroll flex w-full max-w-[560px] flex-col items-center overflow-y-auto overscroll-contain"
              style={{ maxHeight: 'calc(100dvh - 9.5rem - env(safe-area-inset-bottom))' }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
