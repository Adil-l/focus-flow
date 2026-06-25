// Google Sound Library (CC-BY): stable, CDN-backed, served with
// `access-control-allow-origin: *` and `audio/ogg`. Replaces the dead
// freesound.org preview URLs that were 404-ing.
const G = 'https://actions.google.com/sounds/v1/';

export const ALERT_SOUNDS: Record<string, string> = {
  sparkle: `${G}cartoon/pop.ogg`,
  chime: `${G}alarms/medium_bell_ringing_near.ogg`,
  bell: `${G}alarms/medium_bell_ringing_near.ogg`,
  piano: `${G}alarms/mechanical_clock_ring.ogg`,
  soft: `${G}cartoon/pop.ogg`,
  success: `${G}alarms/winding_alarm_clock.ogg`,
  applause: `${G}alarms/bugle_tune.ogg`,
  gameshow: `${G}alarms/bugle_tune.ogg`,
  levelup: `${G}cartoon/clang_and_wobble.ogg`,
  'level up': `${G}cartoon/clang_and_wobble.ogg`,
  train: `${G}alarms/winding_alarm_clock.ogg`,
  commuter: `${G}alarms/mechanical_clock_ring.ogg`,
  airport: `${G}alarms/medium_bell_ringing_near.ogg`,
};

export const ALARM_URL = `${G}alarms/alarm_clock.ogg`;

type AudioContextConstructor = typeof AudioContext;

interface WindowWithWebkitAudioContext extends Window {
  webkitAudioContext?: AudioContextConstructor;
}

class SoundManager {
  private static instance: SoundManager;
  private ctx: AudioContext | null = null;
  private audios: Map<string, HTMLAudioElement> = new Map();
  private masterGain: GainNode | null = null;

  private constructor() {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      this.initContext();

      if (this.ctx?.state === 'suspended') {
        void this.ctx.resume();
      }
    };

    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
  }

  static getInstance() {
    if (!SoundManager.instance) SoundManager.instance = new SoundManager();
    return SoundManager.instance;
  }

  private initContext() {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const audioWindow = window as WindowWithWebkitAudioContext;
      const AudioContextClass = window.AudioContext ?? audioWindow.webkitAudioContext;

      if (!AudioContextClass) {
        return null;
      }

      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
    }

    return this.ctx;
  }

  play(url: string, volume: number = 1.0, loop: boolean = false) {
    if (typeof Audio === 'undefined') return;

    this.initContext();

    let audio = this.audios.get(url);
    if (!audio) {
      audio = new Audio(url);
      this.audios.set(url, audio);
    }

    audio.loop = loop;
    audio.currentTime = 0;
    audio.volume = Math.max(0, Math.min(1, volume));
    void audio.play().catch(() => {});
  }

  stop(url: string) {
    const audio = this.audios.get(url);

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }
}

export const soundManager = SoundManager.getInstance();