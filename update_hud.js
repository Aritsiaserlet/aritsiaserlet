const fs = require('fs');
let html = fs.readFileSync('game.html', 'utf-8');

const oldTop = /<div style="display:flex; gap:12px; align-items:center;">\s*<button id="exitBtn"[^>]+>.+?<\/button>\s*<button class="nav-btn"[^>]+>.+?<\/button>\s*<\/div>/;

const newTop = `<div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
        <div style="display:flex; gap:12px; align-items:center;">
          <button id="exitBtn" onclick="exitGameToLobby()" style="background:var(--danger); color:#fff; border:3px solid var(--dark); font-family:'Press Start 2P'; font-size:16px; padding:0 12px; height:44px; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:2px 2px 0 var(--dark);">🚪 EXIT</button>
          <button class="nav-btn" onclick="document.getElementById('gameSettingsModal').classList.add('open')" style="font-size:24px; padding:0 8px; margin:0; height:44px; display:flex; align-items:center; justify-content:center;">⚙️</button>
        </div>
        <div id="fireworkDisplay" style="display:flex; align-items:center; gap:8px; font-size:24px; font-family:'Press Start 2P',cursive; text-shadow:2px 2px 0 #fff; color:var(--dark);">
           <img src="data:image/svg+xml;utf8,<svg viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'><path d='M7 11v4h2v-4z' fill='%238B4513'/><path d='M6 7h4v4H6z' fill='%23fff'/><path d='M5 6h6v1H5z' fill='%23ccc'/><path d='M6 3h4v3H6z' fill='%23fff'/><path d='M7 1h2v2H7z' fill='%23f00'/><path d='M8 0h1v1H8z' fill='%23f00'/></svg>" style="width:24px; height:24px; image-rendering:pixelated; filter: drop-shadow(2px 2px 0 #fff);">
           x<span id="gameFireworks">0</span>
        </div>
        <div id="gameMultiplier" style="font-size: clamp(16px, 2.5vw, 24px); color: var(--gold); display: none; text-shadow:2px 2px 0 #000;"></div>
      </div>`;

html = html.replace(oldTop, newTop);

// Remove the old fireworkDisplay and gameMultiplier from hudBottom
const oldBottom = /<div id="fireworkDisplay">.+?<\/div>\s*<div id="gameMultiplier">.+?<\/div>/;
html = html.replace(oldBottom, '');

fs.writeFileSync('game.html', html, 'utf-8');
console.log('HUD updated');
