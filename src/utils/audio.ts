/**
 * Web Audio API synthesizer for the school-themed background soundtrack
 * Initial volume set to exactly 30% (0.30) as required.
 */

class SchoolSoundtrackManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private currentStep: number = 0;
  private timerId: number | null = null;
  private volume: number = 0.3; // Exactly 30% default volume
  private listeners: Set<(playing: boolean, vol: number) => void> = new Set();

  // Joyful, school-bell / marimba pentatonic notes (in Hz)
  private readonly notes: number[] = [
    261.63, // C4
    293.66, // D4
    329.63, // E4
    392.00, // G4
    440.00, // A4
    523.25, // C5
    587.33, // D5
    659.25, // E5
  ];

  // Cheerful elementary school melody pattern (steps)
  private readonly melodyPattern: number[] = [
    0, 2, 3, 5, 4, 3, 2, 0,
    1, 3, 4, 6, 5, 4, 3, 1,
    2, 4, 5, 7, 6, 5, 4, 2,
    3, 5, 4, 2, 1, 2, 0, -1,
  ];

  // Cheerful bassline harmony
  private readonly bassPattern: number[] = [
    130.81, 130.81, 196.00, 196.00, // C3, G3
    164.81, 164.81, 220.00, 220.00, // E3, A3
    174.61, 174.61, 220.00, 220.00, // F3, A3
    196.00, 196.00, 130.81, 130.81, // G3, C3
  ];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public subscribe(listener: (playing: boolean, vol: number) => void): () => void {
    this.listeners.add(listener);
    listener(this.isPlaying, this.volume);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.isPlaying, this.volume));
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    this.notify();
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public async start(): Promise<boolean> {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return false;

      this.isPlaying = true;
      this.notify();

      if (this.timerId !== null) {
        window.clearInterval(this.timerId);
      }

      // Step tempo: ~160ms per note (joyful school tempo)
      this.timerId = window.setInterval(() => {
        this.playMelodyStep();
      }, 180);

      return true;
    } catch (e) {
      console.warn('Audio autoplay restrictions:', e);
      this.isPlaying = false;
      this.notify();
      return false;
    }
  }

  public stop() {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isPlaying = false;
    this.notify();
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  private playMelodyStep() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;

    const step = this.currentStep % this.melodyPattern.length;
    const noteIdx = this.melodyPattern[step];
    const now = this.ctx.currentTime;

    // Play melody marimba / glockenspiel note
    if (noteIdx >= 0 && noteIdx < this.notes.length) {
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      // Sine + soft triangle creates warm wooden toy / marimba timbre
      osc.type = step % 4 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(this.notes[noteIdx], now);

      // Fast percussive attack, sweet bell decay
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.22, now + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.4);
    }

    // Play bass / accompaniment note every 2 steps
    if (step % 2 === 0) {
      const bassIdx = Math.floor(step / 2) % this.bassPattern.length;
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();

      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(this.bassPattern[bassIdx], now);

      bassGain.gain.setValueAtTime(0.001, now);
      bassGain.gain.linearRampToValueAtTime(0.12, now + 0.03);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      bassOsc.connect(bassGain);
      bassGain.connect(this.masterGain);

      bassOsc.start(now);
      bassOsc.stop(now + 0.55);
    }

    this.currentStep++;
  }

  // Sound effect for button click
  public playClickSound(isSelected: boolean) {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isSelected ? 523.25 : 392.00, now);
      osc.frequency.exponentialRampToValueAtTime(isSelected ? 659.25 : 329.63, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // ignore
    }
  }

  // Sound effect for successful payment
  public playCelebrationChime() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const notes = [392.00, 523.25, 659.25, 783.99, 1046.50];
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const noteTime = now + idx * 0.09;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(0.2, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteTime);
        osc.stop(noteTime + 0.45);
      });
    } catch {
      // ignore
    }
  }
}

export const schoolSoundtrack = new SchoolSoundtrackManager();
