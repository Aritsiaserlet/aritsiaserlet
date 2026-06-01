const fs = require('fs');

let html = fs.readFileSync('admin.html', 'utf-8');

// Add variables for sprite uploads
html = html.replace('let bgBase64 = null;', 'let bgBase64 = null;\nlet gSpriteBase64 = null, gSpriteExt = "";\nlet gAttackBase64 = null, gAttackExt = "";');

// Add file listener for gsetSpriteFile
const file_listener = `
document.getElementById('gsetSpriteFile').addEventListener('change', function(e){
  const f = e.target.files[0];
  if(!f) return;
  gSpriteExt = f.name.split('.').pop();
  const reader = new FileReader();
  reader.onload = function(evt) {
    gSpriteBase64 = evt.target.result.split(',')[1];
    document.getElementById('gsetSpritePreview').src = evt.target.result;
    document.getElementById('gsetSpritePreview').style.display = 'block';
  };
  reader.readAsDataURL(f);
});

document.getElementById('gsetAttackFile').addEventListener('change', function(e){
  const f = e.target.files[0];
  if(!f) return;
  gAttackExt = f.name.split('.').pop();
  const reader = new FileReader();
  reader.onload = function(evt) {
    gAttackBase64 = evt.target.result.split(',')[1];
    document.getElementById('gsetAttackPreview').src = evt.target.result;
    document.getElementById('gsetAttackPreview').style.display = 'block';
  };
  reader.readAsDataURL(f);
});
`;
html = html.replace("document.getElementById('bgFileInput').addEventListener('change', function(e){", file_listener + "\ndocument.getElementById('bgFileInput').addEventListener('change', function(e){");

// Update renderSettingsUI
const renderSettingsReplacement = `
function renderSettingsUI() {
  document.getElementById('sTitle').value = settings.title || '';
  document.getElementById('sDesc').value = settings.description || '';
  document.getElementById('sAbout').value = settings.aboutText || '';
  document.getElementById('sLinks').value = settings.socialLinks ? settings.socialLinks.join('\\n') : '';
  if (settings.profileImage) {
    document.getElementById('profilePreview').src = settings.profileImage;
    document.getElementById('profilePreview').style.display = 'block';
  }
  if (settings.backgroundImage) {
    document.getElementById('bgPreview').src = settings.backgroundImage;
    document.getElementById('bgPreview').style.display = 'block';
  }
  
  // Render Game Settings
  if (!settings.game) settings.game = {};
  if (settings.game.playerSprite) {
    document.getElementById('gsetSpritePreview').src = settings.game.playerSprite;
    document.getElementById('gsetSpritePreview').style.display = 'block';
  }
  document.getElementById('gsetSpriteFrames').value = settings.game.playerSpriteFrames || 1;
  document.getElementById('gsetSpriteFps').value = settings.game.playerSpriteFps || 12;
  document.getElementById('gsetSpriteLoop').checked = settings.game.playerSpriteLoop !== false; // default true
  
  if (settings.game.playerAttackSprite) {
    document.getElementById('gsetAttackPreview').src = settings.game.playerAttackSprite;
    document.getElementById('gsetAttackPreview').style.display = 'block';
  }
  document.getElementById('gsetAttackFrames').value = settings.game.playerAttackFrames || 1;
  document.getElementById('gsetAttackFps').value = settings.game.playerAttackFps || 15;
  document.getElementById('gsetAttackLoop').checked = settings.game.playerAttackLoop === true; // default false
}`;
html = html.replace(/function renderSettingsUI\(\)\s*\{[\s\S]*?\n\}/, renderSettingsReplacement);

// Update saveSettings
const saveSettingsAdditions = `
    if(bgBase64){
      msg.textContent='Uploading background image...';
      const fname=\`works/bg_\${Date.now()}.\${bgExt}\`;
      await ghPutBinary(fname, bgBase64, 'Update background image');
      settings.backgroundImage=\`https://raw.githubusercontent.com/\${GH_USER}/\${GH_REPO}/main/\${fname}\`;
      fill.style.width='50%';
    }
    
    if (!settings.game) settings.game = {};
    if(gSpriteBase64){
      msg.textContent='Uploading Player Sprite...';
      const fname=\`works/sprite_\${Date.now()}.\${gSpriteExt}\`;
      await ghPutBinary(fname, gSpriteBase64, 'Upload Player Sprite');
      settings.game.playerSprite=\`https://raw.githubusercontent.com/\${GH_USER}/\${GH_REPO}/main/\${fname}\`;
    }
    if(gAttackBase64){
      msg.textContent='Uploading Attack Sprite...';
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
`;
html = html.replace(/if\(bgBase64\)\{[\s\S]*?fill\.style\.width='50%';\s*\}/, saveSettingsAdditions);

fs.writeFileSync('admin.html', html, 'utf-8');
