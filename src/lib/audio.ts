export const ALERT_SOUNDS: Record<string, string> = {
  sparkle: 'https://cdn.freesound.org/previews/562/562473_12157643-lq.mp3',
  chime: 'https://cdn.freesound.org/previews/243/243763_4413348-lq.mp3',
  piano: 'https://cdn.freesound.org/previews/446/446115_8286060-lq.mp3',
  applause: 'https://cdn.freesound.org/previews/403/403013_7619864-lq.mp3',
  success: 'https://cdn.freesound.org/previews/562/562473_12157643-lq.mp3',
  bell: 'https://cdn.freesound.org/previews/243/243763_4413348-lq.mp3',
  'level up': 'https://cdn.freesound.org/previews/341/341695_6075239-lq.mp3',
};

export const ALARM_URL = 'https://cdn.freesound.org/previews/274/274775_5250485-lq.mp3';

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