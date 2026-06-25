export interface Theme {
  id: string;
  name: string;
  category: 'gradient' | 'ambient-world' | 'minimal' | 'animated' | 'special' | 'anime' | 'sports' | 'cars' | 'movies' | 'football' | 'motogp';
  preview: string;
  background: string;
  isAnimated?: boolean;
}

// Keyless, topic-matched photos from LoremFlickr (real Flickr images by tag).
// `lock` pins one specific photo so the preview and the full background are the
// same image at different sizes, and it never changes between loads.
const flick = (tags: string, lock: number) => ({
  preview: `https://loremflickr.com/600/340/${tags}?lock=${lock}`,
  background: `https://loremflickr.com/1920/1080/${tags}?lock=${lock}`,
});

export const THEMES: Theme[] = [
  // Gradients & Colors
  { id: 'aura-twilight', name: 'Aura Twilight', category: 'gradient', preview: 'linear-gradient(135deg, hsl(280 70% 25%), hsl(310 60% 35%), hsl(340 50% 40%))', background: '' },
  { id: 'peach-aura-heart', name: 'Peach Aura Heart', category: 'gradient', preview: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', background: '' },
  { id: 'light-pink-heart', name: 'Light Pink Heart', category: 'gradient', preview: 'linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%)', background: '' },
  { id: 'flare', name: 'Flare', category: 'animated', isAnimated: true, preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', background: '' },
  { id: 'lava-lamp', name: 'Lava Lamp', category: 'animated', isAnimated: true, preview: 'linear-gradient(135deg, #ff6b35, #f7c59f, #efa8c8)', background: '' },
  { id: 'minimalist-black', name: 'Minimalist Black', category: 'minimal', preview: 'linear-gradient(135deg, #0a0a0a, #1a1a1a)', background: '' },
  { id: 'cyberpunk-grid', name: 'Cyberpunk Grid', category: 'animated', isAnimated: true, preview: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', background: '' },
  { id: 'retrowave-sunset', name: 'Retrowave Sunset', category: 'gradient', preview: 'linear-gradient(135deg, #ff00cc, #333399)', background: '' },

  // Anime
  { id: 'naruto', name: 'Naruto', category: 'anime', ...flick('naruto', 11) },
  { id: 'jujutsu-kaisen', name: 'Jujutsu Kaisen', category: 'anime', ...flick('anime', 12) },
  { id: 'one-piece', name: 'One Piece', category: 'anime', ...flick('onepiece', 13) },
  { id: 'attack-on-titan', name: 'Attack on Titan', category: 'anime', ...flick('anime', 14) },
  { id: 'demon-slayer', name: 'Demon Slayer', category: 'anime', ...flick('anime', 15) },
  { id: 'dragon-ball', name: 'Dragon Ball Z', category: 'anime', ...flick('dragonball', 16) },

  // Formula 1
  { id: 'lewis-hamilton', name: 'Lewis Hamilton', category: 'sports', ...flick('formula1', 21) },
   { id: 'max-verstappen-1', name: 'Max Verstappen #1', category: 'sports', preview: '/wallpapers/MAX1.jpg', background: '/wallpapers/MAX1.jpg' },
   { id: 'max-verstappen-2', name: 'Max Verstappen #2', category: 'sports', preview: '/wallpapers/MAX2.jpg', background: '/wallpapers/MAX2.jpg' },
   { id: 'max-verstappen-3', name: 'Max Verstappen #3', category: 'sports', preview: '/wallpapers/MAX3.jpg', background: '/wallpapers/MAX3.jpg' },
   { id: 'max-verstappen-4', name: 'Max Verstappen #4', category: 'sports', preview: '/wallpapers/MAX4.jpg', background: '/wallpapers/MAX4.jpg' },
   { id: 'redbull-max-car-1', name: 'Red Bull RB20 #1', category: 'cars', preview: '/wallpapers/MAX5.jpg', background: '/wallpapers/MAX5.jpg' },
   { id: 'redbull-max-car-2', name: 'Red Bull RB20 #2', category: 'cars', preview: '/wallpapers/MAX6.jpg', background: '/wallpapers/MAX6.jpg' },
   { id: 'redbull-max-car-3', name: 'Red Bull RB20 #3', category: 'cars', preview: '/wallpapers/MAX7.jpg', background: '/wallpapers/MAX7.jpg' },
   { id: 'redbull-max-car-4', name: 'Red Bull RB20 #4', category: 'cars', preview: '/wallpapers/MAX8.jpg', background: '/wallpapers/MAX8.jpg' },
  { id: 'charles-leclerc', name: 'Charles Leclerc', category: 'sports', ...flick('ferrari', 22) },
  { id: 'ferrari-f1', name: 'Ferrari F1', category: 'cars', ...flick('ferrari,formula1', 23) },
  { id: 'redbull-f1', name: 'Red Bull Racing', category: 'cars', ...flick('formula1', 24) },

  // Moto GP
  { id: 'marquez', name: 'Marc Marquez', category: 'motogp', ...flick('motogp', 31) },
  { id: 'rossi', name: 'Valentino Rossi', category: 'motogp', ...flick('motogp', 32) },

  // Football
  { id: 'messi', name: 'Lionel Messi', category: 'football', ...flick('messi', 41) },
  { id: 'ronaldo', name: 'Cristiano Ronaldo', category: 'football', ...flick('ronaldo', 42) },
  { id: 'neymar', name: 'Neymar Jr', category: 'football', ...flick('neymar', 43) },
  { id: 'mbappe', name: 'Kylian Mbappé', category: 'football', ...flick('mbappe', 44) },

  // NBA
  { id: 'lebron', name: 'LeBron James', category: 'sports', ...flick('lebron', 51) },
  { id: 'kobe', name: 'Kobe Bryant', category: 'sports', ...flick('basketball', 52) },
  { id: 'jordan', name: 'Michael Jordan', category: 'sports', ...flick('basketball', 53) },
  { id: 'curry', name: 'Stephen Curry', category: 'sports', ...flick('basketball', 54) },

  // Cars
  { id: 'supra-mk4', name: 'Toyota Supra MK4', category: 'cars', ...flick('supra', 61) },
  { id: 'gtr-r35', name: 'Nissan GTR R35', category: 'cars', ...flick('nissan,gtr', 62) },
  { id: 'ferrari-f40', name: 'Ferrari F40', category: 'cars', ...flick('ferrari', 63) },
  { id: 'lamborghini', name: 'Lamborghini Aventador', category: 'cars', ...flick('lamborghini', 64) },

  // Ambient Worlds
  { id: 'rainy-lofi-cafe', name: 'Rainy Lofi Cafe', category: 'ambient-world', isAnimated: true, preview: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=400&q=80', background: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1920&q=85' },
  { id: 'countryside-morning', name: 'Countryside Morning', category: 'ambient-world', preview: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80', background: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=85' },
  { id: 'lofi-clouds', name: 'Lofi Clouds', category: 'ambient-world', isAnimated: true, preview: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=400&q=80', background: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=85' },
  { id: 'flickering-fireplace', name: 'Flickering Fireplace', category: 'ambient-world', isAnimated: true, preview: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=400&q=80', background: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=1920&q=85' },
];

// Image-based, content-rich themes are Plus; generated gradients/minimal/animated stay free.
const PREMIUM_THEME_CATEGORIES = new Set<Theme['category']>([
  'anime', 'sports', 'cars', 'football', 'motogp', 'ambient-world', 'movies',
]);
export const isThemePremium = (theme: Theme): boolean => PREMIUM_THEME_CATEGORIES.has(theme.category);

export const THEME_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'gradient', label: 'Gradients & Colors' },
  { id: 'ambient-world', label: 'Ambient Worlds' },
  { id: 'anime', label: '🎬 Anime' },
  { id: 'sports', label: '🏀 NBA & F1' },
  { id: 'football', label: '⚽ Football' },
  { id: 'motogp', label: '🏍️ Moto GP' },
  { id: 'cars', label: '🏎️ Cars' },
  { id: 'animated', label: '⚡ Animated' },
  { id: 'minimal', label: 'Minimal' },
];