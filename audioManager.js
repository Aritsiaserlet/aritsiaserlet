// audioManager.js
// Procedural chiptune audio engine using Web Audio API
// No audio files needed — 100% GitHub Pages compatible

let audioCtx = null;
let masterGain = null;
let musicGain = null;
let sfxGain = null;

let musicOscillators = [];
let musicIsPlaying = false;
let musicScheduleTimeout = null;

// ── Volume state from settings
let volumes = { master: 1.0, music: 1.0, sfx: 1.0, mute: false };

// ── Initialize Audio Context (must be after user gesture)
function ensureContext() {
  if (audioCtx) return true;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    masterGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);

    musicGain = audioCtx.createGain();
    musicGain.connect(masterGain);

    sfxGain = audioCtx.createGain();
    sfxGain.connect(masterGain);

    applyVolumes();
    return true;
  } catch (e) {
    console.warn('Web Audio API not supported', e);
    return false;
  }
}

function applyVolumes() {
  if (!masterGain) return;
  const mute = volumes.mute ? 0 : 1;
  masterGain.gain.setTargetAtTime(volumes.master * mute, audioCtx.currentTime, 0.05);
  musicGain.gain.setTargetAtTime(volumes.music, audioCtx.currentTime, 0.05);
  sfxGain.gain.setTargetAtTime(volumes.sfx, audioCtx.currentTime, 0.05);
}

// ── Export: update volumes from Settings UI
export function setVolumes({ master, music, sfx, mute }) {
  if (master !== undefined) volumes.master = master / 100;
  if (music  !== undefined) volumes.music  = music  / 100;
  if (sfx    !== undefined) volumes.sfx    = sfx    / 100;
  if (mute   !== undefined) volumes.mute   = mute;
  applyVolumes();
}

// ─────────────────────────────────────────
// ── SFX: Low-level tone helper
// ─────────────────────────────────────────
function playTone({ freq = 440, type = 'square', duration = 0.1, volume = 0.3, startFreq, freqDecay = 0, delay = 0 } = {}) {
  if (!ensureContext()) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const t = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(startFreq || freq, t);
  if (freqDecay) osc.frequency.exponentialRampToValueAtTime(freq, t + duration);

  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc.connect(gain);
  gain.connect(sfxGain);
  osc.start(t);
  osc.stop(t + duration + 0.01);
}

// ─────────────────────────────────────────
// ── SFX Library — Chiptune style
// ─────────────────────────────────────────

export function sfxHit() {
  // Punchy square hit
  playTone({ freq: 120, startFreq: 280, type: 'square', duration: 0.12, volume: 0.45, freqDecay: true });
  playTone({ freq: 60,  startFreq: 120, type: 'square', duration: 0.18, volume: 0.25, freqDecay: true, delay: 0.02 });
}

export function sfxScore() {
  // Rising arpeggio 2-note
  playTone({ freq: 660, type: 'square', duration: 0.07, volume: 0.3 });
  playTone({ freq: 880, type: 'square', duration: 0.07, volume: 0.3, delay: 0.08 });
}

export function sfxCombo() {
  // Triple rising arpeggio for combo/multiplier
  playTone({ freq: 523, type: 'square', duration: 0.07, volume: 0.35 });
  playTone({ freq: 659, type: 'square', duration: 0.07, volume: 0.35, delay: 0.07 });
  playTone({ freq: 784, type: 'square', duration: 0.10, volume: 0.40, delay: 0.14 });
}

export function sfxBoost() {
  // Boost activation — rising sweep + high note
  playTone({ freq: 1046, startFreq: 300, type: 'sawtooth', duration: 0.2, volume: 0.4, freqDecay: true });
  playTone({ freq: 1318, type: 'square', duration: 0.12, volume: 0.3, delay: 0.18 });
}

export function sfxMiss() {
  // Low descending thud for miss/penalty
  playTone({ freq: 60, startFreq: 180, type: 'square', duration: 0.25, volume: 0.4, freqDecay: true });
}

export function sfxGameOver() {
  // Classic descending 4-note game-over jingle
  const notes = [523, 415, 330, 262];
  notes.forEach((freq, i) => {
    playTone({ freq, type: 'square', duration: 0.18, volume: 0.4, delay: i * 0.18 });
  });
}

export function sfxDive() {
  // Whoosh downward
  playTone({ freq: 100, startFreq: 600, type: 'sawtooth', duration: 0.15, volume: 0.25, freqDecay: true });
}

export function sfxLike() {
  // Cheerful pop for liking a work
  playTone({ freq: 880, type: 'sine', duration: 0.08, volume: 0.3 });
  playTone({ freq: 1100, type: 'sine', duration: 0.12, volume: 0.3, delay: 0.07 });
}

export function sfxLogin() {
  // Login confirmation chime
  playTone({ freq: 440,  type: 'triangle', duration: 0.1,  volume: 0.25 });
  playTone({ freq: 660,  type: 'triangle', duration: 0.1,  volume: 0.25, delay: 0.1 });
  playTone({ freq: 880,  type: 'triangle', duration: 0.15, volume: 0.25, delay: 0.2 });
}

// ─────────────────────────────────────────
// ── BGM — Procedural chiptune loop
// ─────────────────────────────────────────
// Simple 8-bar looping melody using 2 voices
const BPM = 128;
const BEAT = 60 / BPM;
const BAR  = BEAT * 4;

const melody = [
  // Bar 1
  { freq: 523, dur: 0.5 }, { freq: 659, dur: 0.25 }, { freq: 784, dur: 0.25 },
  { freq: 880, dur: 0.5 }, { freq: 784, dur: 0.5 },
  // Bar 2
  { freq: 698, dur: 0.5 }, { freq: 587, dur: 0.5 }, { freq: 523, dur: 1.0 },
  // Bar 3
  { freq: 494, dur: 0.5 }, { freq: 587, dur: 0.25 }, { freq: 659, dur: 0.25 },
  { freq: 784, dur: 0.5 }, { freq: 880, dur: 0.5 },
  // Bar 4
  { freq: 1046, dur: 1.0 }, { freq: 784, dur: 1.0 },
];

const bassline = [
  262, 262, 196, 220,
  175, 196, 262, 262,
  220, 220, 196, 196,
  131, 131, 196, 262,
];

function scheduleMusicLoop() {
  if (!musicIsPlaying || !audioCtx) return;

  let t = audioCtx.currentTime + 0.05;

  // ── Melody voice
  for (const note of melody) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(note.freq, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + note.dur * BEAT * 0.9);
    osc.connect(gain);
    gain.connect(musicGain);
    osc.start(t);
    osc.stop(t + note.dur * BEAT + 0.01);
    t += note.dur * BEAT;
  }

  // ── Bass voice (one note per beat across 4 bars)
  const bassStart = audioCtx.currentTime + 0.05;
  for (let i = 0; i < bassline.length; i++) {
    const bt = bassStart + i * BEAT;
    const bosc = audioCtx.createOscillator();
    const bgain = audioCtx.createGain();
    bosc.type = 'square';
    bosc.frequency.setValueAtTime(bassline[i], bt);
    bgain.gain.setValueAtTime(0, bt);
    bgain.gain.linearRampToValueAtTime(0.12, bt + 0.01);
    bgain.gain.exponentialRampToValueAtTime(0.0001, bt + BEAT * 0.85);
    bosc.connect(bgain);
    bgain.connect(musicGain);
    bosc.start(bt);
    bosc.stop(bt + BEAT + 0.01);
  }

  // Schedule the next loop iteration
  const loopDuration = bassline.length * BEAT;
  musicScheduleTimeout = setTimeout(scheduleMusicLoop, (loopDuration - 0.3) * 1000);
}

export function startBGM() {
  if (!ensureContext()) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  if (musicIsPlaying) return;
  musicIsPlaying = true;
  scheduleMusicLoop();
}

export function stopBGM() {
  musicIsPlaying = false;
  if (musicScheduleTimeout) clearTimeout(musicScheduleTimeout);
}

export function toggleBGM() {
  if (musicIsPlaying) stopBGM();
  else startBGM();
  return musicIsPlaying;
}
