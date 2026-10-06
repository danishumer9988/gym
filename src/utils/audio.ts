// Web Audio synthesizer for rest timer chime and set completion without external MP3 assets

class SoundEngine {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep(frequency: number = 660, durationMs: number = 120, type: OscillatorType = 'sine') {
    try {
      this.initCtx();
      if (!this.ctx) return;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (durationMs / 1000));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + (durationMs / 1000));
    } catch {
      // Audio context disabled or not permitted yet
    }
  }

  playTimerFinishedChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [587.33, 739.99, 880, 1174.66]; // D5, F#5, A5, D6 celebratory arpeggio
      notes.forEach((freq, i) => {
        setTimeout(() => {
          this.playBeep(freq, 220, 'triangle');
        }, i * 90);
      });
    } catch {
      // ignore
    }
  }

  playSetChecked() {
    this.playBeep(880, 80, 'sine');
  }

  playCountdownTick() {
    this.playBeep(440, 60, 'sine');
  }
}

export const sound = new SoundEngine();

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' = 'light') => {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      if (type === 'light') {
        navigator.vibrate(15);
      } else if (type === 'medium') {
        navigator.vibrate(35);
      } else if (type === 'heavy') {
        navigator.vibrate(60);
      } else if (type === 'success') {
        navigator.vibrate([30, 40, 80]);
      }
    } catch {
      // ignore if permissions or environment restrict vibrate
    }
  }
};
