import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

interface SoundsPanelProps {
  ambientSound: string;
  ambientVolume: number;
  onSoundChange: (sound: string) => void;
  onVolumeChange: (vol: number) => void;
}

const SOUND_CATEGORIES = {
  'Natureza': [
    { id: 'rain', label: '🌧 Chuva', url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_8dd9b81e4b.mp3' },
    { id: 'ocean', label: '🌊 Oceano', url: 'https://cdn.pixabay.com/download/audio/2022/02/23/audio_7793e4272f.mp3' },
    { id: 'forest', label: '🌲 Floresta', url: 'https://cdn.pixabay.com/download/audio/2022/01/20/audio_8af41e52f7.mp3' },
  ],
  'Interior': [
    { id: 'cafe', label: '☕ Cafeteria', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d1a5b89ebc.mp3' },
    { id: 'fireplace', label: '🔥 Lareira', url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_9fafa170ea.mp3' },
  ],
  'Ruído': [
    { id: 'white', label: '⚪ Branco', url: '' },
    { id: 'brown', label: '🟤 Castanho', url: '' },
    { id: 'pink', label: '🩷 Rosa', url: '' },
  ],
};

// Generate noise using Web Audio API
function createNoiseNode(ctx: AudioContext, type: 'white' | 'brown' | 'pink'): AudioBufferSourceNode {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  if (type === 'white') {
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  } else if (type === 'brown') {
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const w = Math.random() * 2 - 1;
      data[i] = (last + 0.02 * w) / 1.02;
      last = data[i];
      data[i] *= 3.5;
    }
  } else {
    // Pink noise (simplified)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.96900 * b2 + w * 0.1538520; b3 = 0.86650 * b3 + w * 0.3104856;
      b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
  }
  
  const node = ctx.createBufferSource();
  node.buffer = buffer;
  node.loop = true;
  return node;
}

export default function SoundsPanel({ ambientSound, ambientVolume, onSoundChange, onVolumeChange }: SoundsPanelProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const noiseRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const stopAll = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (noiseRef.current) { noiseRef.current.stop(); noiseRef.current = null; }
    if (ctxRef.current) { ctxRef.current.close(); ctxRef.current = null; gainRef.current = null; }
  };

  const playSound = (id: string) => {
    stopAll();
    if (id === ambientSound || id === 'none') {
      onSoundChange('none');
      return;
    }
    onSoundChange(id);

    if (['white', 'brown', 'pink'].includes(id)) {
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      gain.gain.value = ambientVolume;
      gain.connect(ctx.destination);
      const node = createNoiseNode(ctx, id as 'white' | 'brown' | 'pink');
      node.connect(gain);
      node.start();
      ctxRef.current = ctx;
      noiseRef.current = node;
      gainRef.current = gain;
    } else {
      const allSounds = Object.values(SOUND_CATEGORIES).flat();
      const sound = allSounds.find(s => s.id === id);
      if (sound?.url) {
        const audio = new Audio(sound.url);
        audio.loop = true;
        audio.volume = ambientVolume;
        audio.play().catch(() => {});
        audioRef.current = audio;
      }
    }
  };

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = ambientVolume;
    if (gainRef.current) gainRef.current.gain.value = ambientVolume;
  }, [ambientVolume]);

  useEffect(() => () => stopAll(), []);

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Volume2 size={16} className="text-primary" />
          <h3 className="font-semibold text-foreground text-sm">Sons Ambientes</h3>
        </div>
        {ambientSound !== 'none' && (
          <button onClick={() => playSound('none')} className="text-xs text-muted-foreground hover:text-foreground transition-all">
            <VolumeX size={16} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {Object.entries(SOUND_CATEGORIES).map(([cat, sounds]) => (
          <div key={cat}>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">{cat}</p>
            <div className="flex flex-wrap gap-2">
              {sounds.map(s => (
                <button
                  key={s.id}
                  onClick={() => playSound(s.id)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    ambientSound === s.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Volume */}
      <div className="mt-4 flex items-center gap-3">
        <VolumeX size={14} className="text-muted-foreground" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={ambientVolume}
          onChange={e => onVolumeChange(parseFloat(e.target.value))}
          className="flex-1 accent-primary"
        />
        <Volume2 size={14} className="text-muted-foreground" />
      </div>
    </div>
  );
}
