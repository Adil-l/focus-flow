import { describe, it, expect } from 'vitest';
import { THEMES, isThemePremium } from './themes';

describe('THEMES', () => {
  it('has unique ids', () => {
    const ids = THEMES.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('marks image-content categories as Plus and generated ones as free', () => {
    const gradient = THEMES.find(t => t.category === 'gradient');
    const minimal = THEMES.find(t => t.category === 'minimal');
    const anime = THEMES.find(t => t.category === 'anime');
    const cars = THEMES.find(t => t.category === 'cars');

    expect(gradient && isThemePremium(gradient)).toBe(false);
    expect(minimal && isThemePremium(minimal)).toBe(false);
    expect(anime && isThemePremium(anime)).toBe(true);
    expect(cars && isThemePremium(cars)).toBe(true);
  });
});
