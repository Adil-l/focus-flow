import { useState, useEffect, useCallback } from 'react';
import { Search, ImageIcon, Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import {
  searchWallpapers,
  WALLPAPER_TOPICS,
  WALLPAPER_PROVIDER,
  WALLPAPER_SEARCH_ENABLED,
  type Wallpaper,
} from '@/lib/wallpapers';
import { useTranslation } from '@/lib/i18n';

/**
 * Live wallpaper browser. Fetches from the active provider (Unsplash / Pexels /
 * Picsum) and applies the chosen full-res URL as the Home background via
 * `onApply`. Search is shown only when the provider supports it.
 */
export default function WallpaperBrowser({
  onApply,
  activeUrl,
}: {
  onApply: (fullUrl: string) => void;
  activeUrl?: string | null;
}) {
  const { t, language } = useTranslation();
  const [query, setQuery] = useState('');
  const [input, setInput] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async (q: string, p: number, append: boolean) => {
    setLoading(true);
    setError(false);
    const results = await searchWallpapers(q, p);
    setItems(prev => (append ? [...prev, ...results] : results));
    if (results.length === 0 && !append) setError(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load(query, 1, false);
    setPage(1);
  }, [query, load]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(input.trim());
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    void load(query, next, true);
  };

  return (
    <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05] space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
          <ImageIcon size={12} /> {language === 'pt' ? 'Papéis de Parede ao Vivo' : 'Live Wallpapers'}
        </h4>
        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10 text-primary capitalize">
          {WALLPAPER_PROVIDER}
        </span>
      </div>

      {WALLPAPER_SEARCH_ENABLED ? (
        <>
          <form onSubmit={submitSearch} className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-black/20 border border-white/5 rounded-lg px-3 focus-within:border-primary/40 transition-all">
              <Search size={14} className="text-white/30 shrink-0" />
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={language === 'pt' ? 'Pesquisar papéis de parede…' : 'Search wallpapers…'}
                className="flex-1 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-white/25"
              />
            </div>
            <button type="submit" className="px-4 py-2.5 rounded-lg bg-primary text-white text-xs font-black hover:opacity-90 transition-all shrink-0">
              {language === 'pt' ? 'Pesquisar' : 'Search'}
            </button>
          </form>
          <div className="flex flex-wrap gap-1.5">
            {WALLPAPER_TOPICS.map(topic => (
              <button
                key={topic}
                onClick={() => { setInput(topic); setQuery(topic); }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  query.toLowerCase() === topic.toLowerCase()
                    ? 'bg-primary text-white'
                    : 'bg-white/[0.04] text-white/40 hover:text-white/60'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="text-[11px] text-white/40 leading-relaxed">
          {language === 'pt' ? 'Fotos aleatórias selecionadas. Adicione uma ' : 'Curated random photos. Add a free '}
          <span className="text-white/60 font-bold">VITE_UNSPLASH_ACCESS_KEY</span> {language === 'pt' ? 'ou' : 'or'}{' '}
          <span className="text-white/60 font-bold">VITE_PEXELS_API_KEY</span> {language === 'pt' ? 'gratuita no ' : 'in '}<span className="font-mono">.env</span> {language === 'pt' ? 'para ativar a pesquisa por palavra-chave.' : 'to unlock keyword search.'}
        </p>
      )}

      {/* Grid */}
      {error && items.length === 0 ? (
        <div className="py-8 text-center text-[12px] text-white/40">
          {language === 'pt' ? 'Não foi possível carregar os papéis de parede. Verifique a sua conexão e tente novamente.' : "Couldn't load wallpapers. Check your connection and try again."}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {items.map(w => (
            <button
              key={`${w.source}-${w.id}`}
              onClick={() => onApply(w.full)}
              title={w.author ? (language === 'pt' ? `Foto de ${w.author}` : `Photo by ${w.author}`) : (language === 'pt' ? 'Aplicar papel de parede' : 'Apply wallpaper')}
              className={`relative aspect-video rounded-lg overflow-hidden border transition-all group ${
                activeUrl === w.full ? 'ring-2 ring-primary border-transparent scale-[1.02]' : 'border-white/5 hover:border-white/20'
              }`}
            >
              <img src={w.thumb} alt={w.author ?? ''} loading="lazy" className="w-full h-full object-cover" />
              {w.author && (
                <span className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent text-[8px] text-white/70 px-1.5 py-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                  {w.author}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Footer: load more + attribution */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          onClick={loadMore}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-white/70 text-[11px] font-bold hover:bg-white/[0.08] disabled:opacity-50 transition-all"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          {loading ? (language === 'pt' ? 'Carregando…' : 'Loading…') : (language === 'pt' ? 'Carregar mais' : 'Load more')}
        </button>
        <a
          href={WALLPAPER_PROVIDER === 'unsplash' ? 'https://unsplash.com' : WALLPAPER_PROVIDER === 'pexels' ? 'https://pexels.com' : 'https://picsum.photos'}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/50 transition-colors"
        >
          {language === 'pt' ? 'Fotos via' : 'Photos via'} {WALLPAPER_PROVIDER} <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
}
