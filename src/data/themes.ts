export interface Theme {
  id: string;
  name: string;
  category: 'gradient' | 'ambient-world' | 'minimal' | 'animated' | 'special' | 'anime' | 'sports' | 'cars' | 'movies' | 'football' | 'motogp';
  preview: string;
  background: string;
  isAnimated?: boolean;
}

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
  { id: 'naruto', name: 'Naruto', category: 'anime', preview: 'https://i.pinimg.com/736x/8b/3a/1f/8b3a1f3e8b3f5d10b2e1e9d0c7f9a8b0.jpg', background: 'https://i.pinimg.com/originals/8b/3a/1f/8b3a1f3e8b3f5d10b2e1e9d0c7f9a8b0.jpg' },
  { id: 'jujutsu-kaisen', name: 'Jujutsu Kaisen', category: 'anime', preview: 'https://i.pinimg.com/736x/0d/41/9b/0d419b5f3e0f8a4a7a1793d03a0e25d5.jpg', background: 'https://i.pinimg.com/originals/0d/41/9b/0d419b5f3e0f8a4a7a1793d03a0e25d5.jpg' },
  { id: 'one-piece', name: 'One Piece', category: 'anime', preview: 'https://i.pinimg.com/736x/6f/84/2d/6f842d6f3e4a8e6b4c2f3e0a3c0b9a6d.jpg', background: 'https://i.pinimg.com/originals/6f/84/2d/6f842d6f3e4a8e6b4c2f3e0a3c0b9a6d.jpg' },
  { id: 'attack-on-titan', name: 'Attack on Titan', category: 'anime', preview: 'https://i.pinimg.com/736x/8e/d9/0c/8ed90c4706f7b3d92755747c3f389564.jpg', background: 'https://i.pinimg.com/originals/8e/d9/0c/8ed90c4706f7b3d92755747c3f389564.jpg' },
  { id: 'demon-slayer', name: 'Demon Slayer', category: 'anime', preview: 'https://i.pinimg.com/736x/50/0e/02/500e02e3b5f3b71f6c8e6e69751f2c03.jpg', background: 'https://i.pinimg.com/originals/50/0e/02/500e02e3b5f3b71f6c8e6e69751f2c03.jpg' },
  { id: 'dragon-ball', name: 'Dragon Ball Z', category: 'anime', preview: 'https://i.pinimg.com/736x/43/e5/27/43e5274d3a8801b62b3e5387483713d1.jpg', background: 'https://i.pinimg.com/originals/43/e5/27/43e5274d3a8801b62b3e5387483713d1.jpg' },

  // Formula 1
  { id: 'lewis-hamilton', name: 'Lewis Hamilton', category: 'sports', preview: 'https://wallpaperaccess.com/full/1911177.jpg', background: 'https://wallpaperaccess.com/full/1911177.jpg' },
   { id: 'max-verstappen-1', name: 'Max Verstappen #1', category: 'sports', preview: '/wallpapers/MAX1.jpg', background: '/wallpapers/MAX1.jpg' },
   { id: 'max-verstappen-2', name: 'Max Verstappen #2', category: 'sports', preview: '/wallpapers/MAX2.jpg', background: '/wallpapers/MAX2.jpg' },
   { id: 'max-verstappen-3', name: 'Max Verstappen #3', category: 'sports', preview: '/wallpapers/MAX3.jpg', background: '/wallpapers/MAX3.jpg' },
   { id: 'max-verstappen-4', name: 'Max Verstappen #4', category: 'sports', preview: '/wallpapers/MAX4.jpg', background: '/wallpapers/MAX4.jpg' },
   { id: 'redbull-max-car-1', name: 'Red Bull RB20 #1', category: 'cars', preview: '/wallpapers/MAX5.jpg', background: '/wallpapers/MAX5.jpg' },
   { id: 'redbull-max-car-2', name: 'Red Bull RB20 #2', category: 'cars', preview: '/wallpapers/MAX6.jpg', background: '/wallpapers/MAX6.jpg' },
   { id: 'redbull-max-car-3', name: 'Red Bull RB20 #3', category: 'cars', preview: '/wallpapers/MAX7.jpg', background: '/wallpapers/MAX7.jpg' },
   { id: 'redbull-max-car-4', name: 'Red Bull RB20 #4', category: 'cars', preview: '/wallpapers/MAX8.jpg', background: '/wallpapers/MAX8.jpg' },
  { id: 'charles-leclerc', name: 'Charles Leclerc', category: 'sports', preview: 'https://i.pinimg.com/1200x/bf/92/cb/bf92cba3278bbab0011b441fc99a909c.jpg', background: 'https://i.pinimg.com/originals/bf/92/cb/bf92cba3278bbab0011b441fc99a909c.jpg' },
  { id: 'ferrari-f1', name: 'Ferrari F1', category: 'cars', preview: 'https://wallpaperaccess.com/full/4239686.jpg', background: 'https://wallpaperaccess.com/full/4239686.jpg' },
  { id: 'redbull-f1', name: 'Red Bull Racing', category: 'cars', preview: 'https://wallpaperaccess.com/full/5012681.jpg', background: 'https://wallpaperaccess.com/full/5012681.jpg' },

  // Moto GP
  { id: 'marquez', name: 'Marc Marquez', category: 'motogp', preview: 'https://wallpaperaccess.com/full/1314919.jpg', background: 'https://wallpaperaccess.com/full/1314919.jpg' },
  { id: 'rossi', name: 'Valentino Rossi', category: 'motogp', preview: 'https://wallpaperaccess.com/full/134669.jpg', background: 'https://wallpaperaccess.com/full/134669.jpg' },

  // Football
  { id: 'messi', name: 'Lionel Messi', category: 'football', preview: 'https://wallpaperaccess.com/full/6208527.jpg', background: 'https://wallpaperaccess.com/full/6208527.jpg' },
  { id: 'ronaldo', name: 'Cristiano Ronaldo', category: 'football', preview: 'https://wallpaperaccess.com/full/2149295.jpg', background: 'https://wallpaperaccess.com/full/2149295.jpg' },
  { id: 'neymar', name: 'Neymar Jr', category: 'football', preview: 'https://wallpaperaccess.com/full/1852857.jpg', background: 'https://wallpaperaccess.com/full/1852857.jpg' },
  { id: 'mbappe', name: 'Kylian Mbappé', category: 'football', preview: 'https://wallpaperaccess.com/full/5254844.jpg', background: 'https://wallpaperaccess.com/full/5254844.jpg' },

  // NBA
  { id: 'lebron', name: 'LeBron James', category: 'sports', preview: 'https://wallpaperaccess.com/full/1083373.jpg', background: 'https://wallpaperaccess.com/full/1083373.jpg' },
  { id: 'kobe', name: 'Kobe Bryant', category: 'sports', preview: 'https://wallpaperaccess.com/full/137685.jpg', background: 'https://wallpaperaccess.com/full/137685.jpg' },
  { id: 'jordan', name: 'Michael Jordan', category: 'sports', preview: 'https://wallpaperaccess.com/full/116357.jpg', background: 'https://wallpaperaccess.com/full/116357.jpg' },
  { id: 'curry', name: 'Stephen Curry', category: 'sports', preview: 'https://wallpaperaccess.com/full/2628078.jpg', background: 'https://wallpaperaccess.com/full/2628078.jpg' },

  // Cars
  { id: 'supra-mk4', name: 'Toyota Supra MK4', category: 'cars', preview: 'https://wallpaperaccess.com/full/1489190.jpg', background: 'https://wallpaperaccess.com/full/1489190.jpg' },
  { id: 'gtr-r35', name: 'Nissan GTR R35', category: 'cars', preview: 'https://wallpaperaccess.com/full/1376712.jpg', background: 'https://wallpaperaccess.com/full/1376712.jpg' },
  { id: 'ferrari-f40', name: 'Ferrari F40', category: 'cars', preview: 'https://wallpaperaccess.com/full/157780.jpg', background: 'https://wallpaperaccess.com/full/157780.jpg' },
  { id: 'lamborghini', name: 'Lamborghini Aventador', category: 'cars', preview: 'https://wallpaperaccess.com/full/1267.jpg', background: 'https://wallpaperaccess.com/full/1267.jpg' },

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