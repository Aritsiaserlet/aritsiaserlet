const fs = require('fs');

let html = fs.readFileSync('game.html', 'utf-8');

// 1. Add CSS for lobby-content-grid
const css_addition = `
  .lobby-content-grid {
    position: absolute; inset: 0; z-index: 10;
    display: flex; flex-direction: row; justify-content: space-between; align-items: stretch;
    padding: 40px; gap: 20px; box-sizing: border-box;
    width: 100%; height: 100%;
  }
  .lobby-left, .lobby-right {
    flex: 1; min-width: 280px; max-width: 320px;
    background: rgba(255,255,255,0.85); border: 4px solid var(--dark);
    box-shadow: 8px 8px 0 rgba(0,0,0,0.3); padding: 20px;
    display: flex; flex-direction: column; border-radius: 8px;
    max-height: 100%; overflow-y: auto;
  }
  .lobby-center {
    flex: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
  }
  .lobby-stat-row {
    display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px dashed var(--dark); padding-bottom: 4px;
  }
  @media (max-width: 1000px) {
    .lobby-content-grid { flex-direction: column; overflow-y: auto; align-items: center; justify-content: flex-start; }
    .lobby-left, .lobby-right { width: 100%; max-width: 500px; flex: none; height: auto; }
    .lobby-center { margin: 40px 0; }
  }
`;
if (!html.includes('.lobby-content-grid')) {
    html = html.replace('  .lobby-cloud {', css_addition + '  .lobby-cloud {');
}

// 2. Remove the LEADERBOARD button
html = html.replace(/<button class="nav-btn" onclick="openLeaderboard\(\)"[^>]*>🏆 LEADERBOARD<\/button>/, '');
html = html.replace(/<button class="nav-btn" onclick="window\.openLeaderboard\(\)"[^>]*>🏆 LEADERBOARD<\/button>/, '');

// 3. Replace Leaderboard Modal
html = html.replace(/<!-- Leaderboard Modal -->[\s\S]*?<\/div>\s*<\/div>/, '');

// 4. Replace Lobby Screen content
const lobby_replacement = `<div id="lobbyScreen">
  <div class="lobby-clouds">
    <div class="lobby-cloud" style="width:180px;height:75px;top:15%;animation-duration:25s;">
      <div style="width:180px;height:75px;background:inherit;position:absolute;top:0;left:0;"></div>
      <div style="width:126px;height:75px;background:inherit;position:absolute;top:-50px;left:27px;"></div>
      <div style="width:50px;height:75px;background:inherit;position:absolute;top:0;left:-14px;"></div>
      <div style="width:50px;height:75px;background:inherit;position:absolute;top:0;left:130px;"></div>
    </div>
    <div class="lobby-cloud" style="width:120px;height:50px;top:45%;animation-duration:18s;animation-delay:-5s;opacity:0.6;transform:scale(0.8);">
      <div style="width:120px;height:50px;background:inherit;position:absolute;top:0;left:0;"></div>
      <div style="width:84px;height:50px;background:inherit;position:absolute;top:-33px;left:18px;"></div>
      <div style="width:33px;height:50px;background:inherit;position:absolute;top:0;left:-9px;"></div>
      <div style="width:33px;height:50px;background:inherit;position:absolute;top:0;left:86px;"></div>
    </div>
    <div class="lobby-cloud" style="width:220px;height:92px;top:70%;animation-duration:35s;animation-delay:-12s;opacity:0.8;">
      <div style="width:220px;height:92px;background:inherit;position:absolute;top:0;left:0;"></div>
      <div style="width:154px;height:92px;background:inherit;position:absolute;top:-61px;left:33px;"></div>
      <div style="width:61px;height:92px;background:inherit;position:absolute;top:0;left:-17px;"></div>
      <div style="width:61px;height:92px;background:inherit;position:absolute;top:0;left:158px;"></div>
    </div>
  </div>
  <canvas class="lobby-wind" id="lobbyWindCanvas"></canvas>

  <div class="lobby-content-grid">
    <div class="lobby-left">
      <h2 class="leaderboard-title" style="margin-top:0;">🏆 TOP 10 PLAYERS</h2>
      <div class="leaderboard-list" id="leaderboardList"></div>
    </div>

    <div class="lobby-center">
      <h1>ARITSIA WITH MACE</h1>
      <div class="lobby-player"></div>
      <p style="font-family:'VT323',monospace; font-size:24px; margin-bottom:20px; text-shadow:1px 1px 0 rgba(0,0,0,0.5);">Dive into the artworks. Hit them to score!<br>Miss them and you lose points.</p>
      <button class="game-btn btn-play" onclick="startGameFromLobby()" style="font-size:clamp(14px,2.5vw,20px);padding:14px 28px;">▶ PLAY GAME</button>
      <div class="lobby-hint">SPACE or Left-Click = Dive &nbsp;|&nbsp; SHIFT or Right-Click = Boost<br>Touch: Left Half = Boost 👉 Right Half = Dive</div>
      <button class="game-btn btn-exit" onclick="exitToPortfolio()" style="font-size:clamp(11px,1.5vw,14px);padding:8px 16px;">🔙 BACK TO PORTFOLIO</button>
    </div>

    <div class="lobby-right">
      <div id="lobbyProfileBox" style="display:none; flex-direction:column; align-items:center;">
        <img id="lobbyAvatar" src="" style="width:80px;height:80px;border-radius:50%;border:3px solid var(--dark);margin-bottom:12px;object-fit:cover;">
        <h2 id="lobbyName" style="font-family:'Press Start 2P',cursive; font-size:14px; color:var(--dark); text-shadow:1px 1px 0 var(--white); margin-bottom:8px;text-align:center;">Player</h2>
        <div id="lobbyRank" style="font-family:'VT323',monospace; font-size:24px; color:var(--gold); text-shadow:1px 1px 0 var(--dark); margin-bottom:20px;">Rank: ---</div>
        
        <div style="width:100%; text-align:left; font-family:'VT323',monospace; font-size:18px; color:var(--dark);">
          <div class="lobby-stat-row"><span>High Score:</span><span id="statHigh">0</span></div>
          <div class="lobby-stat-row"><span>Average Score:</span><span id="statAvg">0</span></div>
          <div class="lobby-stat-row"><span>Highest Combo:</span><span id="statCombo">0</span></div>
          <div class="lobby-stat-row"><span>Games Played:</span><span id="statGames">0</span></div>
          <div class="lobby-stat-row" style="border-bottom:none;"><span>Play Time:</span><span id="statTime">0m</span></div>
        </div>
      </div>
      <div id="lobbyLoginBox" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%;">
        <p style="font-family:'VT323',monospace; font-size:24px; margin-bottom:16px; text-align:center;">Login to save your stats and compete on the leaderboard!</p>
        <button class="nav-btn" onclick="window.gameAuthManager.login()" style="font-size:20px; padding:12px 24px; justify-content:center; background:var(--gold); color:var(--dark); width:100%;">LOGIN WITH GOOGLE</button>
      </div>
    </div>
  </div>
</div>`;

html = html.replace(/<div id="lobbyScreen">[\s\S]*?<\/div>\s*<!-- Game Container/, lobby_replacement + '\n\n<!-- Game Container');

// 5. Fix Leaderboard logic to refresh stats too, and update rank logic.
const refresh_logic = `
  // Leaderboard and Stats Logic
  window.refreshLobbyStats = async (pendingScore = 0) => {
    const listEl = document.getElementById('leaderboardList');
    if (!listEl) return;
    listEl.innerHTML = '<div style="text-align:center;font-size:20px;font-family:\\'VT323\\';">Loading...</div>';
    
    let myHighScore = 0;
    
    try {
      const { collection, query, orderBy, limit, getDocs, doc, getDoc, getCountFromServer, where } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      const { db } = await import('./authManager.js');
      
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
          document.getElementById('lobbyRank').innerText = \`Rank: #\${rank}\`;
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
        promptBanner.innerHTML = \`
          Score: \${pendingScore}<br>
          <button onclick="window.gameAuthManager.login()" style="margin-top:8px;padding:8px 16px;font-family:'VT323',monospace;font-size:20px;cursor:pointer;border:3px solid var(--dark);background:var(--sky4);">Login to Save</button>
        \`;
        listEl.appendChild(promptBanner);
      }

      let rankList = 1;
      snap.forEach(docSnap => {
        const data = docSnap.data();
        const item = document.createElement('div');
        item.className = \`leaderboard-item \${rankList <= 3 ? 'top3' : ''}\`;
        item.innerHTML = \`
          <div class="lb-rank">#\${rankList}</div>
          <img src="\${data.photoURL || 'https://via.placeholder.com/36'}" class="lb-avatar">
          <div style="flex:1; display:flex; flex-direction:column; overflow:hidden;">
            <div style="font-family:'VT323',monospace; font-size:20px; color:var(--dark); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">\${data.displayName || 'Anonymous'}</div>
            <div style="font-family:'Press Start 2P',cursive; font-size:10px; color:var(--dark);">\${data.highScore || 0}</div>
          </div>
        \`;
        listEl.appendChild(item);
        rankList++;
      });
    } catch (error) {
      listEl.innerHTML += '<div style="text-align:center;font-size:20px;color:var(--danger);font-family:\\'VT323\\';">Failed to load stats.</div>';
      console.error(error);
    }
  };
  
  window.openLeaderboard = window.refreshLobbyStats;
`;
html = html.replace(/\/\/ Leaderboard Logic[\s\S]*?window\.closeLeaderboard = \(\) => \{.*?\};/, refresh_logic);

fs.writeFileSync('game.html', html, 'utf-8');
