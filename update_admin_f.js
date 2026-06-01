const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf-8');

// 1. Remove the sTitle, sDesc, sAbout, sLinks from renderSettingsUI
html = html.replace(/document\.getElementById\('sTitle'\)\.value = settings\.title \|\| '';/g, '');
html = html.replace(/document\.getElementById\('sDesc'\)\.value = settings\.description \|\| '';/g, '');
html = html.replace(/document\.getElementById\('sAbout'\)\.value = settings\.aboutText \|\| '';/g, '');
html = html.replace(/document\.getElementById\('sLinks'\)\.value = settings\.socialLinks \? settings\.socialLinks\.join\('\\n'\) : '';/g, '');

// 2. Remove GAME SETTINGS block from SITE SETTINGS
const gameSetHtml = `<h3 style="font-family:'Press Start 2P',cursive;font-size:14px;color:var(--dark);margin-bottom:12px;border-bottom:3px solid var(--dark);padding-bottom:8px;">GAME SETTINGS</h3>
        <div style="background:var(--sky4);border:3px solid var(--dark);padding:12px;margin-bottom:24px;">
          <p style="font-size:16px;color:var(--dark);margin-bottom:12px;">Configure custom Player Sprite and Attack Animation (upload horizontal spritesheets).</p>
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            <div class="field" style="flex:1;min-width:200px;">
              <label>Player Sprite (Idle/Fly)</label>
              <input type="file" id="gsetSpriteFile" accept="image/*">
              <img id="gsetSpritePreview" src="" style="max-width:100%; height:auto; margin-top:8px; display:none; border:2px solid var(--dark); image-rendering:pixelated;">
              <div style="display:flex;gap:8px;margin-top:8px;">
                <div style="flex:1"><label style="font-size:12px;">Frames</label><input type="number" id="gsetSpriteFrames" min="1" value="1"></div>
                <div style="flex:1"><label style="font-size:12px;">FPS</label><input type="number" id="gsetSpriteFps" min="1" value="12"></div>
              </div>
              <label style="font-size:12px;margin-top:8px;display:flex;align-items:center;gap:4px;"><input type="checkbox" id="gsetSpriteLoop" checked> Loop Animation</label>
            </div>
            <div class="field" style="flex:1;min-width:200px;">
              <label>Player Attack Sprite</label>
              <input type="file" id="gsetAttackFile" accept="image/*">
              <img id="gsetAttackPreview" src="" style="max-width:100%; height:auto; margin-top:8px; display:none; border:2px solid var(--dark); image-rendering:pixelated;">
              <div style="display:flex;gap:8px;margin-top:8px;">
                <div style="flex:1"><label style="font-size:12px;">Frames</label><input type="number" id="gsetAttackFrames" min="1" value="1"></div>
                <div style="flex:1"><label style="font-size:12px;">FPS</label><input type="number" id="gsetAttackFps" min="1" value="15"></div>
              </div>
              <label style="font-size:12px;margin-top:8px;display:flex;align-items:center;gap:4px;"><input type="checkbox" id="gsetAttackLoop"> Loop Animation</label>
            </div>
          </div>
        </div>`;

html = html.replace(gameSetHtml, '');

// Create new GAME SETTINGS Panel Card
const newGameSettingsPanel = `
    <!-- Game Settings Panel -->
    <div class="panel-card collapsed" style="grid-column: 1 / -1;">
      <h2 onclick="this.parentElement.classList.toggle('collapsed'); this.querySelector('.toggle-icon').textContent = this.parentElement.classList.contains('collapsed') ? '▼' : '▲';">
        <span>GAME SETTINGS</span>
        <span class="toggle-icon">▼</span>
      </h2>
      <div class="panel-body">
        
        <h3 style="font-family:'Press Start 2P',cursive;font-size:14px;color:var(--dark);margin-bottom:12px;border-bottom:3px solid var(--dark);padding-bottom:8px;">ANIMATIONS</h3>
        <div style="background:var(--sky4);border:3px solid var(--dark);padding:12px;margin-bottom:24px;">
          <p style="font-size:16px;color:var(--dark);margin-bottom:12px;">Configure custom Player Sprite and Attack Animation (upload horizontal spritesheets).</p>
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            <div class="field" style="flex:1;min-width:200px;">
              <label>Player Sprite (Idle/Fly)</label>
              <input type="file" id="gsetSpriteFile" accept="image/*">
              <img id="gsetSpritePreview" src="" style="max-width:100%; height:auto; margin-top:8px; display:none; border:2px solid var(--dark); image-rendering:pixelated;">
              <div style="display:flex;gap:8px;margin-top:8px;">
                <div style="flex:1"><label style="font-size:12px;">Frames</label><input type="number" id="gsetSpriteFrames" min="1" value="1"></div>
                <div style="flex:1"><label style="font-size:12px;">FPS</label><input type="number" id="gsetSpriteFps" min="1" value="12"></div>
              </div>
              <label style="font-size:12px;margin-top:8px;display:flex;align-items:center;gap:4px;"><input type="checkbox" id="gsetSpriteLoop" checked> Loop Animation</label>
            </div>
            <div class="field" style="flex:1;min-width:200px;">
              <label>Player Attack Sprite</label>
              <input type="file" id="gsetAttackFile" accept="image/*">
              <img id="gsetAttackPreview" src="" style="max-width:100%; height:auto; margin-top:8px; display:none; border:2px solid var(--dark); image-rendering:pixelated;">
              <div style="display:flex;gap:8px;margin-top:8px;">
                <div style="flex:1"><label style="font-size:12px;">Frames</label><input type="number" id="gsetAttackFrames" min="1" value="1"></div>
                <div style="flex:1"><label style="font-size:12px;">FPS</label><input type="number" id="gsetAttackFps" min="1" value="15"></div>
              </div>
              <label style="font-size:12px;margin-top:8px;display:flex;align-items:center;gap:4px;"><input type="checkbox" id="gsetAttackLoop"> Loop Animation</label>
            </div>
          </div>
        </div>

        <h3 style="font-family:'Press Start 2P',cursive;font-size:14px;color:var(--dark);margin-bottom:12px;border-bottom:3px solid var(--dark);padding-bottom:8px;">BALANCE & MECHANICS</h3>
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
                <!-- Filled by JS generateIconOptions -->
              </select>
            </div>
          </div>
        </div>
        
        <button class="submit-btn" id="saveGameSettingsBtn" onclick="saveGameSettings()">SAVE GAME SETTINGS</button>
        <div class="progress-bar" id="gsetProgressBar"><div class="progress-fill" id="gsetProgressFill"></div></div>
        <p class="form-msg" id="gsetMsg"></p>
      </div>
    </div>
`;

html = html.replace('<!-- Add Work Panel -->', newGameSettingsPanel + '\n    <!-- Add Work Panel -->');

// 3. Add to renderSettingsUI for the new values
const newRenderSettings = `  if (!settings.game) settings.game = {};
  document.getElementById('gsetFwDrop').value = settings.game.fwDropChance !== undefined ? settings.game.fwDropChance : 10;
  document.getElementById('gsetPtsHit').value = settings.game.pointsPerHit !== undefined ? settings.game.pointsPerHit : 15;
  document.getElementById('gsetMissPen').value = settings.game.missPenalty !== undefined ? settings.game.missPenalty : 5;
  
  const fwIconSelect = document.getElementById('gsetFwIcon');
  if(fwIconSelect) {
    fwIconSelect.innerHTML = generateIconOptions(settings.game.fwIconId);
  }
`;

html = html.replace(/document\.getElementById\('gsetAttackLoop'\)\.checked = settings\.game\.playerAttackLoop === true; \/\/ default false/g,
  "document.getElementById('gsetAttackLoop').checked = settings.game.playerAttackLoop === true;\n" + newRenderSettings);

// 4. Create saveGameSettings() function
const saveGameSettingsFn = `
async function saveGameSettings() {
  const btn=document.getElementById('saveGameSettingsBtn');
  const bar=document.getElementById('gsetProgressBar');
  const fill=document.getElementById('gsetProgressFill');
  const msg=document.getElementById('gsetMsg');

  btn.disabled=true; bar.style.display='block'; fill.style.width='10%';
  msg.className='form-msg ok'; msg.textContent='Saving Game Settings...';

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

    settings.game.fwDropChance = parseInt(document.getElementById('gsetFwDrop').value) || 0;
    settings.game.pointsPerHit = parseInt(document.getElementById('gsetPtsHit').value) || 15;
    settings.game.missPenalty = parseInt(document.getElementById('gsetMissPen').value) || 5;
    settings.game.fwIconId = document.getElementById('gsetFwIcon').value || '';

    const json=JSON.stringify(settings,null,2);
    const result=await ghPut(JSON_PATH, json, 'Update Game Settings', settingsSha);
    settingsSha=result.content.sha;

    fill.style.width='100%';
    msg.textContent='Game Settings saved!';
    setTimeout(()=>{bar.style.display='none';msg.textContent='';},3000);
  }catch(e){
    msg.className='form-msg err';
    msg.textContent='Error: '+e.message;
    bar.style.display='none';
  }finally{
    btn.disabled=false;
  }
}
`;

html = html.replace(/\/\/ ── Add work ──/, saveGameSettingsFn + '\n// ── Add work ──');

// 5. Remove the old gSprite saving logic from saveSettings() to prevent duplicate uploads
html = html.replace(/if\(!settings\.game\).*?settings\.game\.playerAttackLoop.*?checked;/s, '');

fs.writeFileSync('admin.html', html, 'utf-8');
console.log('admin.html updated');
