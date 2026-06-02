const fs = require('fs');

let adminHtml = fs.readFileSync('admin.html', 'utf-8');

// 1. Add TEAM LIBRARY Panel
const soundLibTarget = '<!-- Sound Library Panel -->';
const teamLibHtml = `
    <!-- Team Library Panel -->
    <div class="panel-card collapsed" style="grid-column: 1 / -1;">
      <h2 onclick="this.parentElement.classList.toggle('collapsed'); this.querySelector('.toggle-icon').textContent = this.parentElement.classList.contains('collapsed') ? '▼' : '▲';">
        <span>TEAM LIBRARY</span>
        <span class="toggle-icon">▼</span>
      </h2>
      <div class="panel-body">
        <p style="font-size:16px;color:var(--mid);margin-bottom:16px;">Manage your team members here. You can pick them when adding a Work.</p>
        
        <div id="teamLibraryList" style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
          <!-- Filled by JS -->
        </div>
        
        <div style="border:3px solid var(--dark);background:var(--sky4);padding:12px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
          <input type="text" id="newTeamName" placeholder="Name (e.g. John)" style="flex:1;min-width:150px;padding:8px;font-family:'VT323';font-size:20px;border:3px solid var(--dark);">
          <input type="url" id="newTeamLink" placeholder="Link URL" style="flex:1;min-width:150px;padding:8px;font-family:'VT323';font-size:20px;border:3px solid var(--dark);">
          <select id="newTeamIcon" style="width:150px;padding:8px;font-family:'VT323';font-size:20px;border:3px solid var(--dark);">
            <option value="">-- Icon --</option>
          </select>
          <button class="anav-btn" onclick="addTeamLibraryMember()">ADD MEMBER</button>
        </div>
      </div>
    </div>
`;
if (adminHtml.includes(soundLibTarget)) {
  adminHtml = adminHtml.replace(soundLibTarget, teamLibHtml + '\n    ' + soundLibTarget);
}

// 2. Change Team picker in Add Work form
const teamFormTarget = '<div id="wTeamBox" style="display:flex;flex-direction:column;gap:8px;margin-bottom:8px;"></div>\n          <button class="anav-btn" onclick="addTeamMember()">+ ADD TEAM MEMBER</button>';
const newTeamForm = `<div style="font-size:14px;color:var(--mid);margin-bottom:8px">Select team members from your Team Library</div>
          <div id="teamCheckboxList" style="display:flex;flex-wrap:wrap;gap:12px;border:3px solid var(--dark);padding:12px;background:var(--sky4);max-height:150px;overflow-y:auto;">
            <!-- Filled by JS -->
          </div>`;
if (adminHtml.includes(teamFormTarget)) {
  adminHtml = adminHtml.replace(teamFormTarget, newTeamForm);
}

// 3. Inject JS logic for Team Library
const saveSettingsTarget = 'if(!settings.icons) settings.icons = [];';
const loadTeamsJs = `
  if(!settings.teams) settings.teams = [];
`;
if (adminHtml.includes(saveSettingsTarget)) {
  adminHtml = adminHtml.replace(saveSettingsTarget, saveSettingsTarget + '\n' + loadTeamsJs);
}

const renderSettingsTarget = 'renderIcons();';
if (adminHtml.includes(renderSettingsTarget)) {
  adminHtml = adminHtml.replace(renderSettingsTarget, renderSettingsTarget + '\n  renderTeamLibrary();\n  updateTeamIconDropdown();\n  renderTeamCheckboxList();');
}

const jsFunctionsTarget = 'function renderIcons() {';
const teamFunctionsJs = `
function updateTeamIconDropdown() {
  const sel = document.getElementById('newTeamIcon');
  if(!sel) return;
  sel.innerHTML = '<option value="">-- Icon --</option>';
  if(settings.icons) {
    settings.icons.forEach(ic => {
      sel.innerHTML += \`<option value="\${ic.id}">\${ic.name}</option>\`;
    });
  }
}

function renderTeamLibrary() {
  const box = document.getElementById('teamLibraryList');
  if(!box) return;
  box.innerHTML = '';
  if(!settings.teams) settings.teams = [];
  settings.teams.forEach((tm, i) => {
    let iconUrl = '';
    if(tm.iconId && settings.icons) {
      const ic = settings.icons.find(x => x.id === tm.iconId);
      if(ic) iconUrl = ic.url;
    }
    const iconHtml = iconUrl ? \`<img src="\${iconUrl}" style="width:24px;height:24px;object-fit:cover;image-rendering:pixelated;">\` : \`<div style="width:24px;height:24px;background:var(--mid);"></div>\`;
    
    box.innerHTML += \`
      <div style="border:3px solid var(--dark);padding:8px 12px;background:var(--white);display:flex;gap:12px;align-items:center;">
        \${iconHtml}
        <div>
          <div style="font-family:'Press Start 2P', cursive; font-size:12px; color:var(--dark);">\${tm.name}</div>
          <div style="font-family:'VT323'; font-size:16px; color:var(--mid);">\${tm.url || 'No URL'}</div>
        </div>
        <button class="anav-btn danger" style="padding:4px 8px;font-size:14px;min-width:0;margin-left:auto;" onclick="removeTeamLibraryMember(\${i})">X</button>
      </div>
    \`;
  });
  renderTeamCheckboxList(); // update picker too
}

function addTeamLibraryMember() {
  const n = document.getElementById('newTeamName').value.trim();
  const u = document.getElementById('newTeamLink').value.trim();
  const ic = document.getElementById('newTeamIcon').value;
  if(!n) return alert('Name required');
  if(!settings.teams) settings.teams = [];
  settings.teams.push({ id: 'tm_' + Date.now(), name: n, url: u, iconId: ic });
  
  document.getElementById('newTeamName').value = '';
  document.getElementById('newTeamLink').value = '';
  document.getElementById('newTeamIcon').value = '';
  
  renderTeamLibrary();
  saveSettings();
}

function removeTeamLibraryMember(idx) {
  if(!confirm('Remove this team member?')) return;
  settings.teams.splice(idx, 1);
  renderTeamLibrary();
  saveSettings();
}

let selectedTeams = [];

function renderTeamCheckboxList() {
  const box = document.getElementById('teamCheckboxList');
  if(!box) return;
  box.innerHTML = '';
  if(!settings.teams) settings.teams = [];
  settings.teams.forEach(tm => {
    const isChecked = selectedTeams.includes(tm.id);
    let iconUrl = '';
    if(tm.iconId && settings.icons) {
      const ic = settings.icons.find(x => x.id === tm.iconId);
      if(ic) iconUrl = ic.url;
    }
    const iconHtml = iconUrl ? \`<img src="\${iconUrl}" style="width:16px;height:16px;object-fit:cover;image-rendering:pixelated;margin-right:6px;">\` : \`<div style="width:16px;height:16px;background:var(--mid);margin-right:6px;"></div>\`;
    
    box.innerHTML += \`
      <label style="display:flex;align-items:center;background:var(--white);padding:6px 10px;border:2px solid var(--dark);cursor:pointer;user-select:none;">
        <input type="checkbox" value="\${tm.id}" \${isChecked ? 'checked' : ''} onchange="toggleTeamSelection('\${tm.id}', this.checked)" style="margin-right:8px;accent-color:var(--dark);width:16px;height:16px;">
        \${iconHtml}
        <span style="font-family:'Press Start 2P', cursive; font-size:10px;">\${tm.name}</span>
      </label>
    \`;
  });
}

function toggleTeamSelection(id, isChecked) {
  if(isChecked) {
    if(!selectedTeams.includes(id)) selectedTeams.push(id);
  } else {
    selectedTeams = selectedTeams.filter(x => x !== id);
  }
}
`;
if (adminHtml.includes(jsFunctionsTarget)) {
  adminHtml = adminHtml.replace(jsFunctionsTarget, teamFunctionsJs + '\n' + jsFunctionsTarget);
}

// 4. Update editWork and saveWorks for Team Picker
// Find editWork
const editWorkTarget = 'currentTeam = JSON.parse(JSON.stringify(w.team));\n  } else {\n    currentTeam = [];\n  }\n  window.renderTeam();';
if (adminHtml.includes(editWorkTarget)) {
  adminHtml = adminHtml.replace(editWorkTarget, `
  if(w.team) {
    // legacy array of objects check
    if (w.team.length > 0 && typeof w.team[0] === 'object') {
      // Map legacy to nothing for now, or you could do it if you want. We assume new saves use IDs.
      selectedTeams = [];
    } else {
      selectedTeams = [...w.team];
    }
  } else {
    selectedTeams = [];
  }
  renderTeamCheckboxList();
  `);
}
// Note: we should also remove window.addTeamMember, window.removeTeamMember, window.renderTeam completely.
// Let's replace the whole block of those functions:
const oldTeamCodeStart = 'let currentTeam = [];';
const oldTeamCodeEnd = '        <button class="game-btn" onclick="window.removeTeamMember(${i})" style="padding:4px 8px; font-size:12px; background:var(--danger); color:white;">X</button>\n      </div>\n    `;\n  });\n};';
if (adminHtml.includes(oldTeamCodeStart)) {
  const adminHtmlPart1 = adminHtml.substring(0, adminHtml.indexOf(oldTeamCodeStart));
  const adminHtmlPart2 = adminHtml.substring(adminHtml.indexOf(oldTeamCodeEnd) + oldTeamCodeEnd.length);
  adminHtml = adminHtmlPart1 + adminHtmlPart2;
}

// Update saveWork logic (currently it says `team: currentTeam.filter...`)
const saveLogic1 = 'team: currentTeam.filter(t => t.name.trim() !== \'\'),';
if (adminHtml.includes(saveLogic1)) {
  adminHtml = adminHtml.split(saveLogic1).join('team: selectedTeams,');
}

fs.writeFileSync('admin.html', adminHtml, 'utf-8');
console.log('admin.html updated for Team Library.');
