// =============================================================================
// ARITSIA PORTFOLIO - Audio Manager
// audioManager.js
//
// File-based audio engine — plays sounds from URLs stored in settings.json.
// Sounds are uploaded via Admin Panel → Sound Library, then assigned to events
// (e.g. 'bgm', 'sfxHit', 'sfxScore') in the Sound Picker.
//
// Exports:
//   loadSoundAssignments() — fetch sound assignments from GitHub settings.json
//   startBGM() / stopBGM() / toggleBGM() / togglePortfolioBGM()
//   sfxHit() / sfxScore() / sfxBoost() / sfxCombo() / sfxLike() / sfxLogin()
//   setVolumes({ master, music, sfx, mute }) — sync volume state
//   toggleMute(channel) — toggle mute for 'master', 'music', or 'sfx'
// =============================================================================

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
let soundVolumes = {};

export let globalSoundBtnIconUrl = '';
export function updateGameSoundBtn(btn, isMuted) {
  if(!btn) return;
  if (globalSoundBtnIconUrl) {
    btn.innerHTML = `<img src="${globalSoundBtnIconUrl}" style="width:24px;height:24px;object-fit:contain;image-rendering:pixelated;opacity:${isMuted?'0.5':'1'};filter:${isMuted?'grayscale(100%)':'none'};">`;
  } else {
    btn.textContent = isMuted ? '🔇' : '🔊';
  }
}

// ── Load sound assignments from settings.json
export async function loadSoundAssignments() {
  try {
    let settings = null;
    if (window.portfolioSettingsManager) {
      settings = window.portfolioSettingsManager.getSettings();
    } else if (window.parent && window.parent.portfolioSettingsManager) {
      settings = window.parent.portfolioSettingsManager.getSettings();
    }
    
    if (!settings || Object.keys(settings).length === 0) {
      const GH_USER = 'Aritsiaserlet';
      const GH_REPO = 'aritsiaserlet';
      const r = await fetch(`https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/settings.json?t=${Date.now()}`);
      if (r.ok) settings = await r.json();
    }
    if (!settings) return;

    if (settings.soundBtnIconId && settings.icons) {
      const ic = settings.icons.find(x => x.id === settings.soundBtnIconId);
      if (ic) globalSoundBtnIconUrl = ic.url;
    }

    const library = settings.sounds || [];
    library.forEach(s => {
      soundVolumes[s.url] = s.volume !== undefined ? s.volume / 100 : 1.0;
    });
    const assignments = settings.soundAssignments || {};
    // Map each assignment key → URL
    // Map each assignment key → Array of Layers (Array of Arrays of URLs)
    for (const [key, rawAssignment] of Object.entries(assignments)) {
      if (!rawAssignment || rawAssignment.length === 0) continue;
      
      let layers = rawAssignment;
      if (!Array.isArray(layers[0])) {
        layers = [layers]; // Upgrade old 1D array to 2D
      }
      
      const urlLayers = [];
      layers.forEach(layerIds => {
        const urls = [];
        if (Array.isArray(layerIds)) {
          layerIds.forEach(id => {
            const sound = library.find(s => s.id === id);
            if (sound && sound.url) urls.push(sound.url);
          });
        }
        if (urls.length > 0) urlLayers.push(urls);
      });
      
      if (urlLayers.length > 0) soundUrls[key] = urlLayers;
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
  const layers = soundUrls[key];
  if (!layers || layers.length === 0) return []; // No sound assigned — silent
  if (volumes.masterMute || volumes.sfxMute) return [];
  let audios = [];
  try {
      layers.forEach(urls => {
        if (!urls || urls.length === 0) return;
        const url = urls[Math.floor(Math.random() * urls.length)];
        const sndVol = soundVolumes[url] !== undefined ? soundVolumes[url] : 1.0;
        const audio = new Audio(url);
        audio.volume = Math.min(1, volumes.master * volumes.sfx * sndVol);
        audio.play().catch(e => console.warn('SFX play error:', e));
        audios.push(audio);
      });
  } catch(e) {}
  return audios;
}

let activeGameOvers = [];
// ── SFX exports — each maps to an assignment key
export function sfxHit()      { playSound('game_hit'); }
export function sfxScore()    { playSound('game_score'); }
export function sfxCombo()    { playSound('game_combo'); }
export function sfxBoost()    { playSound('game_boost'); }
export function sfxMiss()     { playSound('game_miss'); }
export function sfxGameOver() { 
  stopSfxGameOver(); 
  activeGameOvers = playSound('game_gameover'); 
}
export function stopSfxGameOver() {
  activeGameOvers.forEach(a => { a.pause(); a.currentTime = 0; });
  activeGameOvers = [];
}
export function sfxDive()     { playSound('game_dive'); }
export function sfxLike()     { playSound('portfolio_like'); }
export function sfxLogin()    { playSound('portfolio_login'); }
export function sfxBtn()      { playSound('portfolio_btn'); }

let bgmAudios = [];

// ── BGM — file-based looping audio
export function startBGM() {
  const layers = soundUrls['game_bgm'] || soundUrls['portfolio_bgm'];
  if (!layers || layers.length === 0) return;
  if (musicIsPlaying && bgmAudios.length > 0) return;
  stopBGM();
  layers.forEach(urls => {
    if (!urls || urls.length === 0) return;
    const url = urls[Math.floor(Math.random() * urls.length)];
    if (!url) return;
    const sndVol = soundVolumes[url] !== undefined ? soundVolumes[url] : 1.0;
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = Math.min(1, volumes.master * volumes.music * (volumes.masterMute || volumes.musicMute ? 0 : 1) * sndVol);
    audio.play().catch(e => console.warn('BGM play error:', e));
    bgmAudios.push(audio);
  });
  musicIsPlaying = true;
}

export function startPortfolioBGM() {
  const layers = soundUrls['portfolio_bgm'] || soundUrls['game_bgm'];
  if (!layers || layers.length === 0) return;
  if (musicIsPlaying && bgmAudios.length > 0) return;
  stopBGM();
  layers.forEach(urls => {
    if (!urls || urls.length === 0) return;
    const url = urls[Math.floor(Math.random() * urls.length)];
    if (!url) return;
    const sndVol = soundVolumes[url] !== undefined ? soundVolumes[url] : 1.0;
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = Math.min(1, volumes.master * volumes.music * (volumes.masterMute || volumes.musicMute ? 0 : 1) * sndVol);
    audio.play().catch(e => console.warn('Portfolio BGM play error:', e));
    bgmAudios.push(audio);
  });
  musicIsPlaying = true;
}

export function startLobbyBGM() {
  const layers = soundUrls['lobby_bgm'] || soundUrls['game_bgm'];
  if (!layers || layers.length === 0) return;
  if (musicIsPlaying && bgmAudios.length > 0) return;
  stopBGM();
  layers.forEach(urls => {
    if (!urls || urls.length === 0) return;
    const url = urls[Math.floor(Math.random() * urls.length)];
    if (!url) return;
    const sndVol = soundVolumes[url] !== undefined ? soundVolumes[url] : 1.0;
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = Math.min(1, volumes.master * volumes.music * (volumes.masterMute || volumes.musicMute ? 0 : 1) * sndVol);
    audio.play().catch(e => console.warn('Lobby BGM play error:', e));
    bgmAudios.push(audio);
  });
  musicIsPlaying = true;
}

export function stopBGM() {
  bgmAudios.forEach(a => {
    a.pause();
    a.currentTime = 0;
  });
  bgmAudios = [];
  musicAudio = null; // for backwards compatibility check, though not used anymore
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

// ── Global Button Click Listener ──
if (typeof document !== 'undefined') {
  document.addEventListener('click', e => {
    // Check if the clicked target or its parent is a button, link, or common clickable class
    const clickable = e.target.closest('button, a, .tab, .social-btn, .modal-link, .menu-item, .cat-badge');
    if (clickable) {
      sfxBtn();
    }
  });
}
