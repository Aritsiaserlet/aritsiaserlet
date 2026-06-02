const fs = require('fs');

let indexHtml = fs.readFileSync('index.html', 'utf-8');

// 1. Remove old modalTeamBtnContainer and old JS logic for team population.
// We will replace the entire block of JS that populates the team.
const oldJsStart = '// Populate Team\n  const tbc = document.getElementById(\'modalTeamBtnContainer\');';
const oldJsEnd = '    }\n  }\n';

if (indexHtml.includes(oldJsStart) && indexHtml.includes(oldJsEnd)) {
  const p1 = indexHtml.substring(0, indexHtml.indexOf(oldJsStart));
  const p2 = indexHtml.substring(indexHtml.indexOf(oldJsEnd) + oldJsEnd.length);
  indexHtml = p1 + p2;
}

// 2. Remove old modalTeamBtnContainer HTML
const oldBtnHtml = '      <div id="modalTeamBtnContainer" style="margin-top:16px; display:none;">\n         <button class="nav-btn" onclick="toggleTeamPopup()" style="background:var(--sky4); color:var(--dark); font-size:16px; padding:8px 16px;">👥 TEAM</button>\n      </div>';
if (indexHtml.includes(oldBtnHtml)) {
  indexHtml = indexHtml.replace(oldBtnHtml, '');
}

// 3. Inject new Team logic right after wLinks parsing.
// The new logic will append the TEAM button directly to linksContainer.
const linksLogicTarget = '    });\n  }';
if (indexHtml.includes(linksLogicTarget)) {
  const newTeamJs = `
  // Render Team Button in Links Container
  const tpList = document.getElementById('teamPopupList');
  if (w.team && w.team.length > 0 && window.settingsData && window.settingsData.teams) {
    // Collect full team member objects
    const teamMembers = w.team.map(id => window.settingsData.teams.find(t => t.id === id)).filter(Boolean);
    if (teamMembers.length > 0) {
      linksContainer.innerHTML += \`
        <button onclick="toggleTeamPopup()" style="display:inline-flex;gap:8px;align-items:center;padding:10px 18px;border:3px solid var(--dark);background:#d0eaff;font-family:'VT323',monospace;font-size:24px;color:var(--dark);box-shadow:4px 4px 0 var(--dark);cursor:pointer;margin-right:12px;margin-bottom:12px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#4B0082"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
          TEAM
        </button>
      \`;
      
      // Populate Team Popup List
      if (tpList) {
        tpList.innerHTML = '';
        teamMembers.forEach(member => {
          let iconHtml = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
          if (member.iconId && window.settingsData.icons) {
            const ic = window.settingsData.icons.find(x => x.id === member.iconId);
            if (ic) iconHtml = \`<img src="\${ic.url}" style="width:24px;height:24px;object-fit:cover;image-rendering:pixelated;">\`;
          }
          let content = \`
            <div style="display:flex; align-items:center; gap:12px; background:var(--sky4); padding:12px; border:2px solid var(--dark);">
              \${iconHtml}
              <div style="flex:1; font-family:'Press Start 2P', cursive; font-size:12px; color:var(--dark);">\${member.name}</div>
            </div>
          \`;
          if (member.url) {
            tpList.innerHTML += \`<a href="\${member.url}" target="_blank" rel="noopener" style="text-decoration:none; color:inherit; display:block;">\${content}</a>\`;
          } else {
            tpList.innerHTML += content;
          }
        });
      }
    } else {
      document.getElementById('teamPopup').style.display = 'none';
    }
  } else {
    document.getElementById('teamPopup').style.display = 'none';
  }
`;
  indexHtml = indexHtml.replace(linksLogicTarget, linksLogicTarget + '\n' + newTeamJs);
}

fs.writeFileSync('index.html', indexHtml, 'utf-8');
console.log('index.html updated for Team feature.');
