import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Music } from 'lucide-react';
import SpotifyPlayer from '@/components/SpotifyPlayer';

interface SoundsPanelProps {
  ambientSound: string;
  ambientVolume: number;
  onSoundChange: (sound: string) => void;
  onVolumeChange: (vol: number) => void;
}

const SOUNDS = [
  { id: 'rain', label: 'Rain', emoji: '🌧', url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_8dd9b81e4b.mp3' },
  { id: 'ocean', label: 'Ocean', emoji: '🌊', url: 'https://cdn.pixabay.com/download/audio/2022/02/23/audio_7793e4272f.mp3' },
  { id: 'cafe', label: 'Bustling Café', emoji: '☕', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d1a5b89ebc.mp3' },
  { id: 'forest', label: 'Forest', emoji: '🌲', url: 'https://cdn.pixabay.com/download/audio/2022/01/20/audio_8af41e52f7.mp3' },
  { id: 'fireplace', label: 'Fireplace', emoji: '🔥', url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_9fafa170ea.mp3' },
  { id: 'white', label: 'White Noise', emoji: '⚪', url: '' },
  { id: 'brown', label: 'Brown Noise', emoji: '🟤', url: '' },
  { id: 'pink', label: 'Pink Noise', emoji: '🩷', url: '' },
];

function createNoiseNode(ctx: AudioContext, type: string): AudioBufferSourceNode {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  if (type === 'white') {
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  } else if (type === 'brown') {
    let last = 0;
    for (let i = 0; i < bufferSize; i++) { data[i] = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; last = data[i]; data[i] *= 3.5; }
  } else {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.96900 * b2 + w * 0.1538520;
      b3 = 0.86650 * b3 + w * 0.3104856; b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
    }
  }
  const node = ctx.createBufferSource();
  node.buffer = buffer;
  node.loop = true;
  return node;
}

const PLAYLIST_SUGGESTIONS = ['Lofi', 'Rainy Day Lofi', 'Paris Café', 'Jazz Vibes', 'Ambient'];

export default function SoundsPanel({ ambientSound, ambientVolume, onSoundChange, onVolumeChange }: SoundsPanelProps) {
  const [tab, setTab] = useState<'sounds' | 'music' | 'playlists'>('sounds');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [loadedUrl, setLoadedUrl] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const noiseRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const stopAll = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (noiseRef.current) { try { noiseRef.current.stop(); } catch { /* already stopped */ } noiseRef.current = null; }
    if (ctxRef.current) { void ctxRef.current.close(); ctxRef.current = null; gainRef.current = null; }
  };

  const playSound = (id: string) => {
    stopAll();
    if (id === ambientSound || id === 'none') { onSoundChange('none'); return; }
    onSoundChange(id);
    if (['white', 'brown', 'pink'].includes(id)) {
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      gain.gain.value = ambientVolume;
      gain.connect(ctx.destination);
      const node = createNoiseNode(ctx, id);
      node.connect(gain);
      node.start();
      ctxRef.current = ctx; noiseRef.current = node; gainRef.current = gain;
    } else {
      const sound = SOUNDS.find(s => s.id === id);
      if (sound?.url) {
        const audio = new Audio(sound.url);
        audio.loop = true;
        audio.volume = ambientVolume;
        void audio.play().catch(() => {});
        audioRef.current = audio;
      }
    }
  };

  const isSpotifyUrl = (url: string) => /open\.spotify\.com\/(playlist|album|track)\//.test(url);

  const loadSpotify = () => {
    if (isSpotifyUrl(spotifyUrl)) setLoadedUrl(spotifyUrl);
  };

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = ambientVolume;
    if (gainRef.current) gainRef.current.gain.value = ambientVolume;
  }, [ambientVolume]);
  useEffect(() => () => stopAll(), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="glass-panel p-5 w-[380px] max-h-[440px] flex flex-col"
    >
      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {(['sounds', 'music', 'playlists'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
              tab === t ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
            }`}
          >
            {t === 'sounds' ? 'Sounds' : t === 'music' ? 'My Music' : 'Playlists'}
          </button>
        ))}
      </div>

      {tab === 'sounds' && (
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-3 gap-2">
            {SOUNDS.map(s => (
              <button
                key={s.id}
                onClick={() => playSound(s.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                  ambientSound === s.id
                    ? 'bg-primary/20 ring-1 ring-primary/40'
                    : 'bg-white/[0.04] hover:bg-white/[0.08]'
                }`}
              >
                <span className="text-2xl">{s.emoji}</span>
                <span className="text-[11px] text-white/70">{s.label}</span>
              </button>
            ))}
          </div>

          {/* Volume */}
          <div className="mt-4 flex items-center gap-3">
            <VolumeX size={14} className="text-white/40" />
            <input type="range" min={0} max={1} step={0.05} value={ambientVolume}
              onChange={e => onVolumeChange(parseFloat(e.target.value))}
              className="flex-1 accent-[hsl(270,80%,65%)]" />
            <Volume2 size={14} className="text-white/40" />
          </div>
        </div>
      )}

      {tab === 'music' && (
        <div className="flex-1 flex flex-col gap-3">
          <p className="text-white/50 text-xs">Paste a Spotify playlist, album or track link to play it here.</p>
          <div className="flex gap-2">
            <input
              value={spotifyUrl}
              onChange={e => setSpotifyUrl(e.target.value)}
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
        </div>
      )}

      {tab === 'playlists' && (
        <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin">
          <p className="text-white/40 text-[11px] mb-1">Open a focus playlist on Spotify:</p>
          {PLAYLIST_SUGGESTIONS.map(p => (
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
