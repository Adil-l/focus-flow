import { useState, useRef, useCallback } from 'react';

export const SOUNDS = [
  // Free
  { id: 'rain', label: 'Rain', emoji: '🌧', category: 'free', url: 'https://archive.org/download/rain-sounds/rain.mp3' },
  { id: 'ocean', label: 'Ocean', emoji: '🌊', category: 'free', url: 'https://archive.org/download/ocean-waves-sounds/ocean-waves.mp3' },
  { id: 'cafe', label: 'Bustling Café', emoji: '☕', category: 'free', url: 'https://archive.org/download/coffee-shop-ambience/coffee-shop-ambience.mp3' },
  { id: 'airplane', label: 'Airplane Cabin', emoji: '✈️', category: 'free', url: 'https://archive.org/download/airplane-cabin-noise/airplane-cabin.mp3' },
  { id: 'exam', label: 'Exam Hall', emoji: '📝', category: 'free', url: '' },
  { id: 'keyboard', label: 'Keyboard', emoji: '⌨️', category: 'free', url: '' },
  { id: 'kitchen', label: 'Kitchen', emoji: '🍳', category: 'free', url: '' },
  { id: 'white', label: 'White Noise', emoji: '⚪', category: 'free', url: '' },
  { id: 'pink', label: 'Pink Noise', emoji: '🩷', category: 'free', url: '' },
  { id: 'brown', label: 'Brown Noise', emoji: '🟤', category: 'free', url: '' },
  
  // Premium
  { id: 'forest', label: 'Forest', emoji: '🌲', category: 'premium', url: 'https://archive.org/download/forest-ambience/forest-ambience.mp3' },
  { id: 'fireplace', label: 'Fireplace', emoji: '🔥', category: 'premium', url: 'https://archive.org/download/fire-crackle-sound/fire-crackle.mp3' },
  { id: 'birds', label: 'Birds', emoji: '🐦', category: 'premium', url: 'https://archive.org/download/birds-chirping-sounds/birds-chirping.mp3' },
  { id: 'waterfall', label: 'Waterfall', emoji: '💦', category: 'premium', url: 'https://archive.org/download/waterfall-sounds/waterfall.mp3' },
  { id: 'train', label: 'Commuter Train', emoji: '🚆', category: 'premium', url: '' },
  { id: 'j-library', label: 'Japanese Library', emoji: '📚', category: 'premium', url: '' },
  { id: 'nyc', label: 'NYC Morning', emoji: '🏙️', category: 'premium', url: '' },
  { id: 'light-rain', label: 'Light Rain', emoji: '🌦', category: 'premium', url: '' },
  { id: 'heavy-rain', label: 'Heavy Rain', emoji: '⛈️', category: 'premium', url: '' },
  { id: 'thunder', label: 'Thunderstorm', emoji: '🌩', category: 'premium', url: '' },
  { id: 'campfire', label: 'Campfire', emoji: '🪵', category: 'premium', url: '' },
  { id: 'office', label: 'Office', emoji: '💼', category: 'premium', url: '' },
  { id: 'wind', label: 'Wind', emoji: '🌬', category: 'premium', url: '' },
  { id: 'street-cafe', label: 'Street Café', emoji: '☕', category: 'premium', url: '' },
  { id: 'country-morning', label: 'Countryside', emoji: '🌅', category: 'premium', url: '' },
  { id: 'summer-night', label: 'Summer Night', emoji: '🌙', category: 'premium', url: '' },
  { id: 'central-park', label: 'Central Park', emoji: '🌳', category: 'premium', url: '' },
  { id: 'airport', label: 'Airport Terminal', emoji: '🛫', category: 'premium', url: '' },
  { id: 'deep-sea', label: 'Deep Sea', emoji: '🤿', category: 'premium', url: '' },
  { id: 'underwater', label: 'Underwater', emoji: '🫧', category: 'premium', url: '' },
  { id: 'tent-rain', label: 'Rain on Tent', emoji: '⛺', category: 'premium', url: '' },
  { id: 'whales', label: 'Whales', emoji: '🐋', category: 'premium', url: '' },
  { id: 'space', label: 'Outer Space', emoji: '🌌', category: 'premium', url: '' },
  { id: 'ac', label: 'AC', emoji: '❄️', category: 'premium', url: '' },
  { id: 'fan', label: 'Fan', emoji: '🌀', category: 'premium', url: '' },
  { id: 'bowling', label: 'Bowling', emoji: '🎳', category: 'premium', url: '' },
  { id: 'static', label: 'Vinyl Static', emoji: '💽', category: 'premium', url: '' },
  { id: 'clock', label: 'Clock', emoji: '🕰', category: 'premium', url: '' },
  { id: 'cat', label: 'Cat Purr', emoji: '🐱', category: 'premium', url: '' },
];


export function useAmbientSound() {
  const [activeSounds, setActiveSounds] = useState<Record<string, number>>({}); 
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  const playSound = useCallback((id: string, vol: number) => {
    if (activeSounds[id] !== undefined) {
      audioRefs.current[id]?.pause();
      const next = { ...activeSounds };
      delete next[id];
      setActiveSounds(next);
      return;
    }

    const sound = SOUNDS.find(s => s.id === id);
    if (sound?.url) {
      const audio = new Audio(sound.url);
      audio.loop = true;
      audio.volume = vol;
      audio.play().catch(console.error);
      audioRefs.current[id] = audio;
      setActiveSounds(prev => ({ ...prev, [id]: vol }));
    }
  }, [activeSounds]);

  const setVolume = (id: string, vol: number) => {
    if (audioRefs.current[id]) audioRefs.current[id].volume = vol;
    setActiveSounds(prev => ({ ...prev, [id]: vol }));
  };

  return { activeSounds, playSound, setVolume };
}
