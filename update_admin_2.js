const fs = require('fs');

let html = fs.readFileSync('admin.html', 'utf-8');

const additions = `
  // Render Categories
  const catsBox = document.getElementById('catsList');
  if (catsBox && settings.categories) {
    catsBox.innerHTML = '';
    const catsArray = Object.keys(settings.categories).map(k => ({id:k, ...settings.categories[k]}));
    catsArray.forEach((cat, idx) => {
      catsBox.innerHTML += \`
        <div style="background:var(--sky4);border:3px solid var(--dark);padding:12px;display:flex;flex-direction:column;gap:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-family:'Press Start 2P',cursive;font-size:12px;">\${cat.id.toUpperCase()}</span>
          </div>
          <input type="text" value="\${cat.name || ''}" onchange="settings.categories['\${cat.id}'].name=this.value" placeholder="Display Name" style="padding:8px;border:3px solid var(--dark);font-family:'VT323';font-size:18px;">
          <input type="text" value="\${cat.folder || ''}" onchange="settings.categories['\${cat.id}'].folder=this.value" placeholder="Folder Name" style="padding:8px;border:3px solid var(--dark);font-family:'VT323';font-size:18px;">
          <textarea onchange="settings.categories['\${cat.id}'].description=this.value" placeholder="Description" style="padding:8px;border:3px solid var(--dark);font-family:'VT323';font-size:16px;min-height:60px;">\${cat.description || ''}</textarea>
        </div>
      \`;
    });
  }

  // Render Socials
  const socBox = document.getElementById('socialsList');
  if (socBox) {
    socBox.innerHTML = '';
    if (settings.socials) {
      settings.socials.forEach((soc, idx) => {
        const iconOptions = (settings.icons || []).map(icon => 
          \`<option value="\${icon.id}" \${soc.iconId === icon.id ? 'selected' : ''}>\${icon.name}</option>\`
        ).join('');
        socBox.innerHTML += \`
          <div style="background:var(--sky4);border:3px solid var(--dark);padding:12px;display:flex;flex-direction:column;gap:8px;position:relative;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-family:'Press Start 2P',cursive;font-size:10px;">Link \${idx+1}</span>
              <button onclick="removeSocialLink(\${idx})" style="background:var(--danger);color:white;border:3px solid var(--dark);padding:4px 8px;cursor:pointer;font-family:'VT323';font-size:16px;">X</button>
            </div>
            <input type="text" value="\${soc.name || ''}" onchange="settings.socials[\${idx}].name=this.value" placeholder="Display Name (e.g. FACEBOOK)" style="padding:8px;border:3px solid var(--dark);font-family:'VT323';font-size:18px;">
            <input type="text" value="\${soc.url || ''}" onchange="settings.socials[\${idx}].url=this.value" placeholder="URL" style="padding:8px;border:3px solid var(--dark);font-family:'VT323';font-size:18px;">
            <select onchange="settings.socials[\${idx}].iconId=this.value" style="padding:8px;border:3px solid var(--dark);font-family:'VT323';font-size:18px;">
              <option value="">-- Select Icon --</option>
              \${iconOptions}
            </select>
          </div>
        \`;
      });
    }
  }
}
`;

html = html.replace('document.getElementById(\'gsetAttackLoop\').checked = settings.game.playerAttackLoop === true; // default false\n}', 'document.getElementById(\'gsetAttackLoop\').checked = settings.game.playerAttackLoop === true; // default false\n' + additions);

fs.writeFileSync('admin.html', html, 'utf-8');
