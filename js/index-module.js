import { initSettings, getSettings, updateSettings } from '../settingsManager.js';
  import { loginWithGoogle, logout, onUserChange, db, fetchLikeCounts, fetchUserLikes, toggleLike } from '../authManager.js';
  import { sfxLike, sfxLogin, sfxBtn, startBGM, stopBGM, toggleBGM, togglePortfolioBGM as _togglePortfolioBGM, setVolumes, loadSoundAssignments, toggleMute } from '../audioManager.js';
  
  window.portfolioSettingsManager = { getSettings, updateSettings };
  window.portfolioAudioManager = { startBGM, stopBGM, toggleBGM, setVolumes, togglePortfolioBGM: _togglePortfolioBGM, toggleMute, sfxBtn };
  window.portfolioAuthManager = { 
    login: loginWithGoogle, 
    logout: logout, 
    toggleLike: toggleLike 
  };

  // Setup Auth UI binding
  window.addEventListener('DOMContentLoaded', async () => {
    const loginBtn = document.getElementById('loginBtn');
    const userProfile = document.getElementById('userProfile');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');

    // Fetch global likes once
    window.globalLikes = await fetchLikeCounts();
    if (window.renderGallery) window.renderGallery();

    onUserChange(async user => {
      window.currentUser = user;
      if (user) {
        loginBtn.style.display = 'none';
        userProfile.style.display = 'flex';
        userName.textContent = user.displayName || 'Player';
        userAvatar.src = user.photoURL || '';
        // Fetch user's likes
        window.userLikes = await fetchUserLikes(user.uid);
        sfxLogin(); // Play login chime
      } else {
        loginBtn.style.display = 'inline-flex';
        userProfile.style.display = 'none';
        window.userLikes = {};
      }
      if (window.renderGallery) window.renderGallery();
    });

    // Load sound assignments from settings.json
    await loadSoundAssignments();

    // Sync initial audio volumes from settings
    const initSet = getSettings();
    setVolumes({
      master: initSet.masterVolume,
      music:  initSet.musicVolume,
      sfx:    initSet.sfxVolume,
      mute:   initSet.mute
    });
    if(window.initSoundBtns) window.initSoundBtns();
  }
);

  window.handleLikeClick = async (e, workId) => {
    if (e) e.stopPropagation();
    if (!window.currentUser) {
      document.getElementById('loginPromptModal').style.display = 'flex';
      return;
    }
    const isLiking = !window.userLikes[workId];
    const btn = e ? e.currentTarget : document.getElementById('modalLikeBtn');
    const span = btn ? btn.querySelector('span') : null;
    
    // Optimistic UI Update
    if (isLiking) {
      window.userLikes[workId] = true;
      window.globalLikes[workId] = (window.globalLikes[workId] || 0) + 1;
      btn.style.color = 'var(--danger)';
      btn.querySelector('svg').style.fill = 'currentColor';
    } else {
      delete window.userLikes[workId];
      window.globalLikes[workId] = Math.max(0, (window.globalLikes[workId] || 0) - 1);
      btn.style.color = 'var(--dark)';
      btn.querySelector('svg').style.fill = 'none';
    }
    span.textContent = window.globalLikes[workId];
    
    sfxLike(); // Play like SFX
    const success = await window.portfolioAuthManager.toggleLike(workId, isLiking);
    if (!success) {
      // Revert if failed
      if (isLiking) { delete window.userLikes[workId]; window.globalLikes[workId]--; }
      else { window.userLikes[workId] = true; window.globalLikes[workId]++; }
      if (window.renderGallery) window.renderGallery();
      if (window.currentModalWorkId === workId && window.updateModalLikeBtn) window.updateModalLikeBtn();
    }
  };

  window.updateModalLikeBtn = () => {
    const wId = window.currentModalWorkId;
    if (!wId) return;
    const likesCount = (window.globalLikes && window.globalLikes[wId]) ? window.globalLikes[wId] : 0;
    const isLiked = (window.userLikes && window.userLikes[wId]) ? true : false;
    const heartFill = isLiked ? 'currentColor' : 'none';
    const heartColor = isLiked ? 'var(--danger)' : 'var(--dark)';
    const btn = document.getElementById('modalLikeBtn');
    if (btn) {
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="${heartFill}"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        <span style="font-family:'VT323',monospace;font-size:24px;margin-top:2px;">${likesCount}</span>
      `;
      btn.style.color = heartColor;
    }
  };