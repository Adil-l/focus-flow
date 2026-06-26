import { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, X, Star, Pause, Shuffle } from 'lucide-react';
import { toast } from 'sonner';
import SpotifyPlayer from '@/components/SpotifyPlayer';
import { usePremium } from '@/hooks/usePremium';
import { SOUND_CATALOG, type SoundCategory } from '@/hooks/useSoundMixer';
import { flags } from '@/lib/flags';
import { openExternal } from '@/lib/openExternal';
import { useTranslation } from '@/lib/i18n';

interface SoundsPanelProps {
  active: Record<string, number>;
  toggle: (id: string, defaultVol?: number) => void;
  setVolume: (id: string, vol: number) => void;
  stopAll: () => void;
}

const FAVORITES_KEY = 'pomo:musicFavorites';
const loadFavorites = (): string[] => {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'); } catch { return []; }
};

const CATEGORIES: { id: 'all' | SoundCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'nature', label: 'Nature' },
  { id: 'urban', label: 'Urban' },
  { id: 'noise', label: 'Noise' },
  { id: 'binaural', label: 'Binaural' },
];

const PLAYLIST_SUGGESTIONS = [
  'Lofi', 'Rainy Day Lofi', 'Paris Café', 'Focus Picks', 'Relaxing Piano',
  'Video Game Music', 'Jazzhop', 'Jazz Vibes', 'Ambient', 'Deep Focus', 'Classical', 'Holiday Lofi',
];

export default function SoundsPanel({ active, toggle, setVolume, stopAll }: SoundsPanelProps) {
  const { checkPremium } = usePremium();
  const { t, language } = useTranslation();
  const categoryLabel = (id: string, fallback: string) => {
    if (language !== 'pt') return fallback;
    const map: Record<string, string> = {
      all: 'Todos',
      nature: 'Natureza',
      urban: 'Urbano',
      noise: 'Ruído',
      binaural: 'Binaural',
    };
    return map[id] ?? fallback;
  };
  const [tab, setTab] = useState<'sounds' | 'music' | 'playlists'>('sounds');
  const [category, setCategory] = useState<'all' | SoundCategory>('all');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [loadedUrl, setLoadedUrl] = useState('');
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);

  const persistFavorites = (next: string[]) => {
    setFavorites(next);
    try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };
  const saveFavorite = () => {
    if (!isSpotifyUrl(spotifyUrl)) return;
    if (!checkPremium('music favorites')) return; // Plus feature
    if (favorites.includes(spotifyUrl)) return;
    if (favorites.length >= 5) { toast.error(language === 'pt' ? 'Pode guardar até 5 favoritos' : 'You can save up to 5 favorites'); return; }
    persistFavorites([...favorites, spotifyUrl]);
    toast.success(language === 'pt' ? 'Guardado nos favoritos' : 'Saved to favorites');
  };
  const removeFavorite = (url: string) => persistFavorites(favorites.filter((u) => u !== url));
  const favoriteLabel = (url: string) => {
    const id = url.split('/').pop()?.split('?')[0] ?? url;
    return id.slice(0, 10);
  };

  const visible = SOUND_CATALOG.filter((s) => {
    if (s.category === 'binaural' && flags.killBinaural) return false;
    return category === 'all' || s.category === category;
  });
  const activeIds = Object.keys(active);

  const onSoundClick = (id: string, premium?: boolean) => {
    // Premium gate: block turning ON a Plus sound; always allow turning OFF.
    if (premium && !active[id] && !checkPremium('premium sounds')) return;
    toggle(id);
  };

  const shuffle = () => {
    const pool = visible.filter((s) => !active[s.id]);
    if (pool.length === 0) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    onSoundClick(pick.id, pick.premium);
  };

  const isSpotifyUrl = (url: string) => /open\.spotify\.com\/(playlist|album|track)\//.test(url);
  const loadSpotify = () => { if (isSpotifyUrl(spotifyUrl)) setLoadedUrl(spotifyUrl); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="glass-panel p-6 sm:p-8 w-[min(1120px,94vw)] h-[84vh] flex flex-col"
    >
      {/* Tabs + controls */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap border-b border-white/[0.06] pb-4">
        <div className="flex items-end gap-5">
          {(['sounds', 'music', 'playlists'] as const).map((tabId) => (
            <button
              key={tabId}
              onClick={() => setTab(tabId)}
              className={`text-lg sm:text-xl font-black transition-all ${
                tab === tabId ? 'text-white' : 'text-white/30 hover:text-white/50'
              }`}
            >
              {tabId === 'sounds'
                ? (language === 'pt' ? 'Sons' : 'Sounds')
                : tabId === 'music'
                  ? (language === 'pt' ? 'Minha Música' : 'My Music')
                  : (language === 'pt' ? 'Biblioteca de Playlists' : 'Playlist Library')}
            </button>
          ))}
        </div>
        {tab === 'sounds' && (
          <div className="flex items-center gap-2">
            <button
              onClick={stopAll}
              disabled={activeIds.length === 0}
              title={language === 'pt' ? 'Parar tudo' : 'Stop all'}
              className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/30 disabled:opacity-40 transition-all"
            >
              <Pause size={16} />
            </button>
            <button
              onClick={shuffle}
              title={language === 'pt' ? 'Som aleatório' : 'Shuffle a sound'}
              className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/30 transition-all"
            >
              <Shuffle size={15} />
            </button>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as 'all' | SoundCategory)}
              aria-label={language === 'pt' ? 'Filtrar sons por categoria' : 'Filter sounds by category'}
              className="bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#15101e]">{categoryLabel(c.id, c.label)}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {tab === 'sounds' && (
        <div className="flex-1 overflow-y-auto scrollbar-thin pr-1">
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {visible.map((s) => (
              <button
                key={s.id}
                onClick={() => onSoundClick(s.id, s.premium)}
                aria-pressed={!!active[s.id]}
                className={`relative flex flex-col items-center justify-center gap-2 py-6 px-2 rounded-2xl transition-all ${
                  active[s.id] ? 'bg-primary/20 ring-1 ring-primary/40' : 'bg-white/[0.04] hover:bg-white/[0.08]'
                }`}
              >
                {s.premium && (
                  <span className="absolute top-2 left-2 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/25 text-primary">
                    Plus
                  </span>
                )}
                <span className="text-3xl">{s.emoji}</span>
                <span className="text-[12px] text-white/70 text-center leading-tight">{s.label}</span>
              </button>
            ))}
          </div>

          {/* Active mix — independent volume per layered sound */}
          {activeIds.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  {language === 'pt' ? 'A misturar' : 'Mixing'} {activeIds.length}
                </span>
                <button onClick={stopAll} className="text-[10px] text-white/40 hover:text-white/70">{language === 'pt' ? 'Parar tudo' : 'Stop all'}</button>
              </div>
              <div className="space-y-2">
                {activeIds.map((id) => {
                  const def = SOUND_CATALOG.find((s) => s.id === id);
                  if (!def) return null;
                  return (
                    <div key={id} className="flex items-center gap-2">
                      <span className="text-sm w-5 text-center">{def.emoji}</span>
                      <span className="text-[11px] text-white/60 w-24 truncate">{def.label}</span>
                      <input
                        type="range" min={0} max={1} step={0.05} value={active[id]}
                        onChange={(e) => setVolume(id, parseFloat(e.target.value))}
                        aria-label={language === 'pt' ? `Volume de ${def.label}` : `${def.label} volume`}
                        className="flex-1 accent-[hsl(258,90%,66%)]"
                      />
                      <button onClick={() => toggle(id)} aria-label={language === 'pt' ? `Parar ${def.label}` : `Stop ${def.label}`} className="text-white/30 hover:text-white/70">
                        <X size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'music' && (
        <div className="flex-1 flex flex-col gap-3">
          {flags.killSpotify ? (
            <p className="text-white/40 text-xs">{language === 'pt' ? 'A integração de música está temporariamente indisponível.' : 'Music integration is temporarily unavailable.'}</p>
          ) : (
            <>
              <p className="text-white/50 text-xs">{language === 'pt' ? 'Cole o link de uma playlist, álbum ou faixa do Spotify para tocar aqui.' : 'Paste a Spotify playlist, album or track link to play it here.'}</p>
              <div className="flex gap-2">
                <input
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  placeholder="https://open.spotify.com/playlist/…"
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-primary placeholder:text-white/20"
                />
                <button
                  onClick={loadSpotify}
                  disabled={!isSpotifyUrl(spotifyUrl)}
                  className="px-3 py-2 rounded-lg bg-[#1DB954] text-white text-xs font-bold flex items-center gap-1 disabled:opacity-40"
                >
                  <Music size={14} /> {language === 'pt' ? 'Carregar' : 'Load'}
                </button>
                <button
                  onClick={saveFavorite}
                  disabled={!isSpotifyUrl(spotifyUrl)}
                  title={language === 'pt' ? 'Guardar nos favoritos (Plus)' : 'Save to favorites (Plus)'}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1 disabled:opacity-40"
                >
                  <Star size={13} /> {language === 'pt' ? 'Guardar' : 'Save'}
                </button>
              </div>

              {favorites.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {favorites.map((url) => (
                    <span key={url} className="flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[11px] text-white/70">
                      <button onClick={() => { setSpotifyUrl(url); setLoadedUrl(url); }} className="hover:text-white transition-colors">🎵 {favoriteLabel(url)}</button>
                      <button onClick={() => removeFavorite(url)} aria-label={language === 'pt' ? 'Remover favorito' : 'Remove favorite'} className="text-white/30 hover:text-white/70"><X size={11} /></button>
                    </span>
                  ))}
                </div>
              )}

              {loadedUrl && <SpotifyPlayer playlistUrl={loadedUrl} />}
            </>
          )}
        </div>
      )}

      {tab === 'playlists' && (
        <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin">
          <p className="text-white/40 text-[11px] mb-1">{language === 'pt' ? 'Abrir uma playlist de foco no Spotify:' : 'Open a focus playlist on Spotify:'}</p>
          {PLAYLIST_SUGGESTIONS.map((p) => (
            <button
              key={p}
              onClick={() => openExternal(`https://open.spotify.com/search/${encodeURIComponent(p + ' focus playlist')}`)}
              className="w-full text-left p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-sm text-white/80 transition-all"
            >
              🎵 {p}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
