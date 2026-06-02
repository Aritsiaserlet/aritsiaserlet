
window.checkAdminPassword = function() {
  const pw = document.getElementById('adminPasswordInput').value;
  if(pw === '7964') {
    document.getElementById('adminPasswordInput').style.display = 'none';
    const lbl = document.getElementById('adminAuthLabel');
    if (lbl) lbl.innerText = 'GitHub Token';
    document.getElementById('adminTokenDiv').style.display = 'flex';
    document.getElementById('adminErrorMsg').innerText = '';
    document.getElementById('adminTokenInput').focus();
  } else {
    document.getElementById('adminErrorMsg').innerText = 'You are not allowed to access.';
    document.getElementById('adminPasswordInput').value = '';
    setTimeout(() => {
      document.getElementById('adminErrorMsg').innerText = '';
    }, 2000);
  }
};
window.goToAdmin = function() {
  const token = document.getElementById('adminTokenInput').value.trim();
  if(token && token.startsWith('ghp_')) {
    sessionStorage.setItem('ghToken', token);
    window.location.href = 'admin.html';
  } else {
    document.getElementById('adminErrorMsg').innerText = 'Please enter a valid GitHub token.';
    setTimeout(() => {
      document.getElementById('adminErrorMsg').innerText = '';
    }, 2000);
  }
};

// ── Pixel particles animation ──
const canvas = document.getElementById('windCanvas');
const ctx = canvas.getContext('2d');
let W, H, particles = [];

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

function randBetween(a, b) { return a + Math.random() * (b - a); }

function createParticle(yStart) {
  return {
    x: Math.floor(Math.random() * W),
    y: yStart ?? Math.floor(H + 100),
    length: Math.floor(randBetween(6, 25)) * 6,
    speedY: randBetween(1.5, 5.0),
    phase: Math.random() * Math.PI * 2,
    opacity: randBetween(0.1, 0.6)
  };
}

for (let i = 0; i < 40; i++) {
  particles.push(createParticle(Math.random() * H));
}

function animateParticles() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach((p, i) => {
    p.y -= p.speedY;
    
    let currentY = p.y;
    let segCount = Math.floor(p.length / 6);
    for (let j=0; j<segCount; j++) {
      let alpha = p.opacity * (1 - j/segCount); // fade out tail
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      let waveX = Math.floor(Math.sin(currentY * 0.015 + p.phase) * 8);
      ctx.fillRect(Math.floor(p.x + waveX), Math.floor(currentY), 4, 4);
      currentY += 6;
    }
    
    if (p.y + p.length < 0) {
      particles[i] = createParticle();
    }
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ── Works data from GitHub ──
let works = [];
let settings = {};
let currentMainCat = 'all';
let currentSubCat = 'all';
let currentSort = 'featured'; // Default sort

const GH_USER = 'Aritsiaserlet';
const GH_REPO = 'aritsiaserlet';
const WORKS_URL = `https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/works.json`;
const SETTINGS_URL = `https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/settings.json`;

async function loadData() {
  // Load Works
  try {
    const r = await fetch(WORKS_URL + '?t=' + Date.now());
    if (r.ok) works = await r.json();
    else works = [];
  } catch(e) { works = []; }
  
  // Load Settings
  try {
    const sr = await fetch(SETTINGS_URL + '?t=' + Date.now());
    if (sr.ok) settings = await sr.json();
  } catch(e) { console.log('No settings found'); }
  
  applySettings();
  renderGallery();
}

function applySettings() {
  if (settings.profileImage) {
    document.getElementById('avatarInner').innerHTML = `<img src="${settings.profileImage}" alt="Profile">`;
  }
  if (settings.backgroundImage) {
    const bg = document.getElementById('customBg');
    bg.style.backgroundImage = `url('${settings.backgroundImage}')`;
    bg.style.opacity = '1';
    canvas.style.opacity = '0.4'; // Dim particles slightly when bg is loaded
  }

  // Render Social Links
  const socBox = document.getElementById('socialLinksBox');
  socBox.innerHTML = '';
  if(settings.socials && settings.socials.length > 0) {
    settings.socials.forEach(s => {
      let url = '';
      if(s.iconId && settings.icons) {
        const ic = settings.icons.find(x => x.id === s.iconId);
        if(ic) url = ic.url;
      }
      const iconHtml = url ? `<img src="${url}" style="width:20px;height:20px;object-fit:cover;image-rendering:pixelated;">` : '';
      socBox.innerHTML += `<a href="${s.url}" class="social-btn" target="_blank" rel="noopener">${iconHtml} ${s.name}</a>`;
    });
  }

  // Render Filter Tabs
  const mainTabs = document.getElementById('mainTabs');
  mainTabs.innerHTML = `<span class="filter-label">Category:</span><button class="tab active" data-cat="all" onclick="setMainCat('all',this)">All</button>`;
  ['game','mod','3d'].forEach(id => {
    const c = settings.categories && settings.categories[id] ? settings.categories[id] : {};
    const name = c.name || (id==='game'?'Game':id==='mod'?'Minecraft Mod':'3D Model');
    let url = '';
    if(c.iconId && settings.icons) {
      const ic = settings.icons.find(x => x.id === c.iconId);
      if(ic) url = ic.url;
    }
    const iconHtml = url ? `<img src="${url}" style="width:20px;height:20px;object-fit:contain;image-rendering:pixelated;">` : '';
    mainTabs.innerHTML += `<button class="tab" data-cat="${id}" onclick="setMainCat('${id}',this)">${iconHtml}${name}</button>`;
  });
}

function renderGallery() {
  const gallery = document.getElementById('gallery');
  const emptyState = document.getElementById('emptyState');

  let filtered = works.filter(w => {
    if (currentMainCat !== 'all' && w.cat !== currentMainCat) return false;
    if (currentMainCat === '3d' && currentSubCat !== 'all' && w.subcat !== currentSubCat) return false;
    return true;
  });

  // Sorting Logic
  filtered.sort((a, b) => {
    if (currentSort === 'random') {
      // Very simple deterministic shuffle based on length (just for visual variation on load)
      // Actual random sort on every re-render is annoying, so we use a pseudo-random hash or simple random if we really want true random.
      // But let's stick to true random for now, since it was requested.
      return Math.random() - 0.5;
    }
    
    if (currentSort === 'most_liked') {
      const likesA = (window.globalLikes && window.globalLikes[a.id]) ? window.globalLikes[a.id] : 0;
      const likesB = (window.globalLikes && window.globalLikes[b.id]) ? window.globalLikes[b.id] : 0;
      if (likesA !== likesB) return likesB - likesA;
      // Fallback if likes are equal
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      const dA = new Date(a.date || 0).getTime();
      const dB = new Date(b.date || 0).getTime();
      if (dA !== dB) return dB - dA;
      return (a.name || '').localeCompare(b.name || '');
    }
    
    if (currentSort === 'newest') {
      return new Date(b.date || 0) - new Date(a.date || 0);
    }
    if (currentSort === 'oldest') {
      return new Date(a.date || 0) - new Date(b.date || 0);
    }
    if (currentSort === 'alphabetical') {
      return (a.name || '').localeCompare(b.name || '');
    }
    
    // Default Fallback (Featured -> Date -> Alphabetical) or "featured" explicit sort
    if (a.featured !== b.featured) {
      return a.featured ? -1 : 1;
    }
    // Then Date
    const dA = new Date(a.date || 0).getTime();
    const dB = new Date(b.date || 0).getTime();
    if (dA !== dB) return dB - dA;
    // Then Alphabetical
    return (a.name || '').localeCompare(b.name || '');
  });

  // Remove existing cards (keep emptyState)
  gallery.querySelectorAll('.work-card').forEach(c => c.remove());

  if (filtered.length === 0) {
    emptyState.style.display = '';
  } else {
    emptyState.style.display = 'none';
    filtered.forEach(w => {
      const card = document.createElement('div');
      card.className = 'work-card';
      card.onclick = () => openModal(w);
      const catSetting = settings.categories && settings.categories[w.cat] ? settings.categories[w.cat] : {};
      const catLabel = catSetting.name || ({game:'Game', mod:'Minecraft Mod', '3d':'3D Model'}[w.cat] || w.cat);
      
      let catIconUrl = '';
      if(catSetting.iconId && settings.icons) {
        const ic = settings.icons.find(x => x.id === catSetting.iconId);
        if(ic) catIconUrl = ic.url;
      }
      const catIcon = catIconUrl ? `<img src="${catIconUrl}" style="width:18px;height:18px;object-fit:contain;image-rendering:pixelated;">` : '';
      const subLabel = w.subcat ? w.subcat.charAt(0).toUpperCase() + w.subcat.slice(1) : '';
      const focalY = (w.imageFocal !== undefined && w.imageFocal !== null) ? w.imageFocal : 50;
      
      let toolsHtml = '';
      if(w.tools && w.tools.length > 0 && settings.icons) {
        w.tools.forEach(tid => {
          const ic = settings.icons.find(x => x.id === tid);
          if(ic) toolsHtml += `<img src="${ic.url}" title="${ic.name}" style="width:18px;height:18px;object-fit:cover;image-rendering:pixelated;border:2px solid var(--dark);background:var(--white);">`;
        });
      }

      const likesCount = (window.globalLikes && window.globalLikes[w.id]) ? window.globalLikes[w.id] : 0;
      const isLiked = (window.userLikes && window.userLikes[w.id]) ? true : false;
      const heartFill = isLiked ? 'currentColor' : 'none';
      const heartColor = isLiked ? 'var(--danger)' : 'var(--dark)';

      card.innerHTML = `
        <div class="card-thumb">
          ${w.image ? `<img src="${w.image}" alt="${w.name}" style="object-position:center ${focalY}%">` : `<div style="font-size:48px;">${catIcon||''}</div>`}
          <div class="like-btn" onclick="window.handleLikeClick(event, '${w.id}')" style="color:${heartColor};">
            <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="${heartFill}"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <span style="font-family:'VT323',monospace;font-size:18px;margin-top:2px;">${likesCount}</span>
          </div>
        </div>
        <div class="card-info">
          <p class="card-name">${w.name}</p>
          <div class="card-cats" style="align-items:center;">
            <span class="cat-badge">${catIcon}${catLabel}</span>
            ${subLabel ? `<span class="cat-badge sub">${subLabel}</span>` : ''}
            ${toolsHtml ? `<div style="display:flex;gap:4px;margin-left:auto;">${toolsHtml}</div>` : ''}
          </div>
        </div>`;
      gallery.appendChild(card);
    });
  }
}

function setMainCat(cat, btn) {
  currentMainCat = cat;
  currentSubCat = 'all';
  document.querySelectorAll('#mainTabs .tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const subRow = document.getElementById('subRow');
  if (cat !== 'all') {
    subRow.classList.add('visible');
    let subOptions = [];
    if (cat === 'game') subOptions = ['RPG', 'Action', 'Puzzle', 'Visual Novel', 'Platformer', 'Other'];
    if (cat === 'mod') subOptions = ['Client-side', 'Server-side', 'Content', 'Utility', 'Other'];
    if (cat === '3d') subOptions = ['Character', 'Building', 'Object', 'Creature', 'Other'];
    
    subRow.innerHTML = `<span class="filter-label">Type:</span><button class="tab subtab active" data-sub="all" onclick="setSubCat('all',this)">All</button>`;
    subOptions.forEach(opt => {
      subRow.innerHTML += `<button class="tab subtab" data-sub="${opt.toLowerCase()}" onclick="setSubCat('${opt.toLowerCase()}',this)">${opt}</button>`;
    });
  } else {
    subRow.classList.remove('visible');
  }
  renderGallery();
}

function setSubCat(sub, btn) {
  currentSubCat = sub;
  document.querySelectorAll('#subRow .subtab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderGallery();
}

function handleSortChange() {
  currentSort = document.getElementById('sortSelect').value;
  renderGallery();
}

loadData();

// ── Modal ──
function openModal(w) {
  const catSetting = settings.categories && settings.categories[w.cat] ? settings.categories[w.cat] : {};
  const catLabel = catSetting.name || ({game:'Game', mod:'Minecraft Mod', '3d':'3D Model'}[w.cat] || w.cat);
  
  let catIconUrl = '';
  if(catSetting.iconId && settings.icons) {
    const ic = settings.icons.find(x => x.id === catSetting.iconId);
    if(ic) catIconUrl = ic.url;
  }
  const catIcon = catIconUrl ? `<img src="${catIconUrl}" style="width:18px;height:18px;object-fit:contain;image-rendering:pixelated;">` : '';
  const subLabel = w.subcat ? w.subcat.charAt(0).toUpperCase() + w.subcat.slice(1) : '';

  // Media area
  const media = document.getElementById('modalMedia');
  if (w.cat === '3d' && w.model) {
    media.innerHTML = '<canvas class="modal-viewer" id="threeCanvas"></canvas><p class="viewer-hint">🖱 Drag = Rotate &nbsp;·&nbsp; Shift+Drag = Pan &nbsp;·&nbsp; Scroll = Zoom</p>';
    setTimeout(() => initThreeViewer(w.model), 80);
  } else if (w.image) {
    media.innerHTML = `<div class="modal-img-wrap" id="imgWrap"><img class="modal-img" id="modalImgEl" src="${w.image}" alt="${w.name}" style="object-position:center ${w.imageFocal||50}%"></div><p class="viewer-hint">↕ Drag image up/down to adjust</p>`;
    initImgDrag();
  } else {
    media.innerHTML = `<div class="modal-img-placeholder">${catIcon||''}</div>`;
  }

  document.getElementById('modalTitle').textContent = w.name;
  document.getElementById('modalDesc').textContent = w.desc || '';
  
  window.currentModalWorkId = w.id;
  window.updateModalLikeBtn();

  let toolsHtml = '';
  if(w.tools && w.tools.length > 0 && settings.icons) {
    w.tools.forEach(tid => {
      const ic = settings.icons.find(x => x.id === tid);
      if(ic) toolsHtml += `<img src="${ic.url}" title="${ic.name}" style="width:24px;height:24px;object-fit:cover;image-rendering:pixelated;border:2px solid var(--dark);background:var(--white);">`;
    });
  }

  const badges = document.getElementById('modalBadges');
  badges.innerHTML = `<span class="cat-badge">${catIcon}${catLabel}</span>`;
  if (subLabel) badges.innerHTML += `<span class="cat-badge sub">${subLabel}</span>`;
  if (toolsHtml) badges.innerHTML += `<div style="display:flex;gap:6px;align-items:center;margin-left:8px;padding-left:8px;border-left:3px solid var(--dark);">${toolsHtml}</div>`;

  const linksContainer = document.getElementById('modalLinksContainer');
  linksContainer.innerHTML = '';
  // Support both legacy .link and new .links array
  let wLinks = w.links ? w.links : (w.link ? [{url: w.link, label: 'VIEW PROJECT'}] : []);
  if(wLinks.length > 0) {
    wLinks.forEach(l => {
      if(!l.url) return;
      let iconHtml = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M14 3h7v7l-2-2-7 7-3-3 7-7-2-2zm-3 3H4v14h14v-7l2-2v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h10l-2 2z"/></svg>`;
      if(l.iconId && settings.icons) {
        const ic = settings.icons.find(x => x.id === l.iconId);
        if(ic) iconHtml = `<img src="${ic.url}" style="width:16px;height:16px;object-fit:cover;image-rendering:pixelated;">`;
      }
      linksContainer.innerHTML += `
        <a href="${l.url}" class="modal-link" target="_blank" rel="noopener" style="display:inline-flex;gap:8px;align-items:center;">
          ${iconHtml}
          ${l.label || 'Visit Link'}
        </a>
      `;
    });
  }

  // Render Team Button in Links Container
  const tpList = document.getElementById('teamPopupList');
  if (w.team && w.team.length > 0 && settings && settings.teams) {
    const teamMembers = w.team.map(id => settings.teams.find(t => t.id === id)).filter(Boolean);
      let teamBtnIconHtml = '<svg width="24" height="24" viewBox="0 0 24 24" fill="#4B0082"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>';
      if (settings.teamBtnIconId && settings.icons) {
        const globalIc = settings.icons.find(x => x.id === settings.teamBtnIconId);
        if (globalIc) teamBtnIconHtml = `<img src="${globalIc.url}" style="width:24px;height:24px;object-fit:cover;image-rendering:pixelated;">`;
      }
      
      linksContainer.innerHTML += `
        <button onclick="toggleTeamPopup()" class="modal-link" style="display:inline-flex;gap:8px;align-items:center;background:#d0eaff;cursor:pointer;">
          ${teamBtnIconHtml}
          <span style="font-family:'VT323',monospace;font-size:24px;color:var(--dark);">TEAM</span>
        </button>
      `;
      if (tpList) {
        tpList.innerHTML = '';
        teamMembers.forEach(member => {
          let iconHtml = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
          if (member.iconId && settings.icons) {
            const ic = settings.icons.find(x => x.id === member.iconId);
            if (ic) iconHtml = `<img src="${ic.url}" style="width:24px;height:24px;object-fit:cover;image-rendering:pixelated;">`;
          }
          let content = `
            <div style="display:flex; align-items:center; gap:12px; background:var(--sky4); padding:12px; border:2px solid var(--dark);">
              ${iconHtml}
              <div style="flex:1; font-family:'Press Start 2P', cursive; font-size:12px; color:var(--dark);">${member.name}</div>
            </div>
          `;
          if (member.url) {
            tpList.innerHTML += `<a href="${member.url}" target="_blank" rel="noopener" style="text-decoration:none; color:inherit; display:block;">${content}</a>`;
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

  // Center modal
  const box = document.getElementById('modalBox');
  const vw = window.innerWidth, vh = window.innerHeight;
  box.style.left = Math.max(0, (vw - Math.min(720, vw-40))/2) + 'px';
  box.style.top = Math.max(20, (vh - box.offsetHeight)/2) + 'px';

  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';

  // Re-center after render
  requestAnimationFrame(() => {
    box.style.top = Math.max(20, (vh - box.offsetHeight)/2) + 'px';
  });
}

// ── Image focal drag ──
function initImgDrag() {
  const wrap = document.getElementById('imgWrap');
  const img = document.getElementById('modalImgEl');
  if (!wrap || !img) return;
  let dragging = false, startY = 0, posY = 50;
  wrap.addEventListener('mousedown', e => { dragging=true; startY=e.clientY; e.preventDefault(); });
  wrap.addEventListener('touchstart', e => { dragging=true; startY=e.touches[0].clientY; }, {passive:true});
  window.addEventListener('mouseup', () => dragging=false);
  window.addEventListener('touchend', () => dragging=false);
  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    posY = Math.max(0, Math.min(100, posY - (e.clientY - startY) * 0.3));
    startY = e.clientY;
    img.style.objectPosition = `center ${posY}%`;
  });
  window.addEventListener('touchmove', e => {
    if (!dragging) return;
    posY = Math.max(0, Math.min(100, posY - (e.touches[0].clientY - startY) * 0.3));
    startY = e.touches[0].clientY;
    img.style.objectPosition = `center ${posY}%`;
  }, {passive:true});
}

// ── Modal drag ──
(function() {
  let dragging=false, ox=0, oy=0;
  document.addEventListener('mousedown', e => {
    const bar = document.getElementById('modalDragBar');
    if (!bar || !bar.contains(e.target)) return;
    dragging=true;
    const box=document.getElementById('modalBox');
    ox=e.clientX-box.offsetLeft; oy=e.clientY-box.offsetTop;
    e.preventDefault();
  });
  document.addEventListener('touchstart', e => {
    const bar = document.getElementById('modalDragBar');
    if (!bar || !bar.contains(e.target)) return;
    dragging=true;
    const box=document.getElementById('modalBox');
    ox=e.touches[0].clientX-box.offsetLeft; oy=e.touches[0].clientY-box.offsetTop;
  }, {passive:true});
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const box=document.getElementById('modalBox');
    const maxX=window.innerWidth-box.offsetWidth, maxY=window.innerHeight-60;
    box.style.left=Math.max(0,Math.min(maxX,e.clientX-ox))+'px';
    box.style.top=Math.max(0,Math.min(maxY,e.clientY-oy))+'px';
  });
  document.addEventListener('touchmove', e => {
    if (!dragging) return;
    const box=document.getElementById('modalBox');
    const maxX=window.innerWidth-box.offsetWidth, maxY=window.innerHeight-60;
    box.style.left=Math.max(0,Math.min(maxX,e.touches[0].clientX-ox))+'px';
    box.style.top=Math.max(0,Math.min(maxY,e.touches[0].clientY-oy))+'px';
  }, {passive:true});
  document.addEventListener('mouseup', () => dragging=false);
  document.addEventListener('touchend', () => dragging=false);
})();

function closeModal(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModalDirect();
}

function toggleTeamPopup() {
  document.getElementById('teamModalOverlay').classList.add('open');
}
  
function closeModalDirect() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
  disposeThreeViewer();
  document.getElementById('modalMedia').innerHTML = '';
}
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModalDirect(); });

// ── Three.js 3D Viewer ──
let threeRenderer=null, threeAnimId=null;
function initThreeViewer(modelUrl) {
  const canvas = document.getElementById('threeCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const W = canvas.clientWidth, H = canvas.clientHeight;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a2a3a);

  const camera = new THREE.PerspectiveCamera(45, W/H, 0.01, 1000);
  camera.position.set(0, 1.5, 4);

  threeRenderer = new THREE.WebGLRenderer({canvas, antialias:true});
  threeRenderer.setSize(W, H);
  threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dir = new THREE.DirectionalLight(0xffffff, 1.2);
  dir.position.set(3,5,3); scene.add(dir);
  const fill = new THREE.DirectionalLight(0x88aaff, 0.4);
  fill.position.set(-3,0,-3); scene.add(fill);

  // Orbit + Pan controls
  let isDragging=false, prevX=0, prevY=0;
  let rotX=0, rotY=0, zoom=4;
  let panX=0, panY=0;  // camera pan offset
  const group = new THREE.Group(); scene.add(group);

  canvas.addEventListener('mousedown', e=>{
    isDragging=true; prevX=e.clientX; prevY=e.clientY;
    e.preventDefault();
  });
  canvas.addEventListener('touchstart', e=>{
    isDragging=true;
    prevX=e.touches[0].clientX; prevY=e.touches[0].clientY;
  },{passive:true});
  window.addEventListener('mouseup', ()=>isDragging=false);
  window.addEventListener('touchend', ()=>isDragging=false);

  canvas.addEventListener('mousemove', e=>{
    if(!isDragging) return;
    const dx=e.clientX-prevX, dy=e.clientY-prevY;
    if(e.shiftKey){
      // Pan: move camera target
      panX -= dx * 0.005 * (zoom/4);
      panY += dy * 0.005 * (zoom/4);
    } else {
      // Rotate
      rotY += dx * 0.012;
      rotX += dy * 0.012;
      rotX = Math.max(-Math.PI/2, Math.min(Math.PI/2, rotX));
    }
    prevX=e.clientX; prevY=e.clientY;
  });

  canvas.addEventListener('touchmove', e=>{
    if(!isDragging) return;
    const dx=e.touches[0].clientX-prevX, dy=e.touches[0].clientY-prevY;
    // Two-finger = pan, one-finger = rotate
    if(e.touches.length===2){
      panX -= dx*0.005; panY += dy*0.005;
    } else {
      rotY+=dx*0.012; rotX+=dy*0.012;
      rotX=Math.max(-Math.PI/2,Math.min(Math.PI/2,rotX));
    }
    prevX=e.touches[0].clientX; prevY=e.touches[0].clientY;
  },{passive:true});

  canvas.addEventListener('wheel', e=>{
    zoom=Math.max(1,Math.min(16,zoom+e.deltaY*0.008));
    e.preventDefault();
  },{passive:false});

  // Load GLB
  const loader = new THREE.FileLoader();
  loader.setResponseType('arraybuffer');
  // Use GLTFLoader via dynamic import or inline parse
  // Fallback: load script then parse
  const script = document.createElement('script');
  script.src='https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';
  script.onload = () => {
    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.load(modelUrl, gltf => {
      const model = gltf.scene;
      // Auto-center and scale
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2.5 / maxDim;
      model.scale.setScalar(scale);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center.multiplyScalar(scale));
      group.add(model);
    }, undefined, err => {
      console.warn('GLB load error:', err);
      // Show placeholder cube if model fails
      const geo = new THREE.BoxGeometry(1.5,1.5,1.5);
      const mat = new THREE.MeshStandardMaterial({color:0x4a9fd4,roughness:.4,metalness:.3});
      group.add(new THREE.Mesh(geo,mat));
    });
  };
  document.head.appendChild(script);

  let autoRotY = 0;
  function animate(){
    threeAnimId = requestAnimationFrame(animate);
    // Auto-slow rotate when not dragging
    if(!isDragging) autoRotY += 0.004;
    group.rotation.x = rotX;
    group.rotation.y = rotY + autoRotY;
    // Apply pan to camera
    camera.position.set(panX, 1.5 + panY, zoom);
    camera.lookAt(panX, panY, 0);
    threeRenderer.render(scene, camera);
  }
  animate();
}

function disposeThreeViewer(){
  if(threeAnimId){ cancelAnimationFrame(threeAnimId); threeAnimId=null; }
  if(threeRenderer){ threeRenderer.dispose(); threeRenderer=null; }
}

// ── Game Navigation ──
function startGame() {
  document.querySelector('.page').classList.add('fade-out');
  const adminBtn = document.querySelector('.admin-fixed');
  if(adminBtn) adminBtn.style.opacity = '0';
  setTimeout(() => {
    window.location.href = 'game.html';
  }, 500);
}

// ── Settings Modal Logic ──
function openSettingsModal() {
  const modal = document.getElementById('settingsModal');
  const set = window.portfolioSettingsManager.getSettings();
  
  document.getElementById('setTheme').value = set.theme;
  document.getElementById('setGraphics').value = set.graphics;
  document.getElementById('setMasterVol').value = set.masterVolume;
  document.getElementById('setMusicVol').value = set.musicVolume;
  document.getElementById('setSfxVol').value = set.sfxVolume;

  modal.classList.add('open');
}

function closeSettingsModal() {
  document.getElementById('settingsModal').classList.remove('open');
}

function saveSettingsUI() {
  const newSet = {
    theme: document.getElementById('setTheme').value,
    graphics: document.getElementById('setGraphics').value,
    masterVolume: parseInt(document.getElementById('setMasterVol').value, 10),
    musicVolume: parseInt(document.getElementById('setMusicVol').value, 10),
    sfxVolume: parseInt(document.getElementById('setSfxVol').value, 10)
  };
  window.portfolioSettingsManager.updateSettings(newSet);
  // Sync volumes to audio engine in real-time
  if (window.portfolioAudioManager && window.portfolioAudioManager.setVolumes) {
    window.portfolioAudioManager.setVolumes({
      master: newSet.masterVolume,
      music:  newSet.musicVolume,
      sfx:    newSet.sfxVolume
    });
  }
}

// ── BGM Toggle for Portfolio Page ──
let _bgmOn = false;
window.togglePortfolioBGM = function() {
  if (!window.portfolioAudioManager) return;
  const isNowOn = window.portfolioAudioManager.togglePortfolioBGM();
  _bgmOn = isNowOn;
  const btn = document.getElementById('bgmTogglePortfolio');
  if (btn) {
    btn.textContent = _bgmOn ? '🔊' : '🔇';
  }
};



