import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { SOUNDS, useAmbientSound } from '@/hooks/useAmbientSound';
import SpotifyPlayer from './SpotifyPlayer';
import { PremiumGate } from './PremiumGate';

interface SoundsPanelProps {
  ambientSound: string;
  ambientVolume: number;
  onSoundChange: (sound: string) => void;
  onVolumeChange: (vol: number) => void;
}

export default function SoundsPanel({ ambientSound, ambientVolume, onSoundChange, onVolumeChange }: SoundsPanelProps) {
  const [tab, setTab] = useState<'sounds' | 'music' | 'playlists'>('sounds');
  const [currentPlaylistUrl, setCurrentPlaylistUrl] = useState<string>("https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ"); // Default to the initial playlist
  const [tracks, setTracks] = useState<any[]>([]);
  const { activeSounds, playSound, setVolume } = useAmbientSound();

  const spotifyPlaylists = [
    {
      name: "Rainy Day Lofi",
      url: "https://open.spotify.com/playlist/37i9dQZF1DWWZj7q20ZJ4A"
    },
    {
      name: "Paris Café",
      url: "https://open.spotify.com/playlist/37i9dQZF1DXbvU05b1d9wT"
    },
    {
      name: "Flocus Picks", // This is a general "Chill Vibes" playlist based on search. If you have a specific Flocus Picks URL, please provide it.
      url: "https://open.spotify.com/playlist/37i9dQZF1DX4sbAtmU9t8c"
    },
    {
      name: "Relaxing Piano",
      url: "https://open.spotify.com/playlist/37i9dQZF1DXcCnZ3dYxM1M"
    },
    {
      name: "Video Game Music",
      url: "https://open.spotify.com/playlist/37i9dQZF1DWWqr0k0Y2d7k"
    },
    {
      name: "Jazzhop",
      url: "https://open.spotify.com/playlist/37i9dQZF1DX6xGkL62d0v2"
    },
    {
      name: "Holiday Lofi",
      url: "https://open.spotify.com/playlist/37i9dQZF1DWZaS44hR1x9D"
    },
    {
      name: "Christmas Lofi",
      url: "https://open.spotify.com/playlist/37i9dQZF1DWYK8AUzwi00m"
    },
    {
      name: "Lofi",
      url: "https://open.spotify.com/playlist/6zCID88oNjNv9zx6puDHKj"
    }
  ];

  useEffect(() => {
    // Fetching tracks for the default playlist initially
    fetch(`https://xtxjbzdyfmikupbibwmf.supabase.co/functions/v1/spotify-proxy?playlistId=${currentPlaylistUrl.split('/').pop()}`)
      .then(res => res.json())
      .then(data => setTracks(data.items || []))
      .catch(console.error);
  }, [currentPlaylistUrl]); // Re-fetch if the currentPlaylistUrl changes

  const categories = ['free', 'premium'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="glass-panel p-8 w-[900px] h-[90vh] flex flex-col"
    >
      <div className="flex gap-2 mb-8">
        {(['sounds', 'music', 'playlists'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-3 rounded-xl text-sm font-bold capitalize transition-all ${
              tab === t ? 'bg-primary/20 text-primary' : 'bg-white/[0.04] text-white/40 hover:text-white/60'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'sounds' && (
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-10">
          {categories.map(cat => (
            <div key={cat}>
              <h4 className="text-[11px] uppercase tracking-widest text-white/50 font-bold mb-5">
                {cat === 'free' ? 'Sons Gratuitos' : 'Sons Premium (PLUS)'}
              </h4>
              <div className="grid grid-cols-5 gap-3">
                {SOUNDS.filter(s => s.category === cat).map(s => {
                  const content = (
                    <button key={s.id} onClick={() => playSound(s.id, 0.5)}
                      className={`p-4 rounded-2xl transition-all flex flex-col items-center justify-center gap-2 border w-full ${
                        activeSounds[s.id] ? 'bg-primary/20 border-primary' : 'bg-white/[0.04] border-white/5 hover:bg-white/[0.08]'
                      }`}>
                      <span className="text-3xl">{s.emoji}</span>
                      <span className="text-[12px] font-medium text-center">{s.label}</span>
                    </button>
                  );
                  return s.category === 'premium' 
                    ? <PremiumGate key={s.id} featureName="Premium Sounds">{content}</PremiumGate>
                    : content;
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {Object.keys(activeSounds).length > 0 && (
        <div className="mt-4 p-4 rounded-xl bg-white/[0.04] border border-primary/20">
          <h4 className="text-[10px] uppercase tracking-widest text-primary font-bold mb-3">Active Mix</h4>
          {Object.entries(activeSounds).map(([id, vol]) => {
            const s = SOUNDS.find(x => x.id === id);
            return (
              <div key={id} className="flex items-center gap-3 mb-2">
                <span className="w-20 text-[11px] truncate">{s?.label}</span>
                <input type="range" min={0} max={1} step={0.05} value={vol}
                  onChange={e => setVolume(id, parseFloat(e.target.value))}
                  className="flex-1 accent-primary" />
                <button onClick={() => playSound(id, vol)} className="text-white/30 hover:text-red-400">✕</button>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'music' && (
        <div className="flex-1 p-8 space-y-8 overflow-y-auto">
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-white font-black text-4xl">Custom Playlists <span className="text-primary text-sm ml-3 uppercase tracking-widest align-middle">⚡ PLUS</span></h4>
              <p className="text-white/50 text-xl leading-relaxed max-w-2xl">Add your favorite playlists from Spotify, YouTube, Apple Music, SoundCloud, or Amazon Music.</p>
            </div>
            <div className="flex flex-col gap-4 max-w-2xl">
              <input type="text" placeholder="Paste playlist or video URL here" 
                className="w-full bg-black/30 border border-white/10 rounded-2xl px-6 py-6 text-lg outline-none focus:ring-2 focus:ring-primary transition-all"
              />
              <div className="flex gap-4">
                <button className="flex-1 py-5 rounded-2xl bg-primary text-black text-lg font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Load</button>
                <button className="flex-1 py-5 rounded-2xl bg-white/5 text-white text-lg font-bold hover:bg-white/10 transition-all border border-white/5">Save to Favorites</button>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-[11px] uppercase tracking-widest text-white/50 font-bold">Now Playing</h4>
            <div className="w-full bg-white/[0.02] rounded-2xl p-4 border border-white/5">
              <SpotifyPlayer playlistUrl="https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ" />
            </div>
          </div>
        </div>
      )}

      {tab === 'playlists' && (
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-6">
          <div className="w-full bg-white/[0.02] rounded-2xl p-4 border border-white/5">
            <SpotifyPlayer key={currentPlaylistUrl} playlistUrl={currentPlaylistUrl || "https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ"} /> 
          </div>
          <div className="grid grid-cols-4 gap-4">
            {spotifyPlaylists.map((playlist) => (
              <button
                key={playlist.name}
                onClick={() => {
                  setCurrentPlaylistUrl(playlist.url);
                }}
                className="p-6 rounded-3xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition-all flex flex-col items-center justify-center gap-3"
              >
                <span className="text-3xl">🎵</span>
                <span className="text-[12px] font-medium text-center">{playlist.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
