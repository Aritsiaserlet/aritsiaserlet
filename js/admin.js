// =============================================================================
// ARITSIA PORTFOLIO - Admin Panel JavaScript
// admin.js
// =============================================================================

// ── Config ──
const GH_USER = 'Aritsiaserlet';
const GH_REPO = 'aritsiaserlet';

const API     = `https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents`;
const JSON_PATH = 'settings.json';
let GH_TOKEN  = '';
function getHeaders(){
  return {
    'Authorization': `token ${GH_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };
}

// ── Pixel particles ──
const canvas = document.getElementById('windCanvas');
const ctx = canvas.getContext('2d');
let W, H, particles = [];
function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight}
resize();window.addEventListener('resize',resize);
function rb(a,b){return a+Math.random()*(b-a)}
function createParticle(yStart){
  const size = Math.floor(rb(2, 6)) * 2;
  return {x:Math.random()*W,y:yStart??H+size,size:size,speedY:rb(0.5,2.5),speedX:rb(-0.5,0.5),opacity:rb(0.1,0.6)};
}
for(let i=0;i<40;i++) particles.push(createParticle(Math.random()*H));
function animateParticles(){
  ctx.clearRect(0,0,W,H);
  particles.forEach((p,i)=>{
    p.y-=p.speedY; p.x+=p.speedX;
    ctx.fillStyle=`rgba(255,255,255,${p.opacity})`;
    ctx.fillRect(Math.floor(p.x),Math.floor(p.y),p.size,p.size);
    if(p.y+p.size<0) particles[i]=createParticle();
  }); requestAnimationFrame(animateParticles);
}
animateParticles();

// ── Auth ──
window.addEventListener('DOMContentLoaded', () => {
  const savedToken = sessionStorage.getItem('ghToken');
  if(!savedToken) {
    window.location.href = 'index.html';
  } else {
    GH_TOKEN = savedToken;
    document.getElementById('adminPanel').style.display = 'block';
    loadWorks();
    loadSettings();
  }
});

function logout(){
  GH_TOKEN='';
  sessionStorage.removeItem('ghToken');
  window.location.href = 'index.html';
}

// ── GitHub helpers ──
async function ghGet(path) {
  const r=await fetch(`${API}/${path}?t=${Date.now()}`,{headers:getHeaders()});
  if(r.status===404)return null;
  if(!r.ok)throw new Error(`GitHub error ${r.status}`);
  return r.json();
}

async function ghPut(path, content, message, sha){
  const body={message, content: btoa(unescape(encodeURIComponent(content)))};
  if(sha)body.sha=sha;
  let r=await fetch(`${API}/${path}`,{method:'PUT',headers:getHeaders(),body:JSON.stringify(body)});
  if(!r.ok) {
    if (r.status === 409) {
      // Auto-retry once on 409 Conflict by fetching the latest SHA
      const latest = await ghGet(path);
      if (latest && latest.sha) {
        body.sha = latest.sha;
        r = await fetch(`${API}/${path}`,{method:'PUT',headers:getHeaders(),body:JSON.stringify(body)});
      }
    }
    if(!r.ok) {
      const t=await r.text();throw new Error(`GitHub PUT error ${r.status}: ${t}`);
    }
  }
  return r.json();
}

async function ghPutBinary(path, base64content, message){
  // Always fetch existing SHA first to avoid 422
  let sha = undefined;
  try {
    const existing = await ghGet(path);
    if(existing && existing.sha) sha = existing.sha;
  } catch(e) { /* new file, no sha needed */ }
  const body={message, content: base64content};
  if(sha) body.sha = sha;
  const r=await fetch(`${API}/${path}`,{method:'PUT',headers:getHeaders(),body:JSON.stringify(body)});
  if(!r.ok){const t=await r.text();throw new Error(`GitHub PUT error ${r.status}: ${t}`)}
  return r.json();
}

async function ghDelete(path, message, sha){
  const r=await fetch(`${API}/${path}`,{method:'DELETE',headers:getHeaders(),body:JSON.stringify({message,sha})});
  if(!r.ok)throw new Error(`GitHub DELETE error ${r.status}`);
  return r.json();
}

// ── Load works.json ──
let works=[], worksSha=null;
let selectedTeams=[];

async function loadWorks(){
  try{
    const data=await ghGet('works.json');
    if(data){
      worksSha=data.sha;
      works=JSON.parse(decodeURIComponent(escape(atob(data.content.replace(/\n/g,'')))));
      window.ghConnected = true;
      document.getElementById('ghStatusBox').style.background = '#abebc6';
      document.getElementById('ghStatus').className='gh-status ok';
      document.getElementById('ghStatus').textContent='✓ Connected to GitHub';
    } else {
      works=[];worksSha=null;
    }
    renderAdminList();
    updateStats();
  } catch(e){
    window.ghConnected = false;
    document.getElementById('ghStatusBox').style.background = '#fadbd8';
    document.getElementById('ghStatus').className='gh-status err';
    document.getElementById('ghStatus').textContent='✗ GitHub connection failed';
    works=[];renderAdminList();
  }
}

let settings={}, settingsSha=null;
async function loadSettings(){
  try{
    const data=await ghGet(JSON_PATH);
    if(data){
      settingsSha=data.sha;
      settings=JSON.parse(decodeURIComponent(escape(atob(data.content.replace(/\n/g,'')))));
      if(settings.profileImage){
        setMediaPreview('profilePreview', settings.profileImage);
      }
      if(settings.profileFit) document.getElementById('profileFit').value = settings.profileFit;
      if(settings.profilePos) document.getElementById('profilePos').value = settings.profilePos;
      
      if(settings.backgroundImage){
        setMediaPreview('bgPreview', settings.backgroundImage);
      }
      if(settings.bgSize) document.getElementById('bgSize').value = settings.bgSize;
      if(settings.bgPos) document.getElementById('bgPos').value = settings.bgPos;
    }
  } catch(e){
    console.log('No settings.json found or error loading:', e);
  }
  renderIconLibrary();
  renderSettingsUI();
  renderToolsCheckboxList();
  renderSoundLibrary();
  renderSoundPicker();
  renderTeamLibrary();
  renderTeamCheckboxList();
}

async function saveWorks(){
  const json=JSON.stringify(works,null,2);
  const result=await ghPut('works.json', json, 'Update works.json', worksSha);
  worksSha=result.content.sha;
}

// ── Image ──
let currentImages = [];

function previewImage(input){
  if(!input.files || input.files.length===0) return;
  currentImages = [];
  const prev = document.getElementById('imgPreview');
  const extraWrap = document.getElementById('extraImgWrap');
  prev.innerHTML = '';
  extraWrap.innerHTML = '';
  extraWrap.style.display = 'none';
  
  let validFiles = Array.from(input.files).filter(f => f.size <= 4*1024*1024);
  if(validFiles.length < input.files.length) alert('Some images were too large (max 4MB) and were skipped.');
  if(validFiles.length === 0) {
    prev.innerHTML = `<span style="font-size:32px">🖼️</span><span style="font-size:16px;color:var(--dark)">Click to upload image</span>`;
    return;
  }

  let loadedCount = 0;
  validFiles.forEach((file, idx) => {
    const ext = file.name.split('.').pop().toLowerCase()||'jpg';
    const reader = new FileReader();
    reader.onload = e => {
      const full = e.target.result;
      const base64 = full.split(',')[1];
      // Keep track of order since it's async
      currentImages[idx] = { ext, base64 };
      loadedCount++;
      
      if (loadedCount === validFiles.length) {
        // All loaded, render them
        prev.innerHTML=`<img src="${currentImages[0].base64 ? 'data:image/'+currentImages[0].ext+';base64,'+currentImages[0].base64 : ''}" style="object-position:center 50%;width:100%;height:100%;object-fit:cover;position:absolute;inset:0">`;
        if (validFiles.length > 1) {
          prev.innerHTML += `<div style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.7);color:white;padding:4px 8px;font-size:16px;z-index:10;border-radius:4px;font-family:'VT323';">+${validFiles.length-1} more</div>`;
          extraWrap.style.display = 'flex';
          for (let i = 1; i < currentImages.length; i++) {
             const imgSrc = 'data:image/'+currentImages[i].ext+';base64,'+currentImages[i].base64;
             extraWrap.innerHTML += `<div style="min-width:60px; height:40px; border:2px solid var(--dark); border-radius:4px; overflow:hidden; box-shadow:2px 2px 0 var(--dark);">
               <img src="${imgSrc}" style="width:100%; height:100%; object-fit:cover;">
             </div>`;
          }
        }
        showFocalSlider(50);
        initAdminImgDrag();
      }
    };
    reader.readAsDataURL(file);
  });
}

function onCatChange(){
  const cat=document.getElementById('wCat').value;
  const sw=document.getElementById('subcatWrap');
  const mw=document.getElementById('modelWrap');
  const subcat=document.getElementById('wSubcat');
  
  if (cat) {
    sw.classList.add('visible');
    subcat.innerHTML = '<option value="">— select type —</option>';
    let options = [];
    if (cat === 'game') options = ['RPG', 'Action', 'Puzzle', 'Visual Novel', 'Platformer', 'Other'];
    if (cat === 'mod') options = ['Client-side', 'Server-side', 'Content', 'Utility', 'Other'];
    if (cat === '3d') options = ['Character', 'Building', 'Object', 'Creature', 'Other'];
    
    options.forEach(opt => {
      subcat.innerHTML += `<option value="${opt.toLowerCase()}">${opt}</option>`;
    });
  } else {
    sw.classList.remove('visible');
  }
  
  mw.style.display=cat==='3d'?'block':'none';
}

let currentModelBase64=null, currentModelName=null;
function onModelSelect(input){
  const file=input.files[0];
  if(!file)return;
  if(file.size>20*1024*1024){alert('Model too large (max 20MB).');input.value='';return}
  currentModelName=file.name;
  document.getElementById('modelName').textContent='✓ '+file.name+' ('+Math.round(file.size/1024)+'KB)';
  const reader=new FileReader();
  reader.onload=e=>{ currentModelBase64=e.target.result.split(',')[1]; };
  reader.readAsDataURL(file);
}

// ── Settings ──
let profileBase64=null, profileExt='png';
let bgBase64=null, bgExt='png';
let gSpriteBase64=null, gSpriteExt='png';
let gAttackBase64=null, gAttackExt='png';

async function addIconToLibrary() {
  const nameInput = document.getElementById('newIconName');
  const fileInput = document.getElementById('newIconFile');
  if(!nameInput.value.trim() || !fileInput.files[0]) {
    alert("Please provide a name and select an image.");
    return;
  }
  
  const file = fileInput.files[0];
  const ext = file.name.split('.').pop().toLowerCase()||'png';
  const reader = new FileReader();
  reader.onload = async e => {
    try {
      const base64 = e.target.result.split(',')[1];
      const id = 'icon_' + Date.now();
      const fname = `works/${id}.${ext}`;
      
      const btn = fileInput.nextElementSibling;
      const oldBtnText = btn.innerText;
      btn.innerText = "UPLOADING...";
      btn.disabled = true;
      
      await ghPutBinary(fname, base64, `Upload icon ${nameInput.value}`);
      const url = `https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/${fname}`;
      
      if(!settings.icons) settings.icons = [];

  if(!settings.teams) settings.teams = [];

      settings.icons.push({ id, name: nameInput.value.trim(), url });
      
      const json = JSON.stringify(settings, null, 2);
      const saveResult = await ghPut(JSON_PATH, json, 'Update settings.json with new icon', settingsSha);
      settingsSha = saveResult.content.sha;
      
      nameInput.value = '';
      fileInput.value = '';
      btn.innerText = oldBtnText;
      btn.disabled = false;
      
      renderIconLibrary();
      renderSettingsUI();
      renderToolsCheckboxList();
    } catch(err) {
      alert("Error uploading icon: " + err.message);
      fileInput.nextElementSibling.innerText = "UPLOAD ICON";
      fileInput.nextElementSibling.disabled = false;
    }
  };
  reader.readAsDataURL(file);
}

function renderIconLibrary() {
  const box = document.getElementById('iconLibraryList');
  if(!box) return;
  box.innerHTML = '';
  if(!settings.icons || settings.icons.length === 0) {
    box.innerHTML = '<div style="color:var(--mid);font-size:16px;">No icons uploaded yet.</div>';
    return;
  }
  settings.icons.forEach((ic, i) => {
    box.innerHTML += `
      <div style="border:3px solid var(--dark);background:var(--white);padding:8px;display:flex;flex-direction:column;align-items:center;width:100px;text-align:center;position:relative;">
        <button onclick="deleteIcon(${i})" style="position:absolute;top:-8px;right:-8px;background:var(--danger);color:white;border:3px solid var(--dark);width:24px;height:24px;cursor:pointer;font-weight:bold;font-size:12px;display:flex;align-items:center;justify-content:center;">X</button>
        <img src="${ic.url}" style="width:32px;height:32px;object-fit:cover;image-rendering:pixelated;margin-bottom:8px;">
        <span style="font-family:'VT323';font-size:16px;word-break:break-all;line-height:1;">${ic.name}</span>
      </div>
    `;
  });
}

async function deleteIcon(idx) {
  customConfirm("Delete this icon? It will be removed from any links or categories using it.", async () => {
    settings.icons.splice(idx, 1);
    try {
      const json = JSON.stringify(settings, null, 2);
      const res = await ghPut(JSON_PATH, json, 'Delete icon from library', settingsSha);
      settingsSha = res.content.sha;
      renderIconLibrary();
      renderSettingsUI();
      renderToolsCheckboxList();
    } catch(e) {
      alert("Error deleting icon: " + e.message);
    }
  });
}

function generateIconOptions(selectedId) {
  let html = `<option value="">-- No Icon --</option>`;
  if(settings.icons) {
    settings.icons.forEach(ic => {
      const sel = (ic.id === selectedId) ? 'selected' : '';
      html += `<option value="${ic.id}" ${sel}>${ic.name}</option>`;
    });
  }
  return html;
}

function renderToolsCheckboxList() {
  const box = document.getElementById('toolsCheckboxList');
  if(!box) return;
  box.innerHTML = '';
  if(!settings.icons || settings.icons.length === 0) {
    box.innerHTML = '<div style="color:var(--dark);font-size:16px;">No icons available. Add some in the Icon Library.</div>';
    return;
  }
  const activeTools = (editingId && works.find(x=>x.id===editingId) && works.find(x=>x.id===editingId).tools) ? works.find(x=>x.id===editingId).tools : [];
  settings.icons.forEach(ic => {
    const checked = activeTools.includes(ic.id) ? 'checked' : '';
    box.innerHTML += `
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;background:var(--white);padding:4px 8px;border:2px solid var(--dark);">
        <input type="checkbox" value="${ic.id}" class="tool-checkbox" ${checked}>
        <img src="${ic.url}" style="width:20px;height:20px;object-fit:cover;image-rendering:pixelated;">
        <span style="font-family:'VT323';font-size:18px;">${ic.name}</span>
      </label>
    `;
  });
}

// ── Sound Library ──────────────────────────────────────
const SOUND_EVENTS = [
  { key: 'game_hit',       label: 'Game: Hit Enemy' },
  { key: 'game_score',     label: 'Game: Score Point' },
  { key: 'game_combo',     label: 'Game: Combo!' },
  { key: 'game_dive',      label: 'Game: Dive' },
  { key: 'game_boost',     label: 'Game: Boost Activate' },
  { key: 'game_miss',      label: 'Game: Miss Penalty' },
  { key: 'game_gameover',  label: 'Game: Game Over' },
  { key: 'game_bgm',       label: 'Game: Background Music (loops)' },
  { key: 'lobby_bgm',      label: 'Game Lobby: Background Music (loops)' },
  { key: 'portfolio_like', label: 'Portfolio: Like' },
  { key: 'portfolio_login',label: 'Portfolio: Login' },
  { key: 'portfolio_btn',  label: 'Portfolio: Button Click' },
  { key: 'portfolio_bgm',  label: 'Portfolio: Background Music (loops)' },
];

async function addSoundToLibrary() {
  const nameInput = document.getElementById('newSoundName');
  const fileInput = document.getElementById('newSoundFile');
  if(!nameInput.value.trim() || !fileInput.files[0]) {
    alert('Please provide a name and select an audio file.');
    return;
  }
  const file = fileInput.files[0];
  const ext = file.name.split('.').pop().toLowerCase() || 'mp3';
  const reader = new FileReader();
  reader.onload = async e => {
    try {
      const base64 = e.target.result.split(',')[1];
      const id = 'snd_' + Date.now();
      const fname = `works/${id}.${ext}`;
      const btn = document.querySelector('#soundLibraryPanel .anav-btn');
      btn.textContent = 'UPLOADING...'; btn.disabled = true;
      await ghPutBinary(fname, base64, `Upload sound ${nameInput.value}`);
      const url = `https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/${fname}`;
      if(!settings.sounds) settings.sounds = [];
      settings.sounds.push({ id, name: nameInput.value.trim(), url });
      const json = JSON.stringify(settings, null, 2);
      const saveResult = await ghPut(JSON_PATH, json, 'Update settings.json with new sound', settingsSha);
      settingsSha = saveResult.content.sha;
      nameInput.value = ''; fileInput.value = '';
      btn.textContent = 'UPLOAD SOUND'; btn.disabled = false;
      renderSoundLibrary();
      renderSoundPicker();
    } catch(err) {
      alert('Error uploading sound: ' + err.message);
      const btn = document.querySelector('#soundLibraryPanel .anav-btn');
      btn.textContent = 'UPLOAD SOUND'; btn.disabled = false;
    }
  };
  reader.readAsDataURL(file);
}

let volumeSaveTimeout = null;
window.updateSoundVolume = function(idx, val) {
  if (!settings.sounds[idx]) return;
  settings.sounds[idx].volume = parseInt(val, 10);
  
  if (volumeSaveTimeout) clearTimeout(volumeSaveTimeout);
  volumeSaveTimeout = setTimeout(async () => {
    try {
      // Always fetch latest SHA to prevent 409 before saving
      const latest = await ghGet(JSON_PATH);
      if (latest && latest.sha) settingsSha = latest.sha;
      
      const json = JSON.stringify(settings, null, 2);
      const res = await ghPut(JSON_PATH, json, 'Update sound volume', settingsSha);
      settingsSha = res.content.sha;
    } catch (e) {
      console.error("Volume save error:", e);
      alert("Error updating volume: " + e.message);
    }
  }, 1000); // 1-second debounce
};

function renderSoundLibrary() {
  const box = document.getElementById('soundLibraryList');
  if(!box) return;
  box.innerHTML = '';
  const sounds = settings.sounds || [];
  if(sounds.length === 0) {
    box.innerHTML = '<div style="color:var(--mid);font-size:16px;">No sounds uploaded yet.</div>';
    return;
  }
  sounds.forEach((snd, i) => {
    const vol = snd.volume !== undefined ? snd.volume : 100;
    box.innerHTML += `
      <div style="border:3px solid var(--dark);background:var(--white);padding:10px;width:160px;position:relative;text-align:center;display:flex;flex-direction:column;align-items:center;">
        <button onclick="deleteSound(${i})" style="position:absolute;top:-8px;right:-8px;background:var(--danger);color:white;border:3px solid var(--dark);width:24px;height:24px;cursor:pointer;font-weight:bold;font-size:12px;display:flex;align-items:center;justify-content:center;z-index:2;">X</button>
        <div style="font-family:'VT323';font-size:17px;word-break:break-all;margin-bottom:8px;line-height:1;">${snd.name}</div>
        <audio controls src="${snd.url}" style="width:100%;height:28px;margin-top:auto;margin-bottom:8px;"></audio>
        <div style="width:100%;display:flex;align-items:center;gap:4px;">
          <span style="font-family:'VT323';font-size:14px;color:var(--dark);">VOL</span>
          <input type="range" min="0" max="100" value="${vol}" oninput="this.nextElementSibling.textContent=this.value+'%'" onchange="updateSoundVolume(${i}, this.value)" style="flex:1;width:100%;">
          <span style="font-family:'VT323';font-size:14px;color:var(--dark);width:32px;text-align:right;">${vol}%</span>
        </div>
      </div>
    `;
  });
}



async function deleteSound(idx) {
  customConfirm('Delete this sound? It will be unassigned from all events.', async () => {
    const deletedId = settings.sounds[idx].id;
    settings.sounds.splice(idx, 1);
    // Remove assignments
    for(const key in settings.soundAssignments) {
      if(settings.soundAssignments[key] === deletedId) settings.soundAssignments[key] = null;
    }
    try {
      const json = JSON.stringify(settings, null, 2);
      const res = await ghPut(JSON_PATH, json, 'Delete sound from library', settingsSha);
      settingsSha = res.content.sha;
      renderSoundLibrary();
      renderSettingsUI();
    } catch(e) {
      alert("Error deleting sound: " + e.message);
    }
  });
}

function syncSoundPickerToSettings() {
  SOUND_EVENTS.forEach(ev => {
    const layerContainers = document.querySelectorAll(`#layers_${ev.key} .spk-layer`);
    const layers = [];
    layerContainers.forEach(lc => {
      const checked = Array.from(lc.querySelectorAll(`input[type="checkbox"]:checked`)).map(cb => cb.value);
      layers.push(checked);
    });
    settings.soundAssignments[ev.key] = layers;
  });
}

window.addSoundLayer = function(evKey) {
  syncSoundPickerToSettings();
  let current = settings.soundAssignments[evKey] || [];
  if (!Array.isArray(current[0]) && current.length > 0) {
    current = [current]; // Upgrade 1D to 2D
  } else if (current.length === 0) {
    current = [[]];
  }
  current.push([]); // Add empty layer
  settings.soundAssignments[evKey] = current;
  renderSoundPicker();
};

window.removeSoundLayer = function(evKey, layerIdx) {
  syncSoundPickerToSettings();
  let current = settings.soundAssignments[evKey];
  if (Array.isArray(current) && Array.isArray(current[0])) {
    current.splice(layerIdx, 1);
    if (current.length === 0) current.push([]);
  }
  settings.soundAssignments[evKey] = current;
  renderSoundPicker();
};

function renderSoundPicker() {
  const grid = document.getElementById('soundPickerGrid');
  if(!grid) return;
  grid.innerHTML = '';
  if(!settings.soundAssignments) settings.soundAssignments = {};
  const sounds = settings.sounds || [];
  
  SOUND_EVENTS.forEach(ev => {
    let currentLayers = settings.soundAssignments[ev.key];
    if (!currentLayers || currentLayers.length === 0) {
      currentLayers = [[]];
    } else if (!Array.isArray(currentLayers[0])) {
      currentLayers = [currentLayers]; // Upgrade 1D to 2D
    }
    
    let layersHtml = '';
    currentLayers.forEach((layerIds, idx) => {
      let checksHtml = '';
      if (sounds.length === 0) {
        checksHtml = `<div style="font-family:'VT323';font-size:16px;color:var(--mid);">No sounds available</div>`;
      } else {
        sounds.forEach(s => {
          const isChecked = layerIds.includes(s.id) ? 'checked' : '';
          checksHtml += `<label style="display:flex;align-items:center;gap:6px;font-family:'VT323';font-size:16px;cursor:pointer;margin-bottom:4px;">
            <input type="checkbox" value="${s.id}" ${isChecked}>
            <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.name}</span>
          </label>`;
        });
      }
      
      layersHtml += `
        <div class="spk-layer" style="margin-bottom:8px;border:2px dashed var(--mid);padding:6px;background:var(--white);position:relative;">
          <div style="font-family:'VT323';font-size:16px;color:var(--dark);margin-bottom:4px;">Layer ${idx + 1} (Plays simultaneously)</div>
          ${idx > 0 ? `<button onclick="removeSoundLayer('${ev.key}', ${idx})" style="position:absolute;top:4px;right:4px;background:var(--danger);color:white;border:2px solid var(--dark);font-family:'VT323';font-size:12px;cursor:pointer;">X</button>` : ''}
          <div style="width:100%;max-height:80px;overflow-y:auto;border:2px solid var(--dark);padding:4px;">
            ${checksHtml}
          </div>
        </div>
      `;
    });

    let iconImg = '';
    if (ev.label.startsWith('Game:') && settings.gameCategoryIconId && settings.icons) {
      const ic = settings.icons.find(x => x.id === settings.gameCategoryIconId);
      if (ic) iconImg = `<img src="${ic.url}" style="width:24px;height:24px;object-fit:contain;image-rendering:pixelated;margin-right:6px;vertical-align:middle;">`;
    } else if (ev.label.startsWith('Portfolio:') && settings.portfolioCategoryIconId && settings.icons) {
      const ic = settings.icons.find(x => x.id === settings.portfolioCategoryIconId);
      if (ic) iconImg = `<img src="${ic.url}" style="width:24px;height:24px;object-fit:contain;image-rendering:pixelated;margin-right:6px;vertical-align:middle;">`;
    }

    grid.innerHTML += `
      <div style="border:3px solid var(--dark);background:var(--sky4);padding:12px;display:flex;flex-direction:column;">
        <div style="font-family:'VT323';font-size:18px;color:var(--dark);margin-bottom:8px;display:flex;align-items:center;">${iconImg}${ev.label}</div>
        <div id="layers_${ev.key}" style="flex:1;">
          ${layersHtml}
        </div>
        <button onclick="addSoundLayer('${ev.key}')" style="margin-top:auto;background:var(--sky2);color:var(--dark);border:2px solid var(--dark);font-family:'VT323';font-size:14px;padding:4px;cursor:pointer;width:100%;">+ ADD LAYER</button>
      </div>
    `;
  });
}

async function saveSoundAssignments() {
  const msgEl = document.getElementById('soundMsg');
  syncSoundPickerToSettings();
  try {
    msgEl.style.color = 'var(--mid)';
    msgEl.textContent = 'Saving...';
    const json = JSON.stringify(settings, null, 2);
    const result = await ghPut(JSON_PATH, json, 'Update sound assignments', settingsSha);
    settingsSha = result.content.sha;
    msgEl.style.color = 'var(--success)';
    msgEl.textContent = '✓ Sound assignments saved!';
    setTimeout(() => msgEl.textContent = '', 3000);
  } catch(e) {
    msgEl.style.color = 'var(--danger)';
    msgEl.textContent = '✗ Error: ' + e.message;
  }
}




function renderSettingsUI() {
  
  
  
  
  if (settings.profileImage) {
    setMediaPreview('profilePreview', settings.profileImage);
  }
  if (settings.backgroundImage) {
    setMediaPreview('bgPreview', settings.backgroundImage);
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
  document.getElementById('gsetAttackLoop').checked = settings.game.playerAttackLoop === true;
  if (!settings.game) settings.game = {};
  document.getElementById('gsetFwDrop').value = settings.game.fwDropChance !== undefined ? settings.game.fwDropChance : 10;
  document.getElementById('gsetPtsHit').value = settings.game.pointsPerHit !== undefined ? settings.game.pointsPerHit : 15;
  document.getElementById('gsetMissPen').value = settings.game.missPenalty !== undefined ? settings.game.missPenalty : 5;
  
  const fwIconSelect = document.getElementById('gsetFwIcon');
  if(fwIconSelect) {
    fwIconSelect.innerHTML = generateIconOptions(settings.game.fwIconId);
  }


    // Render Categories
  const catsBox = document.getElementById('catsList');
  if (catsBox) {
    catsBox.innerHTML = '';
    if (!settings.categories) settings.categories = {};
    if (settings.categories) {
      ['game', 'mod', '3d'].forEach(id => {
        if (!settings.categories[id]) settings.categories[id] = {};
        const c = settings.categories[id];
        const defaultName = id === 'game' ? 'GAME' : (id === 'mod' ? 'MINECRAFT MOD' : '3D MODEL');
        
        let iconUrl = '';
        if (c.iconId && settings.icons) {
          const ic = settings.icons.find(x => x.id === c.iconId);
          if(ic) iconUrl = ic.url;
        }
        
        catsBox.innerHTML += `
        <div style="border:3px solid var(--dark);padding:12px;background:var(--sky4);">
          <div style="font-weight:bold;margin-bottom:8px;text-transform:uppercase;color:var(--dark);font-family:'Press Start 2P',cursive;font-size:12px;">${id}</div>
          <div class="field" style="margin-bottom:8px;">
            <input type="text" id="catName_${id}" value="${c.name==id.toUpperCase() ? defaultName : c.name}" onchange="settings.categories['${id}'].name=this.value" placeholder="Display Name">
          </div>
          <div style="margin-bottom:8px;display:flex;align-items:center;gap:8px;">
            <select onchange="settings.categories['${id}'].iconId=this.value; renderSettingsUI()" style="padding:4px;font-family:'VT323';font-size:18px;border:3px solid var(--dark);flex:1;">
              ${generateIconOptions(c.iconId)}
            </select>
            ${iconUrl ? `<img src="${iconUrl}" style="width:28px;height:28px;object-fit:cover;image-rendering:pixelated;border:2px solid var(--dark);">` : `<div style="width:28px;height:28px;border:2px dashed var(--mid);background:var(--white);"></div>`}
          </div>
        </div>
      `;
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

      socBox.innerHTML += `
        <div style="background:var(--sky4);border:3px solid var(--dark);padding:12px;display:flex;justify-content:space-between;align-items:center;gap:12px;">
          <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
            <input type="text" value="${s.name || ''}" onchange="settings.socials[${idx}].name=this.value" placeholder="Name (e.g. itch.io)" style="width:100%;padding:8px;font-family:'VT323';font-size:20px;border:3px solid var(--dark);margin-bottom:8px;">
            <input type="url" value="${s.url || ''}" onchange="settings.socials[${idx}].url=this.value" placeholder="https://..." style="width:100%;padding:8px;font-family:'VT323';font-size:20px;border:3px solid var(--dark);">
          </div>
          <div style="width:200px;display:flex;align-items:center;gap:8px;">
            <select onchange="settings.socials[${idx}].iconId=this.value; renderSettingsUI()" style="flex:1;padding:4px;font-family:'VT323';font-size:18px;border:3px solid var(--dark);">
              ${generateIconOptions(s.iconId)}
            </select>
            ${iconUrl ? `<img src="${iconUrl}" style="width:40px;height:40px;object-fit:cover;image-rendering:pixelated;border:2px solid var(--dark);">` : `<div style="width:40px;height:40px;border:2px dashed var(--mid);background:var(--white);flex-shrink:0;"></div>`}
          </div>
          <button class="anav-btn danger" onclick="removeSocialLink(${idx})" style="padding:8px 12px;align-self:flex-start;">X</button>
        </div>
      `;
    });
  }
}


function addSocialLink() {
  if(!settings.socials) settings.socials = [];
  settings.socials.push({name:'', url:'', iconId:'', icon:''});
  renderSettingsUI();
}

function removeSocialLink(idx) {
  settings.socials.splice(idx, 1);
  renderSettingsUI();
}

function setMediaPreview(idBase, url) {
  const img = document.getElementById(idBase);
  const vid = document.getElementById(idBase + 'Video');
  if (!url) {
    img.style.display = 'none';
    if(vid) vid.style.display = 'none';
    return;
  }
  if (url.toLowerCase().includes('.mp4') || url.startsWith('data:video/mp4')) {
    img.style.display = 'none';
    if(vid) { vid.src = url; vid.style.display = 'block'; }
  } else {
    if(vid) { vid.style.display = 'none'; vid.src = ''; }
    img.src = url;
    img.style.display = 'block';
  }
}

function previewProfile(input){
  const file=input.files[0];
  if(!file)return;
  if(file.size>10*1024*1024){alert('File too large (max 10MB).');return}
  profileExt=file.name.split('.').pop().toLowerCase()||'png';
  const reader=new FileReader();
  reader.onload=e=>{
    const full=e.target.result;
    profileBase64=full.split(',')[1];
    setMediaPreview('profilePreview', full);
  };
  reader.readAsDataURL(file);
}

function previewBg(input){
  const file=input.files[0];
  if(!file)return;
  if(file.size>15*1024*1024){alert('File too large (max 15MB).');return}
  bgExt=file.name.split('.').pop().toLowerCase()||'png';
  const reader=new FileReader();
  reader.onload=e=>{
    const full=e.target.result;
    bgBase64=full.split(',')[1];
    setMediaPreview('bgPreview', full);
  };
  reader.readAsDataURL(file);
}

async function deleteOldFile(url, msg) {
  if (url && url.includes('raw.githubusercontent.com')) {
    const path = url.split('/main/')[1];
    if (path) {
      try {
        const file = await ghGet(path);
        if (file && file.sha) await ghDelete(path, msg, file.sha);
      } catch (e) { console.warn('Failed to delete old file:', e); }
    }
  }
}

async function saveSettings(){
  const btn=document.getElementById('saveSettingsBtn');
  const bar=document.getElementById('settingsProgressBar');
  const fill=document.getElementById('settingsProgressFill');
  const msg=document.getElementById('settingsMsg');

  btn.disabled=true; bar.style.display='block'; fill.style.width='10%';
  msg.className='form-msg ok'; msg.textContent='Saving settings...';

  try{
    if(profileBase64){
      msg.textContent='Uploading profile image...';
      const fname=`works/profile_${Date.now()}.${profileExt}`;
      await ghPutBinary(fname, profileBase64, 'Update profile image');
      if (settings.profileImage) await deleteOldFile(settings.profileImage, 'Remove old profile image');
      settings.profileImage=`https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/${fname}`;
      fill.style.width='40%';
    }
    
    if(bgBase64){
      msg.textContent='Uploading background image...';
      const fname=`works/bg_${Date.now()}.${bgExt}`;
      await ghPutBinary(fname, bgBase64, 'Update background image');
      if (settings.backgroundImage) await deleteOldFile(settings.backgroundImage, 'Remove old background image');
      settings.backgroundImage=`https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/${fname}`;
      fill.style.width='50%';
    }
    
    settings.profileFit = document.getElementById('profileFit').value;
    settings.profilePos = document.getElementById('profilePos').value;
    settings.bgSize = document.getElementById('bgSize').value;
    settings.bgPos = document.getElementById('bgPos').value;
    
    if (!settings.game) settings.game = {};
    if(gSpriteBase64){
      msg.textContent='Uploading Player Sprite...';
      const fname=`works/sprite_${Date.now()}.${gSpriteExt}`;
      await ghPutBinary(fname, gSpriteBase64, 'Upload Player Sprite');
      settings.game.playerSprite=`https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/${fname}`;
    }
    if(gAttackBase64){
      msg.textContent='Uploading Attack Sprite...';
      const fname=`works/attack_${Date.now()}.${gAttackExt}`;
      await ghPutBinary(fname, gAttackBase64, 'Upload Attack Sprite');
      settings.game.playerAttackSprite=`https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/${fname}`;
    }
    
    settings.game.playerSpriteFrames = parseInt(document.getElementById('gsetSpriteFrames').value) || 1;
    settings.game.playerSpriteFps = parseInt(document.getElementById('gsetSpriteFps').value) || 12;
    settings.game.playerSpriteLoop = document.getElementById('gsetSpriteLoop').checked;
    
    settings.game.playerAttackFrames = parseInt(document.getElementById('gsetAttackFrames').value) || 1;
    settings.game.playerAttackFps = parseInt(document.getElementById('gsetAttackFps').value) || 15;
    settings.game.playerAttackLoop = document.getElementById('gsetAttackLoop').checked;


    msg.textContent='Updating settings.json...';
    const json=JSON.stringify(settings,null,2);
    const result=await ghPut(JSON_PATH, json, 'Update settings.json', settingsSha);
    settingsSha=result.content.sha;

    fill.style.width='100%';
    msg.textContent='Settings saved successfully!';
    setTimeout(()=>{bar.style.display='none';msg.textContent='';},3000);

    document.getElementById('profileFileInput').value='';
    document.getElementById('bgFileInput').value='';
    renderSettingsUI();
  }catch(e){
    msg.className='form-msg err';
    msg.textContent='Error saving settings: '+e.message;
    bar.style.display='none';
  }finally{
    btn.disabled=false;
  }
}


async function saveGameAnimations() {
  const btn=document.getElementById('saveAnimBtn');
  const bar=document.getElementById('animProgressBar');
  const fill=document.getElementById('animProgressFill');
  const msg=document.getElementById('animMsg');
  btn.disabled=true; bar.style.display='block'; fill.style.width='10%';
  msg.className='form-msg ok'; msg.textContent='Saving Animations...';
  try{
    if (!settings.game) settings.game = {};
    if(gSpriteBase64){
      const fname=`works/sprite_${Date.now()}.${gSpriteExt}`;
      await ghPutBinary(fname, gSpriteBase64, 'Upload Player Sprite');
      settings.game.playerSprite=`https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/${fname}`;
    }
    if(gAttackBase64){
      const fname=`works/attack_${Date.now()}.${gAttackExt}`;
      await ghPutBinary(fname, gAttackBase64, 'Upload Attack Sprite');
      settings.game.playerAttackSprite=`https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/${fname}`;
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


// ── Add work ──
async function addWork(){
  const name=document.getElementById('wName').value.trim();
  const cat=document.getElementById('wCat').value;
  const subcat=document.getElementById('wSubcat').value;
  const desc=document.getElementById('wDesc').value.trim();
  const selectedTools = Array.from(document.querySelectorAll('.tool-checkbox:checked')).map(cb => cb.value);

  if(!name){showMsg('Please enter a work name.','err');return}
  if(!cat){showMsg('Please select a category.','err');return}
  if(!subcat && (cat==='game'||cat==='mod'||cat==='3d')){showMsg('Please select a sub-category.','err');return}

  const btn=document.getElementById('submitBtn');
  const bar=document.getElementById('progressBar');
  const fill=document.getElementById('progressFill');
  btn.disabled=true;bar.style.display='block';fill.style.width='10%';

  try{
    let imagePath=null;
    let modelPath=null;

    // Existing image/model path logic
    const existing = editingId ? works.find(x=>x.id===editingId) : {};
    imagePath = existing.image || null;
    modelPath = existing.model || null;

    // Upload image to GitHub if exists
    if(currentImages.length > 0){
      showMsg('Uploading images...','ok');
      fill.style.width='30%';
      imagePath = [];
      for(let i=0; i<currentImages.length; i++) {
        const img = currentImages[i];
        const fname=`works/${Date.now()}_${i}.${img.ext}`;
        await ghPutBinary(fname, img.base64, `Add image ${i+1} for ${name}`);
        imagePath.push(`https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/${fname}`);
        fill.style.width = (30 + ((i+1)/currentImages.length)*25) + '%';
      }
    }

    // Upload 3D model to GitHub if exists
    if(currentModelBase64 && cat==='3d'){
      showMsg('Uploading 3D model...','ok');
      fill.style.width='65%';
      const mfname=`works/${Date.now()}_model.glb`;
      await ghPutBinary(mfname, currentModelBase64, `Add 3D model for ${name}`);
      modelPath=`https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/${mfname}`;
      fill.style.width='75%';
    }

    // Add or update works array
    if (editingId) {
      const idx = works.findIndex(x => x.id === editingId);
      if (idx !== -1) {
        works[idx] = { ...works[idx], name, cat,
          subcat: (cat==='game'||cat==='mod'||cat==='3d')?subcat:'',
          desc, links: currentWorkLinks, team: selectedTeams,
          imageFocal: currentImgFocal,
          image: imagePath,
          model: modelPath,
          tools: selectedTools
        };
      }
    } else {
      works.push({
        id:Date.now(),name,cat,
        subcat:(cat==='game'||cat==='mod'||cat==='3d')?subcat:'',
        desc,image:imagePath,model:modelPath,
        links:currentWorkLinks, team: selectedTeams,
        imageFocal:currentImgFocal,
        tools:selectedTools,
        date:new Date().toISOString()
      });
    }

    showMsg('Saving to GitHub...','ok');
    fill.style.width='85%';
    await saveWorks();
    fill.style.width='100%';

    renderAdminList();
    updateStats();
    resetForm();
    setTimeout(()=>{bar.style.display='none';fill.style.width='0%'},600);
    showMsg(editingId ? '✓ Changes saved!' : '✓ Work published to portfolio!', 'ok');
    editingId = null;
  } catch(e){
    showMsg('Error: '+e.message,'err');
    bar.style.display='none';fill.style.width='0%';
  }
  btn.disabled=false;
}

async function deleteWork(id){
  const w=works.find(x=>x.id===id);
  if(!w)return;
  customConfirm(`Delete "${w.name}"?`, async () => {
    try{
      // Delete image file from GitHub if hosted there
      if(w.image&&w.image.includes('raw.githubusercontent.com')){
        const path=w.image.split(`/main/`)[1];
        if(path){
          const file=await ghGet(path);
          if(file)await ghDelete(path,`Remove image for ${w.name}`,file.sha);
        }
      }
      works=works.filter(x=>x.id!==id);
      await saveWorks();
      renderAdminList();
      updateStats();
      showMsg('✓ Work deleted.','ok');
    } catch(e){showMsg('Error: '+e.message,'err')}
  });
}

function updateStats(){
  document.getElementById('sAll').textContent=works.length;
  document.getElementById('sGame').textContent=works.filter(w=>w.cat==='game').length;
  document.getElementById('sMod').textContent=works.filter(w=>w.cat==='mod').length;
  document.getElementById('s3d').textContent=works.filter(w=>w.cat==='3d').length;
}

function renderAdminList(){
  const list=document.getElementById('worksList');
  const filter = document.getElementById('adminFilter') ? document.getElementById('adminFilter').value : 'all';
  
  const filteredWorks = works.filter(w => filter === 'all' || w.cat === filter);
  
  if(!filteredWorks.length){list.innerHTML='<p class="no-works">No works found.</p>';return}
  list.innerHTML='';
  [...filteredWorks].reverse().forEach(w=>{
    const catSetting = settings.categories && settings.categories[w.cat] ? settings.categories[w.cat] : {};
    let iconUrl = '';
    if(catSetting.iconId && settings.icons) {
      const ic = settings.icons.find(x => x.id === catSetting.iconId);
      if(ic) iconUrl = ic.url;
    }
    const catIcon = iconUrl ? `<img src="${iconUrl}" style="width:18px;height:18px;vertical-align:middle;object-fit:cover;image-rendering:pixelated;">` : '';

    const label={game:'Game',mod:'Minecraft Mod','3d':'3D Model'}[w.cat]||w.cat;
    const sub=w.subcat?' · '+w.subcat.charAt(0).toUpperCase()+w.subcat.slice(1):'';
    const el=document.createElement('div');el.className='witem';
    el.innerHTML=`
      <div class="witem-thumb" style="display:flex;align-items:center;justify-content:center;background:var(--sky4);">${w.image?`<img src="${w.image}">`:catIcon}</div>
      <div class="witem-info">
        <div class="witem-name">${w.name}</div>
        <div class="witem-cat" style="display:flex;align-items:center;gap:6px;">${catIcon} ${label}${sub}</div>
      </div>
      <button class="witem-edit" onclick="editWork(${w.id})" title="Edit">✏️</button>
      <button class="witem-del" onclick="deleteWork(${w.id})" title="Delete">✕</button>`;
    list.appendChild(el);
  });
}

let currentWorkLinks = [];




function renderWorkLinks() {
  const box = document.getElementById('wLinksBox');
  if(!box) return;
  box.innerHTML = '';
  currentWorkLinks.forEach((l, idx) => {
    box.innerHTML += `
      <div style="display:flex;gap:8px;background:var(--white);padding:8px;border:3px solid var(--dark);align-items:center;flex-wrap:wrap;">
        <select onchange="currentWorkLinks[${idx}].iconId=this.value;" style="padding:4px;font-family:'VT323';font-size:18px;border:3px solid var(--dark);width:150px;">
          ${generateIconOptions(l.iconId)}
        </select>
        <input type="text" value="${l.label||''}" onchange="currentWorkLinks[${idx}].label=this.value;" placeholder="Label (e.g. Steam)" style="flex:1;min-width:100px;padding:4px;font-family:'VT323';font-size:18px;border:3px solid var(--dark);">
        <input type="url" value="${l.url||''}" onchange="currentWorkLinks[${idx}].url=this.value;" placeholder="https://..." style="flex:2;min-width:150px;padding:4px;font-family:'VT323';font-size:18px;border:3px solid var(--dark);">
        <button class="anav-btn danger" onclick="removeWorkLink(${idx})" style="padding:4px 8px;">X</button>
      </div>
    `;
  });
}

function addWorkLink() {
  currentWorkLinks.push({url:'', iconId:'', label:''});
  renderWorkLinks();
}

function removeWorkLink(idx) {
  currentWorkLinks.splice(idx, 1);
  renderWorkLinks();
}

function resetForm(){
  document.getElementById('wName').value='';
  document.getElementById('wCat').value='';
  document.getElementById('wSubcat').value='';
  document.getElementById('wDesc').value='';
  currentWorkLinks = [];
  renderWorkLinks();
  document.getElementById('subcatWrap').classList.remove('visible');
  document.getElementById('modelWrap').style.display='none';
  document.getElementById('imgPreview').innerHTML=`<span style="font-size:32px">🖼️</span><span style="font-size:11px;color:rgba(44,74,106,0.5)">Click to upload image</span>`;
  document.getElementById('imgFileInput').value='';
  document.getElementById('modelFileInput').value='';
  document.getElementById('modelName').textContent='';
  renderToolsCheckboxList();
  currentImages = [];

  currentModelBase64=null;
  currentModelName=null;
  currentImgFocal=50;
  editingId=null;
  document.getElementById('editBanner').classList.remove('visible');
  document.getElementById('focalHint').style.display='none';
  const sl=document.getElementById('focalSlider'); if(sl) sl.value=50;
  document.getElementById('submitBtn').textContent='PUBLISH TO PORTFOLIO';
  document.getElementById('previewBtn').textContent='PREVIEW';
}

function showMsg(text,type){
  const el=document.getElementById('formMsg');
  el.textContent=text;el.className='form-msg '+type;
  if(type==='ok')setTimeout(()=>{el.textContent='';el.className='form-msg'},4000);
}

// ── Edit Work ──
let editingId = null;
function editWork(id) {
  const w = works.find(x => x.id === id);
  if (!w) return;
  editingId = id;

  document.getElementById('wName').value = w.name || '';
  document.getElementById('wCat').value = w.cat || '';
  onCatChange();
  document.getElementById('wSubcat').value = w.subcat || '';
  document.getElementById('wDesc').value = w.desc || '';
  
  // Backward compatibility: Convert old single 'link' to 'links' array
  if (w.links) {
    currentWorkLinks = JSON.parse(JSON.stringify(w.links));
  } else if (w.link) {
    currentWorkLinks = [{ url: w.link, label: 'Visit', iconId: '' }];
  } else {
    currentWorkLinks = [];
  }

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
  

  renderWorkLinks();
  
  renderToolsCheckboxList();

  // Show existing image
  const prev = document.getElementById('imgPreview');
  const extraWrap = document.getElementById('extraImgWrap');
  extraWrap.innerHTML = '';
  extraWrap.style.display = 'none';

  if (w.image) {
    let images = Array.isArray(w.image) ? w.image : [w.image];
    const focal = w.imageFocal !== undefined ? w.imageFocal : 50;
    prev.innerHTML = `<img src="${images[0]}" style="object-position:center ${focal}%;width:100%;height:100%;object-fit:cover;position:absolute;inset:0"><span style="position:absolute;bottom:6px;right:8px;font-size:10px;background:rgba(0,0,0,.4);color:#fff;padding:2px 6px;border-radius:4px;pointer-events:none">Dbl-click to replace</span>`;
    
    if (images.length > 1) {
      extraWrap.style.display = 'flex';
      for (let i = 1; i < images.length; i++) {
         extraWrap.innerHTML += `<div style="min-width:60px; height:40px; border:2px solid var(--dark); border-radius:4px; overflow:hidden; box-shadow:2px 2px 0 var(--dark);">
           <img src="${images[i]}" style="width:100%; height:100%; object-fit:cover;">
         </div>`;
      }
    }
    
    showFocalSlider(focal);
    initAdminImgDrag();
  } else {
    prev.innerHTML = `<span style="font-size:32px">🖼️</span><span style="font-size:11px;color:rgba(44,74,106,0.5)">Click to upload image</span>`;
  }

  document.getElementById('editBanner').classList.add('visible');
  document.getElementById('submitBtn').textContent = 'SAVE CHANGES';
  document.getElementById('previewBtn').textContent = 'PREVIEW CHANGES';

  // Scroll to form
  document.getElementById('imgPreview').scrollIntoView({behavior:'smooth', block:'center'});
}

// ── Image focal controls ──
let currentImgFocal = 50;

function imgPreviewClick() {
  // Only open file picker if no image loaded yet
  const img = document.querySelector('#imgPreview img');
  if (!img) document.getElementById('imgFileInput').click();
}

function updateFocal(val) {
  currentImgFocal = parseFloat(val);
  const img = document.querySelector('#imgPreview img');
  if (img) img.style.objectPosition = `center ${currentImgFocal}%`;
}

function showFocalSlider(posY) {
  const hint = document.getElementById('focalHint');
  hint.style.display = 'block';
  const slider = document.getElementById('focalSlider');
  if (slider) { slider.value = posY; currentImgFocal = posY; }
}

function initAdminImgDrag() {
  // Using slider now — just set up click-to-replace
  const prev = document.getElementById('imgPreview');
  prev.ondblclick = () => document.getElementById('imgFileInput').click();
}

// ── Preview ──
function openPreview() {
  const name = document.getElementById('wName').value.trim();
  const cat = document.getElementById('wCat').value;
  const subcat = document.getElementById('wSubcat').value;
  const desc = document.getElementById('wDesc').value.trim();

  if (!name) { showMsg('Enter a work name first.', 'err'); return; }

  const catSetting = settings.categories && settings.categories[cat] ? settings.categories[cat] : {};
  let catIconUrl = '';
  if(catSetting.iconId && settings.icons) {
    const ic = settings.icons.find(x => x.id === catSetting.iconId);
    if(ic) catIconUrl = ic.url;
  }
  const catIcon = catIconUrl ? `<img src="${catIconUrl}" style="width:16px;height:16px;object-fit:contain;image-rendering:pixelated;">` : '';
  const catLabel = catSetting.name || ({game:'Game', mod:'Minecraft Mod', '3d':'3D Model'}[cat] || cat);
  const subLabel = subcat ? subcat.charAt(0).toUpperCase()+subcat.slice(1) : '';

  const media = document.getElementById('prevMedia');
  const existingImg = document.querySelector('#imgPreview img');
  if (currentImageBase64) {
    media.innerHTML = `<img class="prev-img" src="data:image/${currentImageExt};base64,${currentImageBase64}">`;
  } else if (existingImg) {
    media.innerHTML = `<img class="prev-img" src="${existingImg.src}" style="object-position:${existingImg.style.objectPosition||'center 50%'}">`;
  } else {
    media.innerHTML = `<div class="prev-img-ph"></div>`;
  }

  document.getElementById('prevName').textContent = name;
  document.getElementById('prevDesc').textContent = desc || '(no description)';

  const badges = document.getElementById('prevBadges');
  badges.innerHTML = `<span class="prev-badge">${catIcon}${catLabel}</span>`;
  if (subLabel) badges.innerHTML += `<span class="prev-badge sub">${subLabel}</span>`;

  const pl = document.getElementById('prevLink');
  pl.innerHTML = '';
  if (currentWorkLinks.length > 0) {
    currentWorkLinks.forEach(l => {
      if(!l.url) return;
      let iconHtml = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M14 3h7v7l-2-2-7 7-3-3 7-7-2-2zm-3 3H4v14h14v-7l2-2v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h10l-2 2z"/></svg>`;
      if(l.iconId && settings.icons) {
        const ic = settings.icons.find(x => x.id === l.iconId);
        if(ic) iconHtml = `<img src="${ic.url}" style="width:16px;height:16px;object-fit:cover;image-rendering:pixelated;">`;
      }
      pl.innerHTML += `
        <a href="${l.url}" target="_blank" rel="noopener" style="display:inline-flex;gap:8px;align-items:center;padding:10px 18px;border:3px solid var(--dark);background:var(--gold);font-family:'VT323',monospace;font-size:24px;color:var(--dark);text-decoration:none;box-shadow:4px 4px 0 var(--dark);margin-right:12px;margin-bottom:12px;">
          ${iconHtml}
          ${l.label || 'Visit Link'}
        </a>
      `;
    });
    pl.style.display = 'block';
  } else {
    pl.style.display = 'none';
  }

  document.getElementById('prevOverlay').classList.add('open');
}
function closePrev() {
  document.getElementById('prevOverlay').classList.remove('open');
}
function confirmPublish() {
  closePrev();
  addWork();
}

// ── Team Library ──────────────────────────────────────
function renderTeamLibrary() {
  const select = document.getElementById('newTeamIcon');
  if(select) {
    select.innerHTML = generateIconOptions('');
  }
  const btnSelect = document.getElementById('teamBtnIcon');
  if (btnSelect) {
    btnSelect.innerHTML = generateIconOptions(settings.teamBtnIconId || '');
  }
  const sBtnSelect = document.getElementById('soundBtnIcon');
  if (sBtnSelect) {
    sBtnSelect.innerHTML = generateIconOptions(settings.soundBtnIconId || '');
  }
  const gcSelect = document.getElementById('gameCategoryIcon');
  if (gcSelect) {
    gcSelect.innerHTML = generateIconOptions(settings.gameCategoryIconId || '');
  }
  const pcSelect = document.getElementById('portfolioCategoryIcon');
  if (pcSelect) {
    pcSelect.innerHTML = generateIconOptions(settings.portfolioCategoryIconId || '');
  }
  
  const box = document.getElementById('teamLibraryList');
  if(!box) return;
  box.innerHTML = '';
  if(!settings.teams || settings.teams.length === 0) {
    box.innerHTML = '<div style="color:var(--mid);font-size:16px;">No team members added yet.</div>';
    return;
  }
  
  settings.teams.forEach((tm) => {
    let iconHtml = '';
    if(tm.iconId && settings.icons) {
      const ic = settings.icons.find(x => x.id === tm.iconId);
      if(ic) {
        iconHtml = `<img src="${ic.url}" style="width:24px;height:24px;object-fit:cover;image-rendering:pixelated;margin-right:8px;">`;
      }
    }
    
    box.innerHTML += `
      <div style="border:3px solid var(--dark);background:var(--white);padding:8px 12px;display:flex;align-items:center;position:relative;">
        <button onclick="deleteTeamLibraryMember('${tm.id}')" style="position:absolute;top:-10px;right:-10px;background:var(--danger);color:white;border:3px solid var(--dark);width:24px;height:24px;cursor:pointer;font-weight:bold;font-size:12px;display:flex;align-items:center;justify-content:center;z-index:2;">X</button>
        ${iconHtml}
        <div style="display:flex;flex-direction:column;">
          <span style="font-family:'VT323';font-size:18px;line-height:1;">${tm.name}</span>
          ${tm.link ? `<a href="${tm.link}" target="_blank" style="font-size:12px;color:var(--dark);text-decoration:none;">🔗 Link</a>` : ''}
        </div>
      </div>
    `;
  });
}

async function addTeamLibraryMember() {
  const name = document.getElementById('newTeamName').value.trim();
  const link = document.getElementById('newTeamLink').value.trim();
  const iconId = document.getElementById('newTeamIcon').value;
  
  if(!name) return alert("Please enter a team member name.");
  
  if(!settings.teams) settings.teams = [];
  const newTeam = {
    id: 'team_' + Date.now(),
    name: name,
    link: link,
    iconId: iconId
  };
  
  settings.teams.push(newTeam);
  try {
    document.getElementById('newTeamName').value = '';
    document.getElementById('newTeamLink').value = '';
    document.getElementById('newTeamIcon').value = '';
    
    renderTeamLibrary();
    renderTeamCheckboxList();
    await saveSettings(); // autosave
  } catch(e) {
    alert("Error adding team member: " + e.message);
  }
}

async function deleteTeamLibraryMember(id) {
  customConfirm("Delete this team member?", async () => {
    settings.teams = settings.teams.filter(t => t.id !== id);
    try {
      renderTeamLibrary();
      renderTeamCheckboxList();
      await saveSettings(); // autosave
    } catch(e) {
      alert("Error deleting team member: " + e.message);
    }
  });
}

async function saveTeamLibrary() {
  const btn = event.target;
  const originalText = btn.textContent;
  btn.textContent = 'SAVING...';
  btn.disabled = true;
  try {
    await saveSettings();
    btn.textContent = '✓ SAVED!';
    setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 2000);
  } catch(e) {
    alert("Error saving team library: " + e.message);
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

function renderTeamCheckboxList() {
  const box = document.getElementById('teamCheckboxList');
  if(!box) return;
  box.innerHTML = '';
  if(!settings.teams || settings.teams.length === 0) {
    box.innerHTML = '<div style="color:var(--dark);font-size:16px;">No team members available. Add some in the Team Library.</div>';
    return;
  }
  
  settings.teams.forEach(tm => {
    const checked = selectedTeams.includes(tm.id) ? 'checked' : '';
    
    let iconHtml = '';
    if(tm.iconId && settings.icons) {
      const ic = settings.icons.find(x => x.id === tm.iconId);
      if(ic) iconHtml = `<img src="${ic.url}" style="width:20px;height:20px;object-fit:cover;image-rendering:pixelated;">`;
    }

    box.innerHTML += `
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;background:var(--white);padding:4px 8px;border:2px solid var(--dark);">
        <input type="checkbox" value="${tm.id}" class="team-checkbox" ${checked} onchange="toggleTeamSelection('${tm.id}', this.checked)">
        ${iconHtml}
        <span style="font-family:'VT323';font-size:18px;">${tm.name}</span>
      </label>
    `;
  });
}

function toggleTeamSelection(id, isChecked) {
  if(isChecked) {
    if(!selectedTeams.includes(id)) selectedTeams.push(id);
  } else {
    selectedTeams = selectedTeams.filter(t => t !== id);
  }
}


// ── Custom Confirm Dialog ──
function customConfirm(msg, callback) {
  const overlay = document.getElementById('customConfirmOverlay');
  document.getElementById('customConfirmMsg').textContent = msg;
  overlay.style.display = 'flex';
  document.getElementById('customConfirmYes').onclick = () => {
    overlay.style.display = 'none';
    callback();
  };
}
