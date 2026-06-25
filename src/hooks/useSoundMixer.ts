import { useCallback, useEffect, useRef, useState } from 'react';

export type SoundCategory = 'nature' | 'urban' | 'noise' | 'binaural';

export interface SoundDef {
  id: string;
  label: string;
  emoji: string;
  category: SoundCategory;
  premium?: boolean;
  kind: 'url' | 'noise' | 'binaural';
  url?: string;
  noise?: 'white' | 'pink' | 'brown';
  beat?: number;    // binaural beat frequency (Hz)
  carrier?: number; // binaural carrier frequency (Hz)
}

// Catalog mirrors Flocus: a free core + a large premium set incl. binaural beats.
export const SOUND_CATALOG: SoundDef[] = [
  // Nature (free core)
  { id: 'rain', label: 'Rain', emoji: '🌧', category: 'nature', kind: 'url', url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_8dd9b81e4b.mp3' },
  { id: 'ocean', label: 'Ocean', emoji: '🌊', category: 'nature', kind: 'url', url: 'https://cdn.pixabay.com/download/audio/2022/02/23/audio_7793e4272f.mp3' },
  { id: 'forest', label: 'Forest', emoji: '🌲', category: 'nature', premium: true, kind: 'url', url: 'https://cdn.pixabay.com/download/audio/2022/01/20/audio_8af41e52f7.mp3' },
  { id: 'fireplace', label: 'Fireplace', emoji: '🔥', category: 'nature', premium: true, kind: 'url', url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_9fafa170ea.mp3' },
  // Urban
  { id: 'cafe', label: 'Café', emoji: '☕', category: 'urban', kind: 'url', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d1a5b89ebc.mp3' },
  // Noise generators
  { id: 'white', label: 'White Noise', emoji: '⚪', category: 'noise', kind: 'noise', noise: 'white' },
  { id: 'brown', label: 'Brown Noise', emoji: '🟤', category: 'noise', kind: 'noise', noise: 'brown' },
  { id: 'pink', label: 'Pink Noise', emoji: '🩷', category: 'noise', premium: true, kind: 'noise', noise: 'pink' },
  // Binaural beats (all premium) — carrier ~200Hz, L/R detuned by the beat freq
  { id: 'bin-gamma', label: 'Gamma 40Hz', emoji: '🧠', category: 'binaural', premium: true, kind: 'binaural', carrier: 200, beat: 40 },
  { id: 'bin-beta', label: 'Beta 20Hz', emoji: '⚡', category: 'binaural', premium: true, kind: 'binaural', carrier: 200, beat: 20 },
  { id: 'bin-alpha', label: 'Alpha 10Hz', emoji: '🌿', category: 'binaural', premium: true, kind: 'binaural', carrier: 200, beat: 10 },
  { id: 'bin-theta', label: 'Theta 6Hz', emoji: '🌙', category: 'binaural', premium: true, kind: 'binaural', carrier: 180, beat: 6 },
  { id: 'bin-delta', label: 'Delta 2Hz', emoji: '😴', category: 'binaural', premium: true, kind: 'binaural', carrier: 160, beat: 2 },
];

interface WindowWithWebkitAudio extends Window { webkitAudioContext?: typeof AudioContext }

function createNoiseNode(ctx: AudioContext, type: 'white' | 'pink' | 'brown'): AudioBufferSourceNode {
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

interface Channel { setVolume: (v: number) => void; stop: () => void; }

const byId = (id: string) => SOUND_CATALOG.find((s) => s.id === id);

/**
 * Multi-channel ambient sound mixer: any number of sounds can play at once, each
 * with an independent volume. Supports looped URL clips, generated white/pink/
 * brown noise, and binaural beats (two L/R-panned detuned oscillators).
 * Active channels persist to localStorage so the mix survives a reload.
 */
export function useSoundMixer({ allowPremium = true }: { allowPremium?: boolean } = {}) {
  const [active, setActive] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem('pomo:mixer') || '{}'); } catch { return {}; }
  });
  const channelsRef = useRef<Map<string, Channel>>(new Map());
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      const Ctor = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      ctxRef.current = new Ctor();
    }
    return ctxRef.current;
  }, []);

  const startChannel = useCallback((def: SoundDef, vol: number): Channel => {
    if (def.kind === 'url' && def.url) {
      const audio = new Audio(def.url);
      audio.loop = true;
      audio.volume = vol;
      void audio.play().catch(() => {});
      return { setVolume: (v) => { audio.volume = v; }, stop: () => { audio.pause(); } };
    }
    if (def.kind === 'noise' && def.noise) {
      const ctx = getCtx();
      const gain = ctx.createGain();
      gain.gain.value = vol;
      gain.connect(ctx.destination);
      const node = createNoiseNode(ctx, def.noise);
      node.connect(gain);
      node.start();
      return { setVolume: (v) => { gain.gain.value = v; }, stop: () => { try { node.stop(); } catch { /* stopped */ } } };
    }
    // binaural
    const ctx = getCtx();
    const carrier = def.carrier ?? 200;
    const beat = def.beat ?? 10;
    const gain = ctx.createGain();
    gain.gain.value = vol * 0.4; // oscillators are loud — keep them gentle
    gain.connect(ctx.destination);
    const mkOsc = (freq: number, pan: number) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const panner = ctx.createStereoPanner();
      panner.pan.value = pan;
      osc.connect(panner);
      panner.connect(gain);
      osc.start();
      return osc;
    };
    const left = mkOsc(carrier, -1);
    const right = mkOsc(carrier + beat, 1);
    return {
      setVolume: (v) => { gain.gain.value = v * 0.4; },
      stop: () => { try { left.stop(); right.stop(); } catch { /* stopped */ } },
    };
  }, [getCtx]);

  const persist = (next: Record<string, number>) => {
    try { localStorage.setItem('pomo:mixer', JSON.stringify(next)); } catch { /* ignore */ }
  };

  const toggle = useCallback((id: string, defaultVol = 0.5) => {
    const def = byId(id);
    if (!def) return;
    setActive((prev) => {
      const next = { ...prev };
      if (channelsRef.current.has(id)) {
        channelsRef.current.get(id)!.stop();
        channelsRef.current.delete(id);
        delete next[id];
      } else {
        const vol = prev[id] ?? defaultVol;
        channelsRef.current.set(id, startChannel(def, vol));
        next[id] = vol;
      }
      persist(next);
      return next;
    });
  }, [startChannel]);

  const setVolume = useCallback((id: string, vol: number) => {
    channelsRef.current.get(id)?.setVolume(vol);
    setActive((prev) => {
      if (prev[id] === undefined) return prev;
      const next = { ...prev, [id]: vol };
      persist(next);
      return next;
    });
  }, []);

  const stopAll = useCallback(() => {
    channelsRef.current.forEach((c) => c.stop());
    channelsRef.current.clear();
    setActive({});
    persist({});
  }, []);

  // Resume any persisted mix on mount; tear everything down on unmount.
  useEffect(() => {
    const saved = { ...active };
    const pruned: Record<string, number> = {};
    Object.entries(saved).forEach(([id, vol]) => {
      const def = byId(id);
      if (!def) return;
      // Don't silently resume Plus-only sounds for a user without entitlement.
      if (def.premium && !allowPremium) return;
      pruned[id] = vol;
      if (!channelsRef.current.has(id)) {
        channelsRef.current.set(id, startChannel(def, vol));
      }
    });
    if (Object.keys(pruned).length !== Object.keys(saved).length) {
      setActive(pruned);
      persist(pruned);
    }
    const channels = channelsRef.current;
    const ctx = ctxRef;
    return () => {
      channels.forEach((c) => c.stop());
      channels.clear();
      ctx.current?.close().catch(() => {});
      ctx.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { active, toggle, setVolume, stopAll };
}
