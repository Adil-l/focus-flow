import { useMemo } from 'react';
import { FileText } from 'lucide-react';

interface NotepadPanelProps {
  content: string;
  onChange: (text: string) => void;
}

export default function NotepadPanel({ content, onChange }: NotepadPanelProps) {
  const wordCount = useMemo(() => content.trim() ? content.trim().split(/\s+/).length : 0, [content]);
  const charCount = content.length;

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-primary" />
          <h3 className="font-semibold text-foreground text-sm">Bloco de Notas</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {wordCount} palavras · {charCount} caracteres
        </span>
      </div>
      <textarea
        value={content}
        onChange={e => onChange(e.target.value)}
        placeholder="Brain dump — escreve as tuas ideias aqui..."
        className="w-full h-48 bg-secondary/30 rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none focus:ring-1 focus:ring-primary/30 transition-all scrollbar-thin"
      />
    </div>
  );
}
