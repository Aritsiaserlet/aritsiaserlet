const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf-8');

const regex = /\/\/ Render Categories[\s\S]*?\}\n\}\n/m;

const replacement = `  // Render Categories
  const catsBox = document.getElementById('catsList');
  if (catsBox) {
    catsBox.innerHTML = '';
    if (settings.categories) {
      ['game', 'mod', '3d'].forEach(id => {
        const c = settings.categories[id] || {};
        const defaultName = id === 'game' ? 'GAME' : (id === 'mod' ? 'MINECRAFT MOD' : '3D MODEL');
        
        let iconUrl = '';
        if (c.iconId && settings.icons) {
          const ic = settings.icons.find(x => x.id === c.iconId);
          if(ic) iconUrl = ic.url;
        }
        
        catsBox.innerHTML += \`
        <div style="border:3px solid var(--dark);padding:12px;background:var(--sky4);">
          <div style="font-weight:bold;margin-bottom:8px;text-transform:uppercase;color:var(--dark);font-family:'Press Start 2P',cursive;font-size:12px;">\${id}</div>
          <div class="field" style="margin-bottom:8px;">
            <input type="text" id="catName_\${id}" value="\${c.name==id.toUpperCase() ? defaultName : c.name}" onchange="settings.categories['\${id}'].name=this.value" placeholder="Display Name">
          </div>
          <div style="margin-bottom:8px;display:flex;align-items:center;gap:8px;">
            <select onchange="settings.categories['\${id}'].iconId=this.value; renderSettingsUI()" style="padding:4px;font-family:'VT323';font-size:18px;border:3px solid var(--dark);flex:1;">
              \${generateIconOptions(c.iconId)}
            </select>
            \${iconUrl ? \`<img src="\${iconUrl}" style="width:28px;height:28px;object-fit:cover;image-rendering:pixelated;border:2px solid var(--dark);">\` : \`<div style="width:28px;height:28px;border:2px dashed var(--mid);background:var(--white);"></div>\`}
          </div>
        </div>
      \`;
      });
    }
  }

  // Render Socials
  const socBox = document.getElementById('socialsList');
  if (socBox) {
    socBox.innerHTML = '';
    if(!settings.socials) settings.socials = [];
    settings.socials.forEach((s, idx) => {
      let iconUrl = '';
      if (s.iconId && settings.icons) {
        const ic = settings.icons.find(x => x.id === s.iconId);
        if(ic) iconUrl = ic.url;
      }

      socBox.innerHTML += \`
        <div style="background:var(--sky4);border:3px solid var(--dark);padding:12px;display:flex;justify-content:space-between;align-items:center;gap:12px;">
          <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
            <input type="text" value="\${s.name || ''}" onchange="settings.socials[\${idx}].name=this.value" placeholder="Name (e.g. itch.io)" style="width:100%;padding:8px;font-family:'VT323';font-size:20px;border:3px solid var(--dark);margin-bottom:8px;">
            <input type="url" value="\${s.url || ''}" onchange="settings.socials[\${idx}].url=this.value" placeholder="https://..." style="width:100%;padding:8px;font-family:'VT323';font-size:20px;border:3px solid var(--dark);">
          </div>
          <div style="width:200px;display:flex;align-items:center;gap:8px;">
            <select onchange="settings.socials[\${idx}].iconId=this.value; renderSettingsUI()" style="flex:1;padding:4px;font-family:'VT323';font-size:18px;border:3px solid var(--dark);">
              \${generateIconOptions(s.iconId)}
            </select>
            \${iconUrl ? \`<img src="\${iconUrl}" style="width:40px;height:40px;object-fit:cover;image-rendering:pixelated;border:2px solid var(--dark);">\` : \`<div style="width:40px;height:40px;border:2px dashed var(--mid);background:var(--white);flex-shrink:0;"></div>\`}
          </div>
          <button class="anav-btn danger" onclick="removeSocialLink(\${idx})" style="padding:8px 12px;align-self:flex-start;">X</button>
        </div>
      \`;
    });
  }
}
`;

html = html.replace(regex, replacement);
fs.writeFileSync('admin.html', html, 'utf-8');
