import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuotes } from '@/hooks/useQuotes';
import { useTranslation } from '@/lib/i18n';

interface QuotesPanelProps {
  showCategories?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function QuotesPanel({ showCategories = true, autoRefresh = true, refreshInterval = 30000 }: QuotesPanelProps) {
  const { t } = useTranslation();
  const { currentQuote, categories, selectedCategory, setSelectedCategory, refreshQuote } = useQuotes({ 
    autoRefresh, 
    refreshInterval 
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    refreshQuote();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 w-[min(540px,92vw)] max-h-[85vh] flex flex-col gap-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            <span className="text-sm">💬</span>
          </div>
          <h3 className="font-semibold text-white text-base">{t.quotes}</h3>
        </div>
        {showCategories && (
          <div className="flex gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-white/10 text-white/90 border border-white/20'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'
                }`}
              >
                {cat === 'all' ? t.allCategories : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {currentQuote && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/5 rounded-lg p-6 text-center"
        >
          <p className="text-lg text-white/90 mb-4 italic">
            "{currentQuote.text}"
          </p>
          <p className="text-sm text-white/50">- {currentQuote.author}</p>
          <p className="text-xs text-white/40 mt-2">
            {selectedCategory === 'all' 
              ? t.allCategories 
              : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
          </p>
        </motion.div>
      )}

<div className="flex items-center justify-center gap-2">
  <button
    onClick={() => handleCategoryChange('all')}
    className="px-3 py-1.5 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 transition-all text-xs"
  >
    <span className="text-sm">{t.allCategories}</span>
  </button>
</div>
    </motion.div>
  );
}