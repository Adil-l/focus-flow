import { describe, it, expect } from 'vitest';
import { SOUND_CATALOG } from './useSoundMixer';

// Data-integrity tests for the sound catalog (no AudioContext needed).
describe('SOUND_CATALOG', () => {
  it('has unique ids', () => {
    const ids = SOUND_CATALOG.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('each kind carries the fields its channel needs', () => {
    for (const s of SOUND_CATALOG) {
      if (s.kind === 'url') expect(s.url, s.id).toBeTruthy();
      if (s.kind === 'noise') expect(['white', 'pink', 'brown'], s.id).toContain(s.noise);
      if (s.kind === 'binaural') {
        expect(s.beat ?? 0, s.id).toBeGreaterThan(0);
        expect(s.carrier ?? 0, s.id).toBeGreaterThan(0);
      }
    }
  });

  it('offers both free and premium sounds', () => {
    expect(SOUND_CATALOG.some(s => !s.premium)).toBe(true);
    expect(SOUND_CATALOG.some(s => s.premium)).toBe(true);
  });

  it('treats every binaural beat as premium', () => {
    SOUND_CATALOG.filter(s => s.category === 'binaural').forEach(s => {
      expect(s.premium, s.id).toBe(true);
    });
  });
});
