import { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Gem, X } from 'lucide-react';
import SpotifyPlayer from '@/components/SpotifyPlayer';
import { usePremium } from '@/hooks/usePremium';
import { useSoundMixer, SOUND_CATALOG, type SoundCategory } from '@/hooks/useSoundMixer';
import { flags } from '@/lib/flags';

const CATEGORIES: { id: 'all' | SoundCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'nature', label: 'Nature' },
  { id: 'urban', label: 'Urban' },
  { id: 'noise', label: 'Noise' },
  { id: 'binaural', label: 'Binaural' },
];

const PLAYLIST_SUGGESTIONS = ['Lofi', 'Rainy Day Lofi', 'Paris Café', 'Jazz Vibes', 'Ambient'];

export default function SoundsPanel() {
  const { checkPremium } = usePremium();
  const { active, toggle, setVolume, stopAll } = useSoundMixer();
  const [tab, setTab] = useState<'sounds' | 'music' | 'playlists'>('sounds');
  const [category, setCategory] = useState<'all' | SoundCategory>('all');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [loadedUrl, setLoadedUrl] = useState('');

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

  const isSpotifyUrl = (url: string) => /open\.spotify\.com\/(playlist|album|track)\//.test(url);
  const loadSpotify = () => { if (isSpotifyUrl(spotifyUrl)) setLoadedUrl(spotifyUrl); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="glass-panel p-5 w-[400px] max-h-[460px] flex flex-col"
    >
      {/* Tabs + category filter */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex gap-1">
          {(['sounds', 'music', 'playlists'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-2.5 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                tab === t ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {t === 'sounds' ? 'Sounds' : t === 'music' ? 'My Music' : 'Playlists'}
            </button>
          ))}
        </div>
        {tab === 'sounds' && (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as 'all' | SoundCategory)}
            aria-label="Filter sounds by category"
            className="bg-white/[0.06] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#15101e]">{c.label}</option>
            ))}
          </select>
        )}
      </div>

      {tab === 'sounds' && (
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-3 gap-2">
            {visible.map((s) => (
              <button
                key={s.id}
                onClick={() => onSoundClick(s.id, s.premium)}
                aria-pressed={!!active[s.id]}
                className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                  active[s.id] ? 'bg-primary/20 ring-1 ring-primary/40' : 'bg-white/[0.04] hover:bg-white/[0.08]'
                }`}
              >
                {s.premium && (
                  <span className="absolute top-1.5 right-1.5" title="Plus">
                    <Gem size={11} className="text-primary" />
                  </span>
                )}
                <span className="text-2xl">{s.emoji}</span>
                <span className="text-[11px] text-white/70 text-center leading-tight">{s.label}</span>
              </button>
            ))}
          </div>

          {/* Active mix — independent volume per layered sound */}
          {activeIds.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Mixing {activeIds.length}
                </span>
                <button onClick={stopAll} className="text-[10px] text-white/40 hover:text-white/70">Stop all</button>
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
                        aria-label={`${def.label} volume`}
                        className="flex-1 accent-[hsl(258,90%,66%)]"
                      />
                      <button onClick={() => toggle(id)} aria-label={`Stop ${def.label}`} className="text-white/30 hover:text-white/70">
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
            <p className="text-white/40 text-xs">Music integration is temporarily unavailable.</p>
          ) : (
            <>
              <p className="text-white/50 text-xs">Paste a Spotify playlist, album or track link to play it here.</p>
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
                  <Music size={14} /> Load
                </button>
              </div>
              {loadedUrl && <SpotifyPlayer playlistUrl={loadedUrl} />}
            </>
          )}
        </div>
      )}

      {tab === 'playlists' && (
        <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin">
          <p className="text-white/40 text-[11px] mb-1">Open a focus playlist on Spotify:</p>
          {PLAYLIST_SUGGESTIONS.map((p) => (
            <button
              key={p}
              onClick={() => window.open(`https://open.spotify.com/search/${encodeURIComponent(p + ' focus playlist')}`, '_blank', 'noopener,noreferrer')}
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
