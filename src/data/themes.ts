export interface Theme {
  id: string;
  name: string;
  category: 'gradient' | 'nature' | 'lofi' | 'cafe' | 'minimal' | 'space';
  preview: string; // CSS gradient or image preview
  background: string; // CSS background value
  isPremium: boolean;
}

export const THEMES: Theme[] = [
  // Gradients (free)
  { id: 'aura-twilight', name: 'Aura Twilight', category: 'gradient', isPremium: false, preview: 'linear-gradient(135deg, hsl(280 70% 25%), hsl(310 60% 35%), hsl(340 50% 40%))', background: '' },
  { id: 'lava-lamp', name: 'Lava Lamp', category: 'gradient', isPremium: false, preview: 'linear-gradient(135deg, #ff6b35, #f7c59f, #efa8c8)', background: '' },
  { id: 'minimal-black', name: 'Minimalist Black', category: 'minimal', isPremium: false, preview: 'linear-gradient(135deg, #0a0a0a, #1a1a1a)', background: '' },
  { id: 'dark-purple', name: 'Dark Purple Heart', category: 'gradient', isPremium: false, preview: 'linear-gradient(135deg, #2d1b69, #6b3fa0, #9b59b6)', background: '' },
  { id: 'sakura', name: 'Sakura', category: 'gradient', isPremium: false, preview: 'linear-gradient(135deg, #fce4ec, #f8bbd0, #f48fb1)', background: '' },
  { id: 'ocean-blue', name: 'Ocean Blue', category: 'gradient', isPremium: false, preview: 'linear-gradient(135deg, #0d47a1, #1565c0, #42a5f5)', background: '' },

  // Nature (real images)
  { id: 'mountain-lake', name: 'Mountain Lake', category: 'nature', isPremium: false, preview: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', background: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=85' },
  { id: 'forest-path', name: 'Forest Path', category: 'nature', isPremium: false, preview: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80', background: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=85' },
  { id: 'sunset-clouds', name: 'Sunset Clouds', category: 'nature', isPremium: false, preview: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=400&q=80', background: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1920&q=85' },
  { id: 'rainy-window', name: 'Rainy Window', category: 'nature', isPremium: true, preview: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=400&q=80', background: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1920&q=85' },
  { id: 'northern-lights', name: 'Northern Lights', category: 'nature', isPremium: true, preview: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=400&q=80', background: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=1920&q=85' },
  { id: 'cherry-blossoms', name: 'Cherry Blossoms', category: 'nature', isPremium: true, preview: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400&q=80', background: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&q=85' },

  // Lofi / Cozy
  { id: 'lofi-desk', name: 'Lofi Study', category: 'lofi', isPremium: false, preview: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=80', background: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&q=85' },
  { id: 'cozy-room', name: 'Cozy Room', category: 'lofi', isPremium: true, preview: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80', background: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=85' },
  { id: 'night-city', name: 'Night City', category: 'lofi', isPremium: true, preview: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&q=80', background: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&q=85' },

  // Café
  { id: 'paris-cafe', name: 'Paris Café', category: 'cafe', isPremium: false, preview: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80', background: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1920&q=85' },
  { id: 'cozy-cafe', name: 'Cozy Café', category: 'cafe', isPremium: true, preview: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400&q=80', background: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1920&q=85' },
  { id: 'bookstore-cafe', name: 'Bookstore Café', category: 'cafe', isPremium: true, preview: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&q=80', background: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1920&q=85' },

  // Space
  { id: 'deep-space', name: 'Deep Space', category: 'space', isPremium: false, preview: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&q=80', background: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=85' },
  { id: 'nebula', name: 'Nebula', category: 'space', isPremium: true, preview: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80', background: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=85' },
];

export const THEME_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'gradient', label: 'Gradients' },
  { id: 'nature', label: 'Nature' },
  { id: 'lofi', label: 'Lofi' },
  { id: 'cafe', label: 'Café' },
  { id: 'space', label: 'Space' },
  { id: 'minimal', label: 'Minimal' },
];
