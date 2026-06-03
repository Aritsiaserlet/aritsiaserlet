// =============================================================================
// ARITSIA PORTFOLIO - Game Lobby JavaScript
// game-lobby.js
// =============================================================================

  window.closeGameSettings = () => { document.getElementById('gameSettingsModal').classList.remove('open'); };

  // Wind Canvas for Lobby
  const lcanvas = document.getElementById('lobbyWindCanvas');
  const lctx = lcanvas.getContext('2d');
  let lW, lH, lparticles = [];
  function resizeLobby() { lW = lcanvas.width = window.innerWidth; lH = lcanvas.height = window.innerHeight; }
  resizeLobby();
  window.addEventListener('resize', resizeLobby);
  function randBetween(a, b) { return a + Math.random() * (b - a); }
  function createLobbyParticle(xStart) {
    const w = Math.floor(randBetween(10, 60));
    return {
      x: xStart ?? lW + w,
      y: Math.random() * lH,
      width: w,
      height: Math.floor(randBetween(1, 3)) * 2,
      speedX: randBetween(-9, -3),
      opacity: randBetween(0.1, 0.4)
    };
  }
  for (let i = 0; i < 40; i++) lparticles.push(createLobbyParticle(Math.random() * lW));
  function animateLobby() {
    lctx.clearRect(0, 0, lW, lH);
    lparticles.forEach((p, i) => {
      p.x += p.speedX;
      lctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
      lctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.width, p.height);
      if (p.x + p.width < 0) lparticles[i] = createLobbyParticle();
    });
    requestAnimationFrame(animateLobby);
  }
  animateLobby();

  // Leaderboard Logic
    // Leaderboard and Stats Logic
  window.refreshLobbyStats = async (pendingScore = 0) => {
    const listEl = document.getElementById('leaderboardList');
    if (!listEl) return;
    listEl.innerHTML = '<div style="text-align:center;font-size:20px;font-family:\'VT323\';">Loading...</div>';
    
    let myHighScore = 0;
    
    try {
      const { collection, query, orderBy, limit, getDocs, doc, getDoc, getCountFromServer, where } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      const { db } = await import('../authManager.js');
      
      // Update Right Panel (Stats)
      const currentUser = window.gameAuthManager ? window.gameAuthManager.getCurrentUser() : null;
      if (currentUser) {
        document.getElementById('lobbyLoginBox').style.display = 'none';
        document.getElementById('lobbyProfileBox').style.display = 'flex';
        document.getElementById('lobbyAvatar').src = currentUser.photoURL || 'https://via.placeholder.com/80';
        document.getElementById('lobbyName').innerText = currentUser.displayName || 'Player';
        
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const d = userSnap.data();
          myHighScore = d.highScore || 0;
          document.getElementById('statHigh').innerText = myHighScore;
          const totalScore = d.totalScore || 0;
          const gamesPlayed = d.gamesPlayed || 0;
          document.getElementById('statAvg').innerText = gamesPlayed > 0 ? Math.round(totalScore / gamesPlayed) : 0;
          document.getElementById('statCombo').innerText = d.bestCombo || 0;
          document.getElementById('statGames').innerText = gamesPlayed;
          
          let seconds = d.playTimeSeconds || 0;
          let timeStr = "";
          if (seconds < 60) timeStr = seconds + "s";
          else if (seconds < 3600) timeStr = Math.floor(seconds/60) + "m";
          else timeStr = Math.floor(seconds/3600) + "h " + Math.floor((seconds%3600)/60) + "m";
          document.getElementById('statTime').innerText = timeStr;
          
          // Calculate Rank
          const higherScoresQ = query(collection(db, "users"), where("highScore", ">", myHighScore));
          const snapCount = await getCountFromServer(higherScoresQ);
          const rank = snapCount.data().count + 1;
          document.getElementById('lobbyRank').innerText = `Rank: #${rank}`;
        }
      } else {
        document.getElementById('lobbyLoginBox').style.display = 'flex';
        document.getElementById('lobbyProfileBox').style.display = 'none';
      }

      // Update Left Panel (Leaderboard)
      const q = query(collection(db, "users"), orderBy("highScore", "desc"), limit(10));
      const snap = await getDocs(q);
      
      listEl.innerHTML = '';
      
      if (pendingScore > 0) {
        const promptBanner = document.createElement('div');
        promptBanner.style.cssText = 'background:var(--gold-l); border:3px dashed var(--dark); padding:16px; margin-bottom:16px; text-align:center; font-family:"VT323", monospace; font-size:22px; color:var(--dark);';
        promptBanner.innerHTML = `
          Score: ${pendingScore}<br>
          <button onclick="window.gameAuthManager.login()" style="margin-top:8px;padding:8px 16px;font-family:'VT323',monospace;font-size:20px;cursor:pointer;border:3px solid var(--dark);background:var(--sky4);">Login to Save</button>
        `;
        listEl.appendChild(promptBanner);
      }

      let rankList = 1;
      snap.forEach(docSnap => {
        const data = docSnap.data();
        const item = document.createElement('div');
        item.className = `leaderboard-item ${rankList <= 3 ? 'top3' : ''}`;
        item.innerHTML = `
          <div class="lb-rank">#${rankList}</div>
          <img src="${data.photoURL || 'https://via.placeholder.com/36'}" class="lb-avatar">
          <div style="flex:1; display:flex; flex-direction:column; overflow:hidden;">
            <div style="font-family:'VT323',monospace; font-size:20px; color:var(--dark); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${data.displayName || 'Anonymous'}</div>
            <div style="font-family:'Press Start 2P',cursive; font-size:10px; color:var(--dark);">${data.highScore || 0}</div>
          </div>
        `;
        listEl.appendChild(item);
        rankList++;
      });
    } catch (error) {
      listEl.innerHTML += '<div style="text-align:center;font-size:20px;color:var(--danger);font-family:\'VT323\';">Failed to load stats.</div>';
      console.error(error);
    }
  };
  
  window.openLeaderboard = window.refreshLobbyStats;
  function startGameFromLobby() {
    document.getElementById('lobbyScreen').style.display = 'none';
    document.getElementById('gameTopNav').style.display = 'none'; // hide top nav during game
    document.getElementById('gameContainer').style.display = 'block';
    if (window._worksData !== undefined && window.initGame) {
      window.initGame(window._worksData, window._settingsData);
    }
  }

  function exitToPortfolio() {
    if (window.gameAudio) window.gameAudio.stopBGM();
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.4s ease';
    setTimeout(() => { window.location.href = 'index.html'; }, 400);
  }

  window.saveScoreModalOk = function() {
    document.getElementById('saveScoreModal').classList.remove('open');
    if (window.gameAuthManager) window.gameAuthManager.login();
  };

  window.saveScoreModalCancel = function() {
    document.getElementById('saveScoreModal').classList.remove('open');
    window.pendingScoreToSave = 0;
    window.pendingPlayTime = 0;
    window.pendingExitToLobby = false;
    if (window.finishExit) window.finishExit();
  };

  window.exitGameToLobby = function() {
    const finalScore = parseInt(document.getElementById('finalScore').innerText || '0', 10);
    const scoreVal = window.currentScore || 0; 
    const scoreToSave = scoreVal > 0 ? scoreVal : finalScore;
    const playTimeSeconds = window.gameStartTime ? Math.floor((Date.now() - window.gameStartTime) / 1000) : 0;
    window.gameStartTime = null; // reset

    if (window.stopGame) window.stopGame();
    if (window.gameAudio) {
      if (window.gameAudio.stopSfxGameOver) window.gameAudio.stopSfxGameOver();
      if (window.gameAudio.startLobbyBGM) window.gameAudio.startLobbyBGM();
    }
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('lobbyScreen').style.display = 'flex';
    document.getElementById('gameTopNav').style.display = 'flex';

    window.finishExit = function() {
      if (window.gameAuthManager && window.gameAuthManager.getCurrentUser()) {
        window.openLeaderboard();
      } else {
        window.openLeaderboard(scoreToSave);
      }
    };

    if (scoreToSave >= 0 && playTimeSeconds > 0) {
      if (!(window.gameAuthManager && window.gameAuthManager.getCurrentUser())) {
        document.getElementById('saveScoreMsg').innerText = `You got a score of ${scoreToSave} and played for ${playTimeSeconds}s! You are not logged in. Do you want to login to save your stats?`;
        window.pendingScoreToSave = scoreToSave;
        window.pendingPlayTime = playTimeSeconds;
        window.pendingExitToLobby = true;
        document.getElementById('saveScoreModal').classList.add('open');
      } else {
        window.saveScore(scoreToSave, playTimeSeconds);
        window.finishExit();
      }
    } else {
      window.finishExit();
    }
  };

  function applyGameSettings() {
    const master = parseInt(document.getElementById('gsetMasterVol').value, 10);
    const music = parseInt(document.getElementById('gsetMusicVol').value, 10);
    const sfx = parseInt(document.getElementById('gsetSfxVol').value, 10);
    // Save to localStorage
    try {
      const raw = localStorage.getItem('portfolioSettings');
      const s = raw ? JSON.parse(raw) : {};
      s.masterVolume = master; s.musicVolume = music; s.sfxVolume = sfx;
      localStorage.setItem('portfolioSettings', JSON.stringify(s));
    } catch(e) {}
    if (window.gameAudio && window.gameAudio.setVolumes) {
      window.gameAudio.setVolumes({ master, music, sfx });
    }
  }

  let _gameBgmOn = false;
  window.updateGameBgmBtn = function() {
    if (window.gameAudio) {
      const btn = document.getElementById('gameBgmBtn');
      if (btn) {
        // gameAudio doesn't expose the direct boolean easily, so let's track it
        // but wait, window.gameAudio.toggleBGM() returns musicIsPlaying!
      }
    }
  }

  // We should just use an onclick directly inline:
  // onclick="if(window.gameAudio) { window.isGameBgmOn = window.gameAudio.toggleBGM(); document.getElementById('gameBgmBtn').textContent = window.isGameBgmOn ? '🔊' : '🔇'; }"

  function initGameSettings() {
    try {
      const raw = localStorage.getItem('portfolioSettings');
      if (raw) {
        const s = JSON.parse(raw);
        document.getElementById('gsetMasterVol').value = s.masterVolume ?? 100;
        document.getElementById('gsetMusicVol').value = s.musicVolume ?? 100;
        document.getElementById('gsetSfxVol').value = s.sfxVolume ?? 100;
      }
    } catch(e) {}
  }

  function setLoadingProgress(pct, text) {
    document.getElementById('loadingBar').style.width = pct + '%';
    if (text) document.getElementById('loadingText').textContent = text;
  }

  window.addEventListener('load', async () => {
    setLoadingProgress(20, 'Connecting to GitHub...');

    let worksData = [];
    let settingsData = {};

    const GH_USER = 'Aritsiaserlet';
    const GH_REPO = 'aritsiaserlet';
    const bust = '?t=' + Date.now();

    try {
      setLoadingProgress(40, 'Loading works data...');
      const r = await fetch(`https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/works.json${bust}`);
      if (r.ok) worksData = await r.json();
    } catch(e) {
      console.warn('Failed to load works:', e);
    }

    try {
      setLoadingProgress(70, 'Loading settings...');
      const sr = await fetch(`https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/settings.json${bust}`);
      if (sr.ok) settingsData = await sr.json();
    } catch(e) {
      console.warn('Failed to load settings:', e);
    }

    setLoadingProgress(100, 'Ready!');

    // Store data globally for lobby
    window._worksData = worksData;
    window._settingsData = settingsData;
    
    if (settingsData && settingsData.game && settingsData.game.fwIconId && settingsData.icons) {
      const ic = settingsData.icons.find(x => x.id === settingsData.game.fwIconId);
      if (ic) {
        const fIconImg = document.querySelector('#fireworkDisplay img');
        if (fIconImg) {
          fIconImg.src = ic.url;
          // Also remove any inline SVG styles if they conflict, though it should be fine.
        }
      }
    }

    setTimeout(() => {
      // Hide loading, show LOBBY (not game directly)
      document.getElementById('loadingScreen').style.display = 'none';
      const lobby = document.getElementById('lobbyScreen');
      if (lobby) lobby.style.display = 'flex';
      
      document.getElementById('gameTopNav').style.display = 'flex';

      if (!window.initGame) {
        document.getElementById('loadingText').textContent = 'Error: game.js failed to load.';
        document.getElementById('loadingScreen').style.display = 'flex';
        document.getElementById('loadingBar').style.background = '#e74c3c';
      }

      initGameSettings();
    }, 300);
  });
