import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface NotepadPanelProps {
  content: string;
  onChange: (text: string) => void;
}

export default function NotepadPanel({ content, onChange }: NotepadPanelProps) {
  const wordCount = useMemo(() => content.trim() ? content.trim().split(/\s+/).length : 0, [content]);
  const charCount = content.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="glass-panel p-5 w-[380px]"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-sm">✏️</span>
          </div>
          <h3 className="font-semibold text-white text-base">Notepad</h3>
        </div>
        <span className="text-xs text-white/40">
          {wordCount} words · {charCount} chars
        </span>
      </div>
      <textarea
        value={content}
        onChange={e => onChange(e.target.value)}
        placeholder="Brain dump your best ideas without distractions..."
        className="w-full h-48 bg-white/[0.04] rounded-xl p-4 text-sm text-white/80 placeholder:text-white/25 resize-none outline-none focus:ring-1 focus:ring-primary/30 transition-all scrollbar-thin"
      />
    </motion.div>
  );
}
