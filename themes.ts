export interface Theme {
  id: string;
  name: string;
  category: 'gradient' | 'ambient-world' | 'minimal' | 'animated' | 'special';
  preview: string; // CSS gradient or image preview
  background: string; // CSS background value or video URL
  isPremium: boolean;
  isAnimated?: boolean;
}

export const THEMES: Theme[] = [
  // Gradients & Colors
  { id: 'aura-twilight', name: 'Aura Twilight', category: 'gradient', isPremium: false, preview: 'linear-gradient(135deg, hsl(280 70% 25%), hsl(310 60% 35%), hsl(340 50% 40%))', background: '' },
  { id: 'peach-aura-heart', name: 'Peach Aura Heart', category: 'gradient', isPremium: true, preview: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', background: '' },
  { id: 'light-pink-heart', name: 'Light Pink Heart', category: 'gradient', isPremium: false, preview: 'linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%)', background: '' },
  { id: 'flare', name: 'Flare', category: 'animated', isPremium: false, isAnimated: true, preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', background: '' },
  { id: 'lava-lamp', name: 'Lava Lamp', category: 'animated', isPremium: true, isAnimated: true, preview: 'linear-gradient(135deg, #ff6b35, #f7c59f, #efa8c8)', background: '' },
  { id: 'minimalist-black', name: 'Minimalist Black', category: 'minimal', isPremium: false, preview: 'linear-gradient(135deg, #0a0a0a, #1a1a1a)', background: '' },

  // Ambient Worlds
  { id: 'rainy-lofi-cafe', name: 'Rainy Lofi Cafe', category: 'ambient-world', isPremium: false, isAnimated: true, preview: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=400&q=80', background: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1920&q=85' },
  { id: 'countryside-morning', name: 'Countryside Morning', category: 'ambient-world', isPremium: false, preview: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80', background: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=85' },
  { id: 'toto-forest', name: 'Toto Forest', category: 'ambient-world', isPremium: false, preview: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80', background: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=85' },
  { id: 'lofi-clouds', name: 'Lofi Clouds', category: 'ambient-world', isPremium: true, isAnimated: true, preview: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=400&q=80', background: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1920&q=85' },
  { id: 'flickering-fireplace', name: 'Flickering Fireplace', category: 'ambient-world', isPremium: true, isAnimated: true, preview: 'https://images.unsplash.com/photo-1544253049-335193988f01?w=400&q=80', background: 'https://images.unsplash.com/photo-1544253049-335193988f01?w=1920&q=85' },
  { id: 'dusk-peak', name: 'Dusk Peak', category: 'ambient-world', isPremium: true, preview: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80', background: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=85' },
  { id: 'tuscan-village', name: 'Tuscan Village', category: 'ambient-world', isPremium: true, preview: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=400&q=80', background: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=1920&q=85' },
  { id: 'forest-retreat', name: 'Forest Retreat', category: 'ambient-world', isPremium: true, preview: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80', background: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=85' },
];

export const THEME_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'gradient', label: 'Gradients & Colors' },
  { id: 'ambient-world', label: 'Ambient Worlds' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'animated', label: 'Animated' },
];
