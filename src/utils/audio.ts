/**
 * Web Audio API synthesizer for the school-themed background soundtrack
 * Joyful, dynamic, upbeat children's school graduation melody.
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

  // Vibrant, cheerful pentatonic + diatonic frequencies (Glockenspiel, Marimba, Music Box)
  private readonly notes: number[] = [
    261.63, // 0: C4
    293.66, // 1: D4
    329.63, // 2: E4
    349.23, // 3: F4
    392.00, // 4: G4
    440.00, // 5: A4
    493.88, // 6: B4
    523.25, // 7: C5
    587.33, // 8: D5
    659.25, // 9: E5
    698.46, // 10: F5
    783.99, // 11: G5
    880.00, // 12: A5
  ];

  // Upbeat, lively and dynamic children's celebration theme (32-step cheerful school motif)
  private readonly melodyPattern: number[] = [
    // Phrase 1: Joyful call & response
    7,  9,  11, 7,  9,  7,  4,  2,
    7,  9,  11, 12, 11, 9,  7,  4,
    // Phrase 2: Bouncy, energetic celebration
    5,  7,  9,  11, 9,  7,  5,  4,
    2,  4,  7,  9,  7,  4,  7,  -1,
  ];

  // Bright, bouncy bass root movement (staccato pizzicato style)
  private readonly bassPattern: number[] = [
    130.81, 130.81, 196.00, 196.00, // C3, G3
    174.61, 174.61, 220.00, 220.00, // F3, A3
    164.81, 164.81, 196.00, 196.00, // E3, G3
    196.00, 246.94, 261.63, 261.63, // G3, B3, C4
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

      // Upbeat tempo: 155ms per step (lively, dynamic tempo ~96-100 BPM swing)
      this.timerId = window.setInterval(() => {
        this.playMelodyStep();
      }, 155);

      return true;
    } catch (e) {
      console.warn('Audio autoplay restriction handled:', e);
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

    // Play melody: bright glockenspiel / marimba with bell overtones
    if (noteIdx >= 0 && noteIdx < this.notes.length) {
      const freq = this.notes[noteIdx];

      // Primary tone (triangle for warm roundness)
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.24, now + 0.015);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.35);

      // Bell chime overtone for festive children's celebration atmosphere
      const overtoneOsc = this.ctx.createOscillator();
      const overtoneGain = this.ctx.createGain();

      overtoneOsc.type = 'sine';
      overtoneOsc.frequency.setValueAtTime(freq * 2, now); // Octave overtone

      overtoneGain.gain.setValueAtTime(0.001, now);
      overtoneGain.gain.linearRampToValueAtTime(0.08, now + 0.01);
      overtoneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      overtoneOsc.connect(overtoneGain);
      overtoneGain.connect(this.masterGain);

      overtoneOsc.start(now);
      overtoneOsc.stop(now + 0.22);
    }

    // Play rhythmic accompaniment bass / cute school toy click
    if (step % 2 === 0) {
      const bassIdx = Math.floor(step / 2) % this.bassPattern.length;
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();

      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(this.bassPattern[bassIdx], now);

      bassGain.gain.setValueAtTime(0.001, now);
      bassGain.gain.linearRampToValueAtTime(0.14, now + 0.02);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      bassOsc.connect(bassGain);
      bassGain.connect(this.masterGain);

      bassOsc.start(now);
      bassOsc.stop(now + 0.38);
    }

    // Gentle percussion tap every 4 steps (woodblock click)
    if (step % 4 === 0) {
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();

      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(987.77, now); // B5 woodblock pitch
      clickOsc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

      clickGain.gain.setValueAtTime(0.04, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      clickOsc.connect(clickGain);
      clickGain.connect(this.masterGain);

      clickOsc.start(now);
      clickOsc.stop(now + 0.06);
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
      osc.frequency.setValueAtTime(isSelected ? 587.33 : 440.00, now);
      osc.frequency.exponentialRampToValueAtTime(isSelected ? 783.99 : 349.23, now + 0.08);

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

  // Sound effect for celebrations
  public playCelebrationChime() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const notes = [440.00, 554.37, 659.25, 880.00, 1108.73];
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const noteTime = now + idx * 0.08;
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
