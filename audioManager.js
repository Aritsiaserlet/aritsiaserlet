// audioManager.js
// File-based audio engine — plays sounds from URLs stored in settings.json
// Sounds are assigned via Admin Panel → Sounds Library

let audioCtx = null;
let masterGain = null;
let musicGain = null;
let sfxGain = null;

let musicAudio = null; // HTMLAudioElement for BGM
let musicIsPlaying = false;

// ── Volume state
let volumes = { master: 1.0, music: 1.0, sfx: 1.0, masterMute: false, musicMute: false, sfxMute: false };

// ── Sound URL cache (loaded from settings.json)
// Keys match the soundAssignments keys in settings.json
let soundUrls = {};

// ── Load sound assignments from settings.json
export async function loadSoundAssignments() {
  try {
    const GH_USER = 'Aritsiaserlet';
    const GH_REPO = 'aritsiaserlet';
    const r = await fetch(`https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/settings.json?t=${Date.now()}`);
    if (!r.ok) return;
    const settings = await r.json();
    const library = settings.sounds || [];
    const assignments = settings.soundAssignments || {};
    // Map each assignment key → URL
    for (const [key, soundId] of Object.entries(assignments)) {
      if (!soundId) continue;
      const sound = library.find(s => s.id === soundId);
      if (sound && sound.url) soundUrls[key] = sound.url;
    }
  } catch(e) {
    console.warn('Failed to load sound assignments:', e);
  }
}

// ── Initialize Web Audio Context (lazy, after user gesture)
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
  } catch(e) {
    console.warn('Web Audio API not supported', e);
    return false;
  }
}

function applyVolumes() {
  if (!masterGain) return;
  const masterMute = volumes.masterMute ? 0 : 1;
  const musicMute = volumes.musicMute ? 0 : 1;
  const sfxMute = volumes.sfxMute ? 0 : 1;
  
  masterGain.gain.setTargetAtTime(volumes.master * masterMute, audioCtx.currentTime, 0.05);
  if (musicGain) musicGain.gain.setTargetAtTime(volumes.music * musicMute, audioCtx.currentTime, 0.05);
  if (sfxGain) sfxGain.gain.setTargetAtTime(volumes.sfx * sfxMute, audioCtx.currentTime, 0.05);
  
  // Also apply to HTMLAudio BGM if playing
  if (musicAudio) {
    musicAudio.volume = Math.min(1, volumes.master * masterMute * volumes.music * musicMute);
  }
}

export function setVolumes({ master, music, sfx, masterMute, musicMute, sfxMute } = {}) {
  if (master !== undefined) volumes.master = master / 100;
  if (music  !== undefined) volumes.music  = music  / 100;
  if (sfx    !== undefined) volumes.sfx    = sfx    / 100;
  if (masterMute !== undefined) volumes.masterMute = masterMute;
  if (musicMute !== undefined) volumes.musicMute = musicMute;
  if (sfxMute !== undefined) volumes.sfxMute = sfxMute;
  applyVolumes();
}

export function toggleMute(type) {
  if (type === 'master') volumes.masterMute = !volumes.masterMute;
  else if (type === 'music') volumes.musicMute = !volumes.musicMute;
  else if (type === 'sfx') volumes.sfxMute = !volumes.sfxMute;
  applyVolumes();
  return volumes[`${type}Mute`];
}

// ── Play a sound by its assignment key
function playSound(key) {
  const url = soundUrls[key];
  if (!url) return; // No sound assigned — silent
  if (volumes.masterMute || volumes.sfxMute) return;
  try {
    const audio = new Audio(url);
    audio.volume = Math.min(1, volumes.master * volumes.sfx);
    audio.play().catch(() => {});
  } catch(e) {}
}

// ── SFX exports — each maps to an assignment key
export function sfxHit()      { playSound('game_hit'); }
export function sfxScore()    { playSound('game_score'); }
export function sfxCombo()    { playSound('game_combo'); }
export function sfxBoost()    { playSound('game_boost'); }
export function sfxMiss()     { playSound('game_miss'); }
export function sfxGameOver() { playSound('game_gameover'); }
export function sfxDive()     { playSound('game_dive'); }
export function sfxLike()     { playSound('portfolio_like'); }
export function sfxLogin()    { playSound('portfolio_login'); }

// ── BGM — file-based looping audio
export function startBGM() {
  const url = soundUrls['game_bgm'] || soundUrls['portfolio_bgm'];
  if (!url) return; // No BGM assigned — silent
  if (musicIsPlaying && musicAudio) return;
  stopBGM();
  musicAudio = new Audio(url);
  musicAudio.loop = true;
  musicAudio.volume = Math.min(1, volumes.master * volumes.music * (volumes.mute ? 0 : 1));
  musicAudio.play().catch(() => {});
  musicIsPlaying = true;
}

export function startPortfolioBGM() {
  const url = soundUrls['portfolio_bgm'] || soundUrls['game_bgm'];
  if (!url) return;
  if (musicIsPlaying && musicAudio) return;
  stopBGM();
  musicAudio = new Audio(url);
  musicAudio.loop = true;
  musicAudio.volume = Math.min(1, volumes.master * volumes.music * (volumes.mute ? 0 : 1));
  musicAudio.play().catch(() => {});
  musicIsPlaying = true;
}

export function stopBGM() {
  if (musicAudio) {
    musicAudio.pause();
    musicAudio.currentTime = 0;
    musicAudio = null;
  }
  musicIsPlaying = false;
}

export function toggleBGM() {
  if (musicIsPlaying) stopBGM();
  else startBGM();
  return musicIsPlaying;
}

export function togglePortfolioBGM() {
  if (musicIsPlaying) stopBGM();
  else startPortfolioBGM();
  return musicIsPlaying;
}
