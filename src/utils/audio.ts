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
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init());
      } else {
        this.init();
      }
    }
  }

  private init() {
    this.getAudioElement();
    this.setupGestureListeners();
    this.setupVisibilityListeners();
    // Immediate attempt on first page open
    this.start();

    // Polling retry on startup in case audio element is buffering or awaiting gesture
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (this.isPlaying || attempts > 25) {
        clearInterval(interval);
        return;
      }
      this.start();
    }, 200);
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
        el.setAttribute('autoplay', 'true');
        el.innerHTML = `
          <source src="/assets/aistudio/Curious_Little_Motion_39a99830.mp3" type="audio/mpeg" />
          <source src="/assets/aistudio/Curious_Little_Motion.mp3" type="audio/mpeg" />
          <source src="/Curious_Little_Motion.mp3" type="audio/mpeg" />
        `;
        document.body.appendChild(el);
      } else if (!el.src) {
        el.src = '/assets/aistudio/Curious_Little_Motion_39a99830.mp3';
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

      el.addEventListener('canplay', () => {
        if (el && el.paused) {
          this.start();
        }
      });

      el.addEventListener('loadeddata', () => {
        if (el && el.paused) {
          this.start();
        }
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

  private setupGestureListeners() {
    if (typeof window === 'undefined') return;

    const events = ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'click', 'keydown', 'mousedown', 'mouseup'];
    const handleGesture = () => {
      this.start();
      this.unlockAudioContext();
    };

    events.forEach((evt) => {
      window.addEventListener(evt, handleGesture, { capture: true, passive: true });
      document.addEventListener(evt, handleGesture, { capture: true, passive: true });
    });
  }

  private setupVisibilityListeners() {
    if (typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.start();
      }
    });

    window.addEventListener('focus', () => {
      this.start();
    });
  }

  private unlockAudioContext() {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.sfxCtx && AudioCtx) {
        this.sfxCtx = new AudioCtx();
      }
      if (this.sfxCtx && this.sfxCtx.state === 'suspended') {
        this.sfxCtx.resume().catch(() => {});
      }
    } catch {
      // ignore
    }
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

    this.unlockAudioContext();

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
    } catch {
      // Browser autoplay policy awaiting user gesture
      this.isPlaying = false;
      this.notify();
      return false;
    }
  }

  public stop() {
    // The soundtrack cannot be silenced per user instruction
    this.start();
  }

  public toggle(): boolean {
    // Cannot be silenced per user instruction - keep playing
    this.start();
    return true;
  }

  // Tactile sound effect on number toggle
  public playClickSound(isSelected: boolean) {
    try {
      this.unlockAudioContext();
      if (!this.sfxCtx) return;
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
      this.unlockAudioContext();
      if (!this.sfxCtx) return;
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
