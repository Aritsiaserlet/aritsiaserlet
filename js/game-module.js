import { db, getCurrentUser, onUserChange, loginWithGoogle, logout } from '../authManager.js';
  import { doc, getDoc, updateDoc, increment, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
  
  window.gameAuthManager = { login: loginWithGoogle, logout: logout, getCurrentUser: getCurrentUser };

  let currentUser = null;
  onUserChange(user => {
    currentUser = user;
    const loginBtn = document.getElementById('loginBtn');
    const userProfile = document.getElementById('userProfile');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    if (user) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (userProfile) userProfile.style.display = 'flex';
      if (userName) userName.textContent = user.displayName || 'Player';
      if (userAvatar) userAvatar.src = user.photoURL || '';

      // Check if we have a pending score to save after login
      if (window.pendingScoreToSave > 0 || window.pendingPlayTime > 0) {
        window.saveScore(window.pendingScoreToSave || 0, window.pendingPlayTime || 0);
        window.pendingScoreToSave = 0;
        window.pendingPlayTime = 0;
        
        // Return to lobby if we were waiting on exit
        if (window.pendingExitToLobby) {
          window.pendingExitToLobby = false;
          if (window.stopGame) window.stopGame();
          document.getElementById('gameContainer').style.display = 'none';
          document.getElementById('lobbyScreen').style.display = 'flex';
          document.getElementById('gameTopNav').style.display = 'flex';
          window.openLeaderboard();
        } else {
          window.openLeaderboard();
        }
      }
    } else {
      if (loginBtn) loginBtn.style.display = 'inline-flex';
      if (userProfile) userProfile.style.display = 'none';
    }
    
    if (window.refreshLobbyStats) {
      window.refreshLobbyStats();
    }
  });

  window.saveScore = async (newScore, playTimeSeconds = 0, maxMultiplier = 1) => {
    if (newScore <= 0 && playTimeSeconds <= 0) return;
    
    if (!currentUser) {
      // Do not prompt here. We prompt in exitGameToLobby instead.
      return;
    }
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        const updates = {
          totalScore: (data.totalScore || 0) + newScore,
          gamesPlayed: (data.gamesPlayed || 0) + 1,
          playTimeSeconds: (data.playTimeSeconds || 0) + playTimeSeconds,
          lastPlayed: serverTimestamp()
        };
        if (newScore > (data.highScore || 0)) {
          updates.highScore = newScore;
        }
        if (maxMultiplier > (data.bestCombo || 0)) {
          updates.bestCombo = maxMultiplier;
        }
        await updateDoc(userRef, updates);
        
        // Refresh lobby stats if displayed
        if (window.refreshLobbyStats) {
          setTimeout(window.refreshLobbyStats, 500);
        }
      }
    } catch (e) {
      console.error("Failed to save score:", e);
    }
  };

  import { startBGM, stopBGM, toggleBGM, setVolumes, sfxHit, sfxScore, sfxCombo, sfxBoost, sfxMiss, sfxGameOver, sfxDive, loadSoundAssignments, toggleMute, updateGameSoundBtn } from '../audioManager.js';
  
  // Read volume settings from localStorage on load
  function loadAudioSettings() {
    try {
      const raw = localStorage.getItem('portfolioSettings');
      if (raw) {
        const s = JSON.parse(raw);
        setVolumes({
          master: s.masterVolume ?? 100,
          music:  s.musicVolume  ?? 100,
          sfx:    s.sfxVolume    ?? 100,
          mute:   s.mute         ?? false
        });
      }
    } catch(e) {}
  }

  // Expose SFX and BGM controls globally for game.js (classic script)
  window.gameAudio = {
    startBGM,
    stopBGM,
    sfxHit,
    sfxScore,
    sfxCombo,
    sfxBoost,
    sfxMiss,
    sfxGameOver,
    sfxDive,
    toggleBGM,
    toggleMute,
    setVolumes,
    updateGameSoundBtn
  };

  loadAudioSettings();
  // Load sound assignments from settings.json so sounds work in-game
  loadSoundAssignments().then(() => {
    // Initial UI update for settings buttons if they exist
    ['master', 'music', 'sfx'].forEach(type => {
      const btn = document.getElementById(`gameMuteBtn_${type}`);
      if (btn) {
        let isMuted = false;
        try {
          const s = JSON.parse(localStorage.getItem('portfolioSettings') || '{}');
          if (type === 'master') isMuted = s.mute || false;
          if (type === 'music') isMuted = s.musicMute || false;
          if (type === 'sfx') isMuted = s.sfxMute || false;
        } catch(e) {}
        updateGameSoundBtn(btn, isMuted);
      }
    });
  });