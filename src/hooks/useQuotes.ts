import { useState, useEffect } from 'react';
import { Quote, getRandomQuote, QUOTES } from '@/data/quotes';

export interface UseQuotesOptions {
  category?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useQuotes({ category = 'all', autoRefresh = false, refreshInterval = 30000 }: UseQuotesOptions = {}) {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [categories] = useState<string[]>(['all', ...Array.from(new Set(QUOTES.map(q => q.category)))]);

  const getRandomQuoteByCategory = (cat?: string): Quote => {
    const filtered = cat && cat !== 'all'
      ? QUOTES.filter(q => q.category === cat)
      : QUOTES;
    
    if (filtered.length === 0) return QUOTES[0];
    return filtered[Math.floor(Math.random() * filtered.length)];
  };

  const refreshQuote = () => {
    const newQuote = getRandomQuoteByCategory(selectedCategory);
    setCurrentQuote(newQuote);
  };

  useEffect(() => {
    refreshQuote();
  }, [selectedCategory]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(refreshQuote, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  return {
    currentQuote,
    categories,
    selectedCategory,
    setSelectedCategory,
    refreshQuote,
    getRandomQuoteByCategory,
  };
}