const fs = require('fs');
let html = fs.readFileSync('game.html', 'utf-8');

const regex = /window\.openLeaderboard = async \([\s\S]*?window\.closeLeaderboard = \(\) => \{\s*document\.getElementById\('leaderboardModal'\)\.classList\.remove\('open'\);\s*\};/;

const replacement = `  // Leaderboard and Stats Logic
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
  
  window.openLeaderboard = window.refreshLobbyStats;`;

if (!regex.test(html)) {
  console.log("Regex didn't match!");
} else {
  html = html.replace(regex, replacement);
  fs.writeFileSync('game.html', html, 'utf-8');
  console.log("Success");
}
