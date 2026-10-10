/**
 * Motor de Audio y Efectos Sonoros mediante Web Audio API
 */
class AudioManager {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = true;
    this.loadPreference();
  }

  loadPreference() {
    const saved = localStorage.getItem('dante_sound_enabled');
    if (saved !== null) {
      this.soundEnabled = saved === 'true';
    }
  }

  savePreference() {
    localStorage.setItem('dante_sound_enabled', this.soundEnabled.toString());
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playNoteFreq(freq, duration = 0.3, type = 'sine', gainVal = 0.2) {
    if (!this.soundEnabled) return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  playSuccess() {
    this.playNoteFreq(587.33, 0.25, 'triangle', 0.25); // D5
    setTimeout(() => {
      this.playNoteFreq(880, 0.3, 'triangle', 0.25); // A5
    }, 120);
  }

  playClick() {
    this.playNoteFreq(329.63, 0.08, 'sine', 0.15); // E4
  }

  playError() {
    this.playNoteFreq(150, 0.3, 'sawtooth', 0.2);
  }

  playSound(type) {
    if (!this.soundEnabled) return;
    if (type === 'success') this.playSuccess();
    else if (type === 'click') this.playClick();
    else if (type === 'error') this.playError();
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.savePreference();
    if (this.soundEnabled) {
      this.playSound('click');
    }
    return this.soundEnabled;
  }

  isSoundEnabled() {
    return this.soundEnabled;
  }
}

export const audioManager = new AudioManager();
