import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

interface NotepadPanelProps {
  content: string;
  onChange: (text: string) => void;
}

export default function NotepadPanel({ content, onChange }: NotepadPanelProps) {
  const { t } = useTranslation();
  const wordCount = useMemo(() => content.trim() ? content.trim().split(/\s+/).length : 0, [content]);
  const charCount = content.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="glass-panel p-6 w-[min(540px,92vw)] max-h-[85vh] flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-sm">✏️</span>
          </div>
          <h3 className="font-semibold text-white text-base">{t.notepad}</h3>
        </div>
        <div className="flex gap-2">
           <button onClick={() => navigator.clipboard.writeText(content)} className="text-xs text-white/40 hover:text-white transition-all">{t.copyLink.includes('Link') ? 'Copy' : 'Copiar'}</button>
           <button onClick={() => onChange('')} className="text-xs text-white/40 hover:text-red-400 transition-all">{t.clear}</button>
        </div>
      </div>
      <textarea
        value={content}
        onChange={e => onChange(e.target.value)}
        placeholder={t.language === 'en' ? "Brain dump your best ideas without distractions..." : "Descarregue suas melhores ideias sem distrações..."}
        className="w-full min-h-[400px] bg-white/[0.04] rounded-xl p-4 text-sm text-white/80 placeholder:text-white/25 resize-y outline-none focus:ring-1 focus:ring-primary/30 transition-all scrollbar-thin"
      />
      <div className="mt-2 text-xs text-white/20 text-right">
          {wordCount} {t.language === 'en' ? 'words' : 'palavras'} · {charCount} {t.language === 'en' ? 'chars' : 'caracteres'}
      </div>
    </motion.div>
  );
}
