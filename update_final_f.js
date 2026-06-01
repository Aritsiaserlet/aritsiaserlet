const fs = require('fs');

// --- game.js modifications ---
let js = fs.readFileSync('game.js', 'utf-8');

// 1. Fix +Score floating text
// Original code:
// if (hx < e.x + e.w && hx + hw > e.x && hy < e.y + e.h && hy + hh > e.y) {
//   score += 10 * multiplier;
//   const gotFirework = Math.random() < 0.3;
// Let's replace the whole hit block
const hitRegex = /if \(hx < e\.x \+ e\.w && hx \+ hw > e\.x && hy < e\.y \+ e\.h && hy \+ hh > e\.y\) \{[\s\S]*?enemies\.splice\(i, 1\);/m;

const newHitLogic = `if (hx < e.x + e.w && hx + hw > e.x && hy < e.y + e.h && hy + hh > e.y) {
      const basePts = (window.settingsData && window.settingsData.game && window.settingsData.game.pointsPerHit !== undefined) ? window.settingsData.game.pointsPerHit : 15;
      const pts = basePts * multiplier;
      score += pts;
      const fwChance = (window.settingsData && window.settingsData.game && window.settingsData.game.fwDropChance !== undefined) ? window.settingsData.game.fwDropChance / 100 : 0.1;
      const gotFirework = Math.random() < fwChance;
      if (gotFirework) { fireworks++; updateHUD(); }
      const ex = e.x + e.w / 2, ey = e.y + e.h / 2;
      spawnParticles(ex, ey, '#f1c40f', 16);
      spawnParticles(ex, ey, '#ffffff', 10);
      spawnParticles(ex, ey, '#ffd700', 8);
      shakeScreen(); updateHUD();
      
      const offsetY = floatingTexts.length * 20;
      floatingTexts.push({ x: 30, y: 70 + offsetY, text: "+" + pts, life: 60, maxLife: 60, color: '#f1c40f', isHud: true });

      if (window.gameAudio) {
        window.gameAudio.sfxHit();
        if (multiplier > 1) window.gameAudio.sfxCombo();
        else window.gameAudio.sfxScore();
      }
      enemies.splice(i, 1);`;

js = js.replace(hitRegex, newHitLogic);

// 2. Fix gameStartTime for playTime
// In game.js, expose gameStartTime to window when game starts
js = js.replace(/gameStartTime = Date\.now\(\);/, 'gameStartTime = Date.now(); window.gameStartTime = gameStartTime;');

fs.writeFileSync('game.js', js, 'utf-8');
console.log('game.js updated');

// --- game.html modifications ---
let gameHtml = fs.readFileSync('game.html', 'utf-8');

// Update exitGameToLobby
gameHtml = gameHtml.replace(/window\.exitGameToLobby = function\(\) \{[\s\S]*?const scoreToSave = scoreVal > 0 \? scoreVal : finalScore;/,
`window.exitGameToLobby = function() {
    const finalScore = parseInt(document.getElementById('finalScore').innerText || '0', 10);
    const scoreVal = window.currentScore || 0; 
    const scoreToSave = scoreVal > 0 ? scoreVal : finalScore;
    const playTimeSeconds = window.gameStartTime ? Math.floor((Date.now() - window.gameStartTime) / 1000) : 0;
    window.gameStartTime = null; // reset`);

gameHtml = gameHtml.replace(/window\.saveScore\(window\.pendingScoreToSave\);/, 'window.saveScore(window.pendingScoreToSave, window.pendingPlayTime || 0);');

gameHtml = gameHtml.replace(/if \(scoreToSave > 0\) \{/, `if (scoreToSave >= 0 && playTimeSeconds > 0) { // allow 0 score if they just played to save time
      if (!currentUser) {
        if (confirm('You are not logged in! Do you want to login to save your playtime and score?')) {
          window.pendingScoreToSave = scoreToSave;
          window.pendingPlayTime = playTimeSeconds;
          window.pendingExitToLobby = true;
          window.gameAuthManager.login();
        } else {
          finishExit();
        }
        return;
      } else {
        window.saveScore(scoreToSave, playTimeSeconds);
        finishExit();
      }
    } else {
      finishExit();
    }
    
    function finishExit() {`);

gameHtml = gameHtml.replace(/document\.getElementById\('gameContainer'\)\.style\.display = 'none';\s*document\.getElementById\('lobbyScreen'\)\.style\.display = 'flex';\s*document\.getElementById\('gameTopNav'\)\.style\.display = 'flex';/,
`document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('lobbyScreen').style.display = 'flex';
    document.getElementById('gameTopNav').style.display = 'flex';`);

// close finishExit block
gameHtml = gameHtml.replace(/window\.openLeaderboard\(\);\s*\}\s*\};\s*function applyGameSettings/, `window.openLeaderboard();\n    }\n  };\n\n  function applyGameSettings`);

fs.writeFileSync('game.html', gameHtml, 'utf-8');
console.log('game.html updated');

// --- admin.html modifications ---
let adminHtml = fs.readFileSync('admin.html', 'utf-8');

// Split GAME SETTINGS into two cards
const animHtmlOld = `<button class="submit-btn" id="saveGameSettingsBtn" onclick="saveGameSettings()">SAVE GAME SETTINGS</button>
        <div class="progress-bar" id="gsetProgressBar"><div class="progress-fill" id="gsetProgressFill"></div></div>
        <p class="form-msg" id="gsetMsg"></p>`;

const newCards = `<button class="submit-btn" id="saveAnimBtn" onclick="saveGameAnimations()">SAVE ANIMATIONS</button>
        <div class="progress-bar" id="animProgressBar"><div class="progress-fill" id="animProgressFill"></div></div>
        <p class="form-msg" id="animMsg"></p>
      </div>
    </div>

    <!-- Game Balance Panel -->
    <div class="panel-card collapsed" style="grid-column: 1 / -1;">
      <h2 onclick="this.parentElement.classList.toggle('collapsed'); this.querySelector('.toggle-icon').textContent = this.parentElement.classList.contains('collapsed') ? '▼' : '▲';">
        <span>GAME BALANCE & MECHANICS</span>
        <span class="toggle-icon">▼</span>
      </h2>
      <div class="panel-body">
        
        <div style="background:var(--sky4);border:3px solid var(--dark);padding:12px;margin-bottom:24px;">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
            <div class="field">
              <label>Firework Drop Chance (%)</label>
              <input type="number" id="gsetFwDrop" min="0" max="100" value="10">
            </div>
            <div class="field">
              <label>Points Per Hit</label>
              <input type="number" id="gsetPtsHit" min="1" value="15">
            </div>
            <div class="field">
              <label>Base Miss Penalty</label>
              <input type="number" id="gsetMissPen" min="0" value="5">
            </div>
            <div class="field">
              <label>Firework Icon (In-Game)</label>
              <select id="gsetFwIcon" style="padding:4px;font-family:'VT323';font-size:18px;border:3px solid var(--dark);width:100%;">
              </select>
            </div>
          </div>
        </div>
        
        <button class="submit-btn" id="saveBalBtn" onclick="saveGameBalance()">SAVE BALANCE</button>
        <div class="progress-bar" id="balProgressBar"><div class="progress-fill" id="balProgressFill"></div></div>
        <p class="form-msg" id="balMsg"></p>`;

adminHtml = adminHtml.replace(animHtmlOld, newCards);
// Also remove the old BALANCE header from inside ANIMATIONS
adminHtml = adminHtml.replace(`<h3 style="font-family:'Press Start 2P',cursive;font-size:14px;color:var(--dark);margin-bottom:12px;border-bottom:3px solid var(--dark);padding-bottom:8px;">BALANCE & MECHANICS</h3>\n        <div style="background:var(--sky4);border:3px solid var(--dark);padding:12px;margin-bottom:24px;">\n          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">\n            <div class="field">\n              <label>Firework Drop Chance (%)</label>\n              <input type="number" id="gsetFwDrop" min="0" max="100" value="10">\n            </div>\n            <div class="field">\n              <label>Points Per Hit</label>\n              <input type="number" id="gsetPtsHit" min="1" value="15">\n            </div>\n            <div class="field">\n              <label>Base Miss Penalty</label>\n              <input type="number" id="gsetMissPen" min="0" value="5">\n            </div>\n            <div class="field">\n              <label>Firework Icon (In-Game)</label>\n              <select id="gsetFwIcon" style="padding:4px;font-family:'VT323';font-size:18px;border:3px solid var(--dark);width:100%;">\n                <!-- Filled by JS generateIconOptions -->\n              </select>\n            </div>\n          </div>\n        </div>`, '');

// Replace saveGameSettings with saveGameAnimations and saveGameBalance
const newSaves = `async function saveGameAnimations() {
  const btn=document.getElementById('saveAnimBtn');
  const bar=document.getElementById('animProgressBar');
  const fill=document.getElementById('animProgressFill');
  const msg=document.getElementById('animMsg');
  btn.disabled=true; bar.style.display='block'; fill.style.width='10%';
  msg.className='form-msg ok'; msg.textContent='Saving Animations...';
  try{
    if (!settings.game) settings.game = {};
    if(gSpriteBase64){
      const fname=\`works/sprite_\${Date.now()}.\${gSpriteExt}\`;
      await ghPutBinary(fname, gSpriteBase64, 'Upload Player Sprite');
      settings.game.playerSprite=\`https://raw.githubusercontent.com/\${GH_USER}/\${GH_REPO}/main/\${fname}\`;
    }
    if(gAttackBase64){
      const fname=\`works/attack_\${Date.now()}.\${gAttackExt}\`;
      await ghPutBinary(fname, gAttackBase64, 'Upload Attack Sprite');
      settings.game.playerAttackSprite=\`https://raw.githubusercontent.com/\${GH_USER}/\${GH_REPO}/main/\${fname}\`;
    }
    settings.game.playerSpriteFrames = parseInt(document.getElementById('gsetSpriteFrames').value) || 1;
    settings.game.playerSpriteFps = parseInt(document.getElementById('gsetSpriteFps').value) || 12;
    settings.game.playerSpriteLoop = document.getElementById('gsetSpriteLoop').checked;
    settings.game.playerAttackFrames = parseInt(document.getElementById('gsetAttackFrames').value) || 1;
    settings.game.playerAttackFps = parseInt(document.getElementById('gsetAttackFps').value) || 15;
    settings.game.playerAttackLoop = document.getElementById('gsetAttackLoop').checked;
    const json=JSON.stringify(settings,null,2);
    const result=await ghPut(JSON_PATH, json, 'Update Game Animations', settingsSha);
    settingsSha=result.content.sha;
    fill.style.width='100%';
    msg.textContent='Animations saved!';
    setTimeout(()=>{bar.style.display='none';msg.textContent='';},3000);
  }catch(e){
    msg.className='form-msg err'; msg.textContent='Error: '+e.message; bar.style.display='none';
  }finally{ btn.disabled=false; }
}

async function saveGameBalance() {
  const btn=document.getElementById('saveBalBtn');
  const bar=document.getElementById('balProgressBar');
  const fill=document.getElementById('balProgressFill');
  const msg=document.getElementById('balMsg');
  btn.disabled=true; bar.style.display='block'; fill.style.width='10%';
  msg.className='form-msg ok'; msg.textContent='Saving Balance...';
  try{
    if (!settings.game) settings.game = {};
    settings.game.fwDropChance = parseInt(document.getElementById('gsetFwDrop').value) || 0;
    settings.game.pointsPerHit = parseInt(document.getElementById('gsetPtsHit').value) || 15;
    settings.game.missPenalty = parseInt(document.getElementById('gsetMissPen').value) || 5;
    settings.game.fwIconId = document.getElementById('gsetFwIcon').value || '';
    const json=JSON.stringify(settings,null,2);
    const result=await ghPut(JSON_PATH, json, 'Update Game Balance', settingsSha);
    settingsSha=result.content.sha;
    fill.style.width='100%';
    msg.textContent='Balance saved!';
    setTimeout(()=>{bar.style.display='none';msg.textContent='';},3000);
  }catch(e){
    msg.className='form-msg err'; msg.textContent='Error: '+e.message; bar.style.display='none';
  }finally{ btn.disabled=false; }
}
`;

adminHtml = adminHtml.replace(/async function saveGameSettings\(\) \{[\s\S]*?finally\{\s*btn\.disabled=false;\s*\}\s*\}/, newSaves);

fs.writeFileSync('admin.html', adminHtml, 'utf-8');
console.log('admin.html updated');
