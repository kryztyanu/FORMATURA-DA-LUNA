/**
 * Background audio player using the user-provided MP3 track:
 * /assets/aistudio/Curious_Little_Motion_39a99830.mp3
 * Configured with volume: 0.3 (30%) and continuous looping.
 * Implements resilient DOM audio element binding with Web Audio SFX chimes.
 */

class AudioTrackManager {
  private isPlaying: boolean = false;
  private volume: number = 0.3; // Strictly 30% volume
  private listeners: Set<(playing: boolean, vol: number) => void> = new Set();
  private sfxCtx: AudioContext | null = null;
  private boundElement: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Defer binding slightly so DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.getAudioElement());
      } else {
        this.getAudioElement();
      }
    }
  }

  /**
   * Retrieves or creates the DOM-attached audio element
   */
  public getAudioElement(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;

    if (!this.boundElement) {
      let el = document.getElementById('luna-soundtrack') as HTMLAudioElement | null;
      if (!el) {
        el = document.createElement('audio');
        el.id = 'luna-soundtrack';
        el.src = '/assets/aistudio/Curious_Little_Motion_39a99830.mp3';
        el.loop = true;
        el.preload = 'auto';
        el.setAttribute('playsinline', 'true');
        document.body.appendChild(el);
      }

      el.volume = this.volume;
      el.loop = true;

      el.addEventListener('play', () => {
        this.isPlaying = true;
        this.notify();
      });

      el.addEventListener('pause', () => {
        this.isPlaying = false;
        this.notify();
      });

      el.addEventListener('ended', () => {
        // Enforce loop in case browser loop attribute fails
        if (this.boundElement) {
          this.boundElement.currentTime = 0;
          this.boundElement.play().catch(() => {});
        }
      });

      this.boundElement = el;
      this.isPlaying = !el.paused;
    }

    return this.boundElement;
  }

  public subscribe(listener: (playing: boolean, vol: number) => void): () => void {
    this.listeners.add(listener);
    const el = this.getAudioElement();
    const active = el ? !el.paused : this.isPlaying;
    listener(active, this.volume);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const el = this.getAudioElement();
    const active = el ? !el.paused : this.isPlaying;
    this.listeners.forEach((cb) => cb(active, this.volume));
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    const el = this.getAudioElement();
    if (el) {
      el.volume = this.volume;
    }
    this.notify();
  }

  public getIsPlaying(): boolean {
    const el = this.getAudioElement();
    return el ? !el.paused : this.isPlaying;
  }

  public async start(): Promise<boolean> {
    const el = this.getAudioElement();
    if (!el) return false;

    try {
      el.volume = this.volume;
      el.loop = true;
      const playPromise = el.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
      this.isPlaying = true;
      this.notify();
      return true;
    } catch (err) {
      // Browser blocked autoplay without user gesture
      this.isPlaying = false;
      this.notify();
      return false;
    }
  }

  public stop() {
    const el = this.getAudioElement();
    if (el) {
      el.pause();
    }
    this.isPlaying = false;
    this.notify();
  }

  public toggle(): boolean {
    const el = this.getAudioElement();
    if (el && !el.paused) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  // Tactile sound effect on number toggle
  public playClickSound(isSelected: boolean) {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.sfxCtx) {
        this.sfxCtx = new AudioCtx();
      }
      if (this.sfxCtx.state === 'suspended') {
        this.sfxCtx.resume();
      }
      const now = this.sfxCtx.currentTime;
      const osc = this.sfxCtx.createOscillator();
      const gain = this.sfxCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isSelected ? 587.33 : 440.0, now);
      osc.frequency.exponentialRampToValueAtTime(isSelected ? 783.99 : 349.23, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxCtx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // ignore
    }
  }

  // Celebration chime on payment confirmed
  public playCelebrationChime() {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.sfxCtx) {
        this.sfxCtx = new AudioCtx();
      }
      if (this.sfxCtx.state === 'suspended') {
        this.sfxCtx.resume();
      }
      const notes = [440.0, 554.37, 659.25, 880.0, 1108.73];
      const now = this.sfxCtx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.sfxCtx) return;
        const noteTime = now + idx * 0.08;
        const osc = this.sfxCtx.createOscillator();
        const gain = this.sfxCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

        osc.connect(gain);
        gain.connect(this.sfxCtx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.45);
      });
    } catch {
      // ignore
    }
  }
}

export const schoolSoundtrack = new AudioTrackManager();
