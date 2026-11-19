// 8-bit Retro Audio Synthesizer for Super Mario Web Game
class RetroAudio {
  constructor() {
    this.ctx = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.muted = false;
    this.musicPlaying = false;
    this.currentMusicTimeout = null;
    this.musicNotes = [
      // Melody: [note, duration in 16th notes] (tempo ~ 100 bpm, 16th note = 150ms)
      // Intro
      ['E5', 1], ['E5', 1], [null, 1], ['E5', 1], [null, 1], ['C5', 1], ['E5', 2],
      ['G5', 2], [null, 2], ['G4', 2], [null, 2],
      
      // Part A
      ['C5', 2], [null, 1], ['G4', 2], [null, 1], ['E4', 2],
      [null, 1], ['A4', 2], ['B4', 2], ['A#4', 1], ['A4', 2],
      ['G4', 1.33], ['E5', 1.33], ['G5', 1.33], ['A5', 2], ['F5', 1], ['G5', 1],
      [null, 1], ['E5', 2], ['C5', 1], ['D5', 1], ['B4', 2], [null, 1],
      
      // Repeat Part A
      ['C5', 2], [null, 1], ['G4', 2], [null, 1], ['E4', 2],
      [null, 1], ['A4', 2], ['B4', 2], ['A#4', 1], ['A4', 2],
      ['G4', 1.33], ['E5', 1.33], ['G5', 1.33], ['A5', 2], ['F5', 1], ['G5', 1],
      [null, 1], ['E5', 2], ['C5', 1], ['D5', 1], ['B4', 2], [null, 2],

      // Part B (Triplets & Arpeggio)
      [null, 1], ['G5', 1], ['F#5', 1], ['F5', 1], ['D#5', 2], ['E5', 2],
      [null, 1], ['G#4', 1], ['A4', 1], ['C5', 1], [null, 1], ['A4', 1], ['C5', 1], ['D5', 1],
      [null, 1], ['G5', 1], ['F#5', 1], ['F5', 1], ['D#5', 2], ['E5', 2],
      [null, 1], ['C6', 2], ['C6', 1], ['C6', 3], [null, 2]
    ];
    this.musicIndex = 0;
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.25;
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.18;
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.45;
    this.sfxGain.connect(this.masterGain);
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.25, this.ctx.currentTime);
    }
    return this.muted;
  }

  noteToFreq(note) {
    if (!note) return 0;
    const notes = {
      'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
      'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
      'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46,
      'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
      'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'G6': 1567.98
    };
    return notes[note] || 440;
  }

  playTone(freq, type, duration, gainLevel = 1.0, startTime = null) {
    if (!this.ctx || this.muted || freq <= 0) return;
    const now = startTime !== null ? startTime : this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(gainLevel, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  jump() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.18);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  coin() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    this.playTone(987.77, 'square', 0.08, 0.5, now);       // B5
    this.playTone(1318.51, 'square', 0.28, 0.5, now + 0.08); // E6
  }

  stomp() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  bump() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    this.playTone(130, 'square', 0.08, 0.4, now);
  }

  breakBlock() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;
    // Noise burst simulation
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;

    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  powerupAppear() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;
    const notes = [330, 392, 659, 523, 587, 784];
    const now = this.ctx.currentTime;
    notes.forEach((freq, i) => {
      this.playTone(freq, 'square', 0.06, 0.35, now + i * 0.05);
    });
  }

  powerup() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;
    const notes = [330, 392, 659, 523, 587, 784, 880, 1046];
    const now = this.ctx.currentTime;
    notes.forEach((freq, i) => {
      this.playTone(freq, 'square', 0.08, 0.4, now + i * 0.06);
    });
  }

  pipe() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      this.playTone(180 - i * 20, 'square', 0.06, 0.4, now + i * 0.05);
    }
  }

  die() {
    this.stopMusic();
    this.ensureContext();
    if (!this.ctx || this.muted) return;
    const notes = [
      { f: 500, d: 0.12 },
      { f: 450, d: 0.12 },
      { f: 400, d: 0.12 },
      { f: 300, d: 0.18 },
      { f: 200, d: 0.3 }
    ];
    let time = this.ctx.currentTime;
    notes.forEach(n => {
      this.playTone(n.f, 'triangle', n.d, 0.6, time);
      time += n.d * 0.9;
    });
  }

  stageClear() {
    this.stopMusic();
    this.ensureContext();
    if (!this.ctx || this.muted) return;
    const notes = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.12 }, // E5
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.50, d: 0.2 }, // C6
      { f: 880.00, d: 0.15 }, // A5
      { f: 1046.50, d: 0.4 }  // C6
    ];
    let time = this.ctx.currentTime;
    notes.forEach(n => {
      this.playTone(n.f, 'square', n.d, 0.5, time);
      time += n.d * 1.1;
    });
  }

  startMusic() {
    if (this.musicPlaying) return;
    this.ensureContext();
    this.musicPlaying = true;
    this.musicIndex = 0;
    this.playNextMusicNote();
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.currentMusicTimeout) {
      clearTimeout(this.currentMusicTimeout);
      this.currentMusicTimeout = null;
    }
  }

  playNextMusicNote() {
    if (!this.musicPlaying || !this.ctx) return;
    const item = this.musicNotes[this.musicIndex];
    const sixteenthDuration = 0.14; // seconds per 16th note
    const noteDuration = item[1] * sixteenthDuration;

    if (item[0] && !this.muted) {
      const freq = this.noteToFreq(item[0]);
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + noteDuration * 0.85);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + noteDuration * 0.9);
    }

    this.musicIndex = (this.musicIndex + 1) % this.musicNotes.length;
    this.currentMusicTimeout = setTimeout(() => {
      this.playNextMusicNote();
    }, noteDuration * 1000);
  }
}

window.RetroAudio = RetroAudio;
