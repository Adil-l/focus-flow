// Self-hosted mp3 in /public/sounds (converted from the Google Sound Library,
// CC-BY — see public/sounds/CREDITS.md). Local = reliable, offline, and plays
// on Safari/iOS, which doesn't support the Opus originals.
export const ALERT_SOUNDS: Record<string, string> = {
  sparkle: '/sounds/alert-pop.mp3',
  chime: '/sounds/alert-bell.mp3',
  bell: '/sounds/alert-bell.mp3',
  piano: '/sounds/alert-clock.mp3',
  soft: '/sounds/alert-pop.mp3',
  success: '/sounds/alert-winding.mp3',
  applause: '/sounds/alert-bugle.mp3',
  gameshow: '/sounds/alert-bugle.mp3',
  levelup: '/sounds/alert-clang.mp3',
  'level up': '/sounds/alert-clang.mp3',
  train: '/sounds/alert-winding.mp3',
  commuter: '/sounds/alert-clock.mp3',
  airport: '/sounds/alert-bell.mp3',
};

export const ALARM_URL = '/sounds/alarm.mp3';

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