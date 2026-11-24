/**
 * Brasília Kart 3D — Eixo Monumental Edition
 * Procedural Web Audio API Sound & Bossa-Kart Music Synthesizer
 * Zero external audio assets required; resilient to suspended AudioContext states.
 */

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.engineGain = null;

    this.sfxMuted = false;
    this.musicPlaying = false;
    this.isInitialized = false;

    // Engine oscillator nodes
    this.engineOsc1 = null;
    this.engineOsc2 = null;
    this.engineSubOsc = null;
    this.engineFilter = null;
    this.driftNoiseGain = null;

    // Music sequencer state
    this.musicTimer = null;
    this.beatStep = 0;
    this.tempoBpm = 124; // Upbeat Bossa-Kart groove

    // Auto-unlock AudioContext on first user gesture
    this._unlockHandler = () => {
      this.ensureContext();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('pointerdown', this._unlockHandler, { once: false, passive: true });
      window.addEventListener('keydown', this._unlockHandler, { once: false, passive: true });
    }
  }

  ensureContext() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return false;
        this.ctx = new AudioCtx();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.78;
        this.masterGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = this.sfxMuted ? 0 : 0.85;
        this.sfxGain.connect(this.masterGain);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.42;
        this.musicGain.connect(this.masterGain);

        this._setupEngineNodes();
        this.isInitialized = true;
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx && this.ctx.state === 'running';
    } catch (_) {
      return false;
    }
  }

  _setupEngineNodes() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.08, now);

      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(240, now);
      this.engineFilter.Q.setValueAtTime(3.2, now);

      this.engineOsc1 = this.ctx.createOscillator();
      this.engineOsc1.type = 'sawtooth';
      this.engineOsc1.frequency.setValueAtTime(52, now);

      this.engineOsc2 = this.ctx.createOscillator();
      this.engineOsc2.type = 'triangle';
      this.engineOsc2.frequency.setValueAtTime(104, now);

      this.engineSubOsc = this.ctx.createOscillator();
      this.engineSubOsc.type = 'sine';
      this.engineSubOsc.frequency.setValueAtTime(26, now);

      const osc2Gain = this.ctx.createGain();
      osc2Gain.gain.value = 0.45;
      const subGain = this.ctx.createGain();
      subGain.gain.value = 0.55;

      this.engineOsc1.connect(this.engineFilter);
      this.engineOsc2.connect(osc2Gain);
      osc2Gain.connect(this.engineFilter);
      this.engineSubOsc.connect(subGain);
      subGain.connect(this.engineFilter);

      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.sfxGain);

      this.engineOsc1.start(now);
      this.engineOsc2.start(now);
      this.engineSubOsc.start(now);

      // Drift tire screech / spark filtered noise node
      const bufferSize = this.ctx.sampleRate * 1.5;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      this.driftFilter = this.ctx.createBiquadFilter();
      this.driftFilter.type = 'bandpass';
      this.driftFilter.frequency.setValueAtTime(1450, now);
      this.driftFilter.Q.setValueAtTime(4.5, now);

      this.driftNoiseGain = this.ctx.createGain();
      this.driftNoiseGain.gain.setValueAtTime(0.0, now);

      noiseSource.connect(this.driftFilter);
      this.driftFilter.connect(this.driftNoiseGain);
      this.driftNoiseGain.connect(this.sfxGain);
      noiseSource.start(now);
    } catch (_) {
      // Fail silently if blocked by browser autoplay policy
    }
  }

  /**
   * Smoothly updates kart engine pitch, filter harmonic grit, and drift tire screech.
   * Supports both (speedKmh, isDrifting, isBoosting) and object payload signatures.
   */
  updateEngine(speedKmh = 0, isDrifting = false, isBoosting = false) {
    if (typeof speedKmh === 'object' && speedKmh !== null) {
      const state = speedKmh;
      speedKmh = state.speedKmh ?? state.speed ?? 0;
      isDrifting = Boolean(state.isDrifting ?? state.drifting);
      isBoosting = Boolean(state.isBoosting ?? state.boosting ?? (state.boostTimer > 0));
    }

    if (!this.ctx || !this.engineOsc1 || this.ctx.state !== 'running') return;

    try {
      const now = this.ctx.currentTime;
      const absSpeed = Math.max(0, Math.min(260, Math.abs(speedKmh)));
      const speedNorm = absSpeed / 190;

      // Simulate 4-speed kart gearbox RPM curve + turbo over-rev
      const gearMod = (speedNorm * 3.2) % 1;
      const baseFreq = 46 + speedNorm * 105 + gearMod * 26 + (isBoosting ? 36 : 0) + (isDrifting ? 12 : 0);

      this.engineOsc1.frequency.setTargetAtTime(baseFreq, now, 0.05);
      this.engineOsc2.frequency.setTargetAtTime(baseFreq * 2.01, now, 0.05);
      this.engineSubOsc.frequency.setTargetAtTime(baseFreq * 0.5, now, 0.05);

      const cutoff = 180 + speedNorm * 1100 + (isBoosting ? 850 : 0) + (isDrifting ? 350 : 0);
      this.engineFilter.frequency.setTargetAtTime(cutoff, now, 0.06);

      const targetVol = this.sfxMuted ? 0 : (0.055 + Math.min(0.14, speedNorm * 0.12) + (isBoosting ? 0.04 : 0));
      this.engineGain.gain.setTargetAtTime(targetVol, now, 0.06);

      if (this.driftNoiseGain && this.driftFilter) {
        const screechVol = (isDrifting && absSpeed > 35 && !this.sfxMuted) ? 0.048 : 0.0;
        this.driftNoiseGain.gain.setTargetAtTime(screechVol, now, 0.05);
        this.driftFilter.frequency.setTargetAtTime(1250 + speedNorm * 650, now, 0.06);
      }
    } catch (_) {}
  }

  setSfxMuted(muted) {
    this.sfxMuted = Boolean(muted);
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this.sfxMuted ? 0 : 0.85, this.ctx.currentTime, 0.04);
    }
    return this.sfxMuted;
  }

  toggleSfx() {
    this.ensureContext();
    return this.setSfxMuted(!this.sfxMuted);
  }

  /**
   * Race start 3-2-1-VAI! countdown beep
   */
  playCountdownBeep(final = false) {
    if (!this.ensureContext() || this.sfxMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = final ? 'sawtooth' : 'triangle';

      const freq = final ? 880 : 440;
      const duration = final ? 0.52 : 0.2;

      osc.frequency.setValueAtTime(freq, now);
      if (final) {
        osc.frequency.exponentialRampToValueAtTime(1318.5, now + 0.14);
      }

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch (_) {}
  }

  /**
   * Turbo Pad / Cafezinho / Drift Mini-Turbo release whoosh + synth punch
   */
  playBoost() {
    if (!this.ensureContext() || this.sfxMuted) return;
    try {
      const now = this.ctx.currentTime;

      // Rising turbine synth sweep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.25);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.55);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.26, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(2200, now + 0.35);
      filter.Q.value = 1.8;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch (_) {}
  }

  /**
   * Drift spark tier charge chime (level 1 = blue, level 2 = orange, level 3 = purple ultra)
   */
  playDriftSpark(level = 1) {
    if (!this.ensureContext() || this.sfxMuted) return;
    try {
      const now = this.ctx.currentTime;
      const baseNotes = [587.33, 783.99, 1046.5]; // D5, G5, C6
      const freq = baseNotes[Math.max(0, Math.min(2, (level || 1) - 1))];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + 0.14);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch (_) {}
  }

  /**
   * Mario Kart style sparkling roulette arpeggio on item box pickup
   */
  playItemBoxPickup() {
    if (!this.ensureContext() || this.sfxMuted) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
      notes.forEach((freq, idx) => {
        const t = now + idx * 0.048;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.22, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.12);
      });
    } catch (_) {}
  }

  /**
   * Distinct sound effects for each Brasília Kart power-up item
   */
  playItemUse(itemId = 'cafezinho') {
    if (!this.ensureContext() || this.sfxMuted) return;
    try {
      const now = this.ctx.currentTime;
      const id = String(itemId).toLowerCase();

      if (id.includes('cafe') || id.includes('guarana') || id.includes('boost')) {
        this.playBoost();
        return;
      }

      if (id.includes('pequi_dourado') || id.includes('star') || id.includes('estrela')) {
        // Golden Star radiant chord fanfare
        const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5];
        chord.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.035);
          gain.gain.setValueAtTime(0.16, now + idx * 0.035);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now + idx * 0.035);
          osc.stop(now + 0.58);
        });
        return;
      }

      if (id.includes('sirene') || id.includes('ministerial') || id.includes('lightning')) {
        // Dual-tone Ministerial Siren sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.linearRampToValueAtTime(960, now + 0.18);
        osc.frequency.linearRampToValueAtTime(580, now + 0.36);
        osc.frequency.linearRampToValueAtTime(980, now + 0.54);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.62);
        return;
      }

      // Default projectile / hazard drop (Jato da Fonte or Casca de Pequi)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(720, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.22);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (_) {}
  }

  /**
   * Comedic descending wobble when slipping on a Casca de Pequi or hit by water jet
   */
  playSpinOut() {
    if (!this.ensureContext() || this.sfxMuted) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [680, 590, 510, 420, 310, 220];
      notes.forEach((freq, i) => {
        const t = now + i * 0.055;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.linearRampToValueAtTime(freq * 0.85, t + 0.05);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.065);
      });
    } catch (_) {}
  }

  /**
   * Warm architectural Bossa Major-9th discovery chord when approaching a Brasília monument
   */
  playLandmarkChime() {
    if (!this.ensureContext() || this.sfxMuted) return;
    try {
      const now = this.ctx.currentTime;
      // Fmaj9 warm Brazilian architectural chord: F4, A4, C5, E5, G5
      const chord = [349.23, 440.0, 523.25, 659.25, 783.99];
      chord.forEach((freq, idx) => {
        const t = now + idx * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.13, t + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.85);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.9);
      });
    } catch (_) {}
  }

  /**
   * Celebratory brass/synth fanfare on completing a lap around the Eixo Monumental
   */
  playLapComplete(finalLap = false) {
    if (!this.ensureContext() || this.sfxMuted) return;
    try {
      const now = this.ctx.currentTime;
      const melody = finalLap
        ? [523.25, 659.25, 783.99, 1046.5, 987.77, 1046.5, 1318.5]
        : [440, 554.37, 659.25, 880];

      melody.forEach((freq, idx) => {
        const stepDur = finalLap ? 0.11 : 0.095;
        const t = now + idx * stepDur;
        const isLast = idx === melody.length - 1;
        const noteDur = isLast ? 0.45 : stepDur * 0.9;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.24, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, t + noteDur);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + noteDur + 0.02);
      });
    } catch (_) {}
  }

  /**
   * Toggle Procedural Brasília Bossa-Kart Background Soundtrack
   */
  toggleMusic(forceState) {
    this.ensureContext();
    const nextState = typeof forceState === 'boolean' ? forceState : !this.musicPlaying;
    if (nextState === this.musicPlaying) return this.musicPlaying;

    this.musicPlaying = nextState;
    if (this.musicPlaying) {
      this._startBossaLoop();
    } else {
      this._stopBossaLoop();
    }
    return this.musicPlaying;
  }

  _startBossaLoop() {
    this._stopBossaLoop();
    this.beatStep = 0;
    const sixteenthMs = (60 / this.tempoBpm / 4) * 1000;

    this.musicTimer = setInterval(() => {
      if (!this.musicPlaying || !this.ctx || this.ctx.state !== 'running') return;
      this._playBossaStep(this.beatStep);
      this.beatStep = (this.beatStep + 1) % 64;
    }, sixteenthMs);
  }

  _stopBossaLoop() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  _playBossaStep(step) {
    try {
      const now = this.ctx.currentTime;
      const bar = Math.floor(step / 16) % 4;
      const stepInBar = step % 16;

      // 4-Bar Brasília Bossa Progression: Fmaj9 -> G13 -> Gm9 -> C13(b9)
      const progressions = [
        { root: 87.31, fifth: 130.81, chord: [349.23, 440.0, 523.25, 659.25], lead: [659.25, 783.99, 880.0, 659.25] },   // Fmaj9
        { root: 98.00, fifth: 146.83, chord: [349.23, 493.88, 587.33, 659.25], lead: [783.99, 659.25, 587.33, 493.88] },  // G13
        { root: 98.00, fifth: 146.83, chord: [349.23, 415.30, 523.25, 587.33], lead: [587.33, 698.46, 783.99, 587.33] },  // Gm9
        { root: 65.41, fifth: 98.00,  chord: [329.63, 466.16, 554.37, 659.25], lead: [659.25, 587.33, 523.25, 440.00] }   // C13
      ];
      const current = progressions[bar];

      // 1. Syncopated Surdo / Bossa Bassline (steps 0, 6, 8, 14)
      if (stepInBar === 0 || stepInBar === 6 || stepInBar === 8 || stepInBar === 14) {
        const bassFreq = (stepInBar === 0 || stepInBar === 6) ? current.root : current.fifth;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(bassFreq, now);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(now);
        osc.stop(now + 0.28);
      }

      // 2. Bossa Clave Rhodes Electric Piano Comping (steps 0, 3, 6, 10, 12)
      if (stepInBar === 0 || stepInBar === 3 || stepInBar === 6 || stepInBar === 10 || stepInBar === 12) {
        current.chord.forEach((freq) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.055, now);
          gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.22);

          osc.connect(gain);
          gain.connect(this.musicGain);
          osc.start(now);
          osc.stop(now + 0.24);
        });
      }

      // 3. Cabasa / Shaker groove on every 16th with accents
      if (stepInBar % 2 === 0 || stepInBar === 3 || stepInBar === 11) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(3400 + (stepInBar % 4) * 650, now);

        const accent = (stepInBar === 4 || stepInBar === 12) ? 0.032 : 0.015;
        gain.gain.setValueAtTime(accent, now);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.035);

        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(now);
        osc.stop(now + 0.04);
      }

      // 4. Breezy Brasília Synth-Flute Lead Melody
      if (stepInBar === 2 || stepInBar === 6 || stepInBar === 10 || stepInBar === 13) {
        const noteIdx = Math.floor(stepInBar / 4) % current.lead.length;
        const leadFreq = current.lead[noteIdx];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(leadFreq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.085, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (_) {}
  }
}

export default SoundEngine;
