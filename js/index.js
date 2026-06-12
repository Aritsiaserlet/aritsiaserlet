// =============================================================================
// ARITSIA PORTFOLIO - Main JavaScript
// index.js
// =============================================================================

window.goToAdmin = function() {
  const token = document.getElementById('adminTokenInput').value.trim();
  if(token && token.startsWith('ghp_')) {
    sessionStorage.setItem('ghToken', token);
    document.querySelector('.page').classList.add('fade-out');
    setTimeout(() => {
      window.location.href = 'admin.html';
    }, 500);
  } else {
    document.getElementById('adminErrorMsg').innerText = 'Please enter a valid GitHub token.';
    setTimeout(() => {
      document.getElementById('adminErrorMsg').innerText = '';
    }, 2000);
  }
};

// ── Security Utils ──
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Wind / Pixel Particles Animation ──
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
    length: Math.floor(randBetween(20, 50)) * 6,
    speedY: randBetween(3.0, 8.0),
    phase: Math.random() * Math.PI * 2,
    opacity: randBetween(0.4, 0.9)
  };
}

for (let i = 0; i < 25; i++) {
  particles.push(createParticle(Math.random() * H));
}

let windAnimId;
function animateParticles() {
  if (document.hidden) {
    // Check again later, don't update canvas
    setTimeout(() => {
      windAnimId = requestAnimationFrame(animateParticles);
    }, 500);
    return;
  }
  ctx.clearRect(0, 0, W, H);
  particles.forEach((p, i) => {
    p.y -= p.speedY;
    
    let currentY = p.y;
    let segCount = Math.floor(p.length / 6);
    for (let j=0; j<segCount; j++) {
      let alpha = p.opacity * (1 - j/segCount); // fade out tail
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      let waveX = Math.floor(Math.sin(currentY * 0.015 + p.phase) * 12);
      ctx.fillRect(Math.floor(p.x + waveX), Math.floor(currentY), 6, 6);
      currentY += 8;
    }
    
    if (p.y + p.length < 0) {
      particles[i] = createParticle();
    }
  });
  windAnimId = requestAnimationFrame(animateParticles);
}
animateParticles();

// Restart immediately if user comes back
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && windAnimId) {
    cancelAnimationFrame(windAnimId);
    animateParticles();
  }
});

// ── Works Data from GitHub ──
let works = [];
let settings = {};
let currentMainCat = 'all';
let currentSubCat = 'all';
let currentSort = 'featured'; // Default sort

const GH_USER = 'OzonZ';
const GH_REPO = 'Non-Four-Portfolio-Data';
const DATA_PATH = 'All File Aritsia';
const WORKS_URL = `https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/${DATA_PATH}/works.json`;
const SETTINGS_URL = `https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/${DATA_PATH}/settings.json`;
// ── Skeleton Loading ──
function showSkeletons(count = 6) {
  const gallery = document.getElementById('gallery');
  gallery.querySelectorAll('.work-card,.skeleton-card').forEach(c => c.remove());
  document.getElementById('emptyState').style.display = 'none';
  for (let i = 0; i < count; i++) {
    const sk = document.createElement('div');
    sk.className = 'skeleton-card';
    sk.style.animationDelay = `${i * 0.06}s`;
    sk.innerHTML = `<div class="skeleton-thumb"></div><div class="skeleton-info"><div class="skeleton-line"></div><div class="skeleton-line short"></div></div>`;
    gallery.appendChild(sk);
  }
}

function hideSkeletons() {
  document.getElementById('gallery').querySelectorAll('.skeleton-card').forEach(c => c.remove());
}

async function loadData() {
  showSkeletons(6);
  const t = sessionStorage.getItem('ghToken');
  // Load Works
  try {
    let r;
    if (t) {
      r = await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${DATA_PATH}/works.json?ref=main&t=`+Date.now(), { headers: { 'Authorization': `token ${t}`, 'Accept': 'application/vnd.github.v3.raw' } });
      if (!r.ok) r = await fetch(WORKS_URL + '?t=' + Date.now());
    } else {
      r = await fetch(WORKS_URL + '?t=' + Date.now());
    }
    if (r.ok) works = await r.json();
    else works = [];
  } catch(e) { works = []; }
  
  // Load Settings
  try {
    let sr;
    if (t) {
      sr = await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${DATA_PATH}/settings.json?ref=main&t=`+Date.now(), { headers: { 'Authorization': `token ${t}`, 'Accept': 'application/vnd.github.v3.raw' } });
      if (!sr.ok) sr = await fetch(SETTINGS_URL + '?t=' + Date.now());
    } else {
      sr = await fetch(SETTINGS_URL + '?t=' + Date.now());
    }
    if (sr.ok) {
      settings = await sr.json();
      if(window.portfolioSettingsManager) window.portfolioSettingsManager.updateSettings(settings);
    }
  } catch(e) { console.log('No settings found'); }
  
  applySettings();
  hideSkeletons();
  renderGallery();
  if(window.initSoundBtns) window.initSoundBtns();
}

// ── Apply Settings (Profile, Background, Socials, Categories) ──
function applySettings() {
  if (settings.profileImage) {
    const pFit = settings.profileFit || 'cover';
    const pPos = settings.profilePos || 'center';
    const isVideo = settings.profileImage.toLowerCase().includes('.mp4') || settings.profileImage.startsWith('data:video');
    if (isVideo) {
      document.getElementById('avatarInner').innerHTML = `<video src="${settings.profileImage}" autoplay loop muted playsinline style="width:100%; height:100%; object-fit:${pFit}; object-position:${pPos};"></video>`;
    } else {
      document.getElementById('avatarInner').innerHTML = `<img src="${settings.profileImage}" alt="Profile" style="width:100%; height:100%; object-fit:${pFit}; object-position:${pPos};">`;
    }
  }
  if (settings.backgroundImage) {
    const bg = document.getElementById('customBg');
    const bgVid = document.getElementById('customBgVideo');
    const bFit = settings.bgSize || 'cover';
    const bPos = settings.bgPos || 'center';
    const isVideo = settings.backgroundImage.toLowerCase().includes('.mp4') || settings.backgroundImage.startsWith('data:video');
    
    if (isVideo) {
      bg.style.opacity = '0';
      if(bgVid) {
        bgVid.src = settings.backgroundImage;
        bgVid.style.objectFit = bFit;
        bgVid.style.objectPosition = bPos;
        bgVid.style.opacity = '1';
      }
    } else {
      if(bgVid) { bgVid.style.opacity = '0'; bgVid.src = ''; }
      bg.style.backgroundImage = `url('${settings.backgroundImage}')`;
      bg.style.backgroundSize = bFit;
      bg.style.backgroundPosition = bPos;
      bg.style.opacity = '1';
    }
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

// ── Work Gallery Rendering ──
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
    filtered.forEach((w, idx) => {
      const card = document.createElement('div');
      card.className = 'work-card';
      card.tabIndex = 0;
      card.style.animationDelay = `${idx * 0.05}s`;
      card.onclick = () => openModal(w);
      card.onkeydown = (e) => { if(e.key==='Enter'||e.key===' ') { e.preventDefault(); openModal(w); } };
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

      const safeName = escapeHTML(w.name);
      const safeLabel = escapeHTML(catLabel);
      const safeSub = escapeHTML(subLabel);

      card.innerHTML = `
        <div class="card-thumb">
          ${w.image ? `<img src="${Array.isArray(w.image) ? w.image[0] : w.image}" alt="${safeName}" loading="lazy" style="object-position:center ${focalY}%">` : `<div style="font-size:48px;">${catIcon||''}</div>`}
          ${w.cat === '3d' ? `<div style="position:absolute;top:8px;left:8px;background:var(--white);border:2px solid var(--dark);padding:2px 6px;font-size:14px;display:flex;align-items:center;gap:4px;box-shadow:2px 2px 0 var(--dark);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            3D
          </div>` : ''}
          <div class="like-btn" tabindex="0" onclick="window.handleLikeClick(event, '${w.id}')" onkeydown="if(event.key==='Enter'||event.key===' ') { event.preventDefault(); window.handleLikeClick(event, '${w.id}'); }" style="color:${heartColor};">
            <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="${heartFill}"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <span style="font-family:'VT323',monospace;font-size:18px;margin-top:2px;">${likesCount}</span>
          </div>
        </div>
        <div class="card-info">
          <p class="card-name">${safeName}</p>
          <div class="card-cats" style="align-items:center;">
            <span class="cat-badge">${catIcon}${safeLabel}</span>
            ${safeSub ? `<span class="cat-badge sub">${safeSub}</span>` : ''}
            ${toolsHtml ? `<div style="display:flex;gap:4px;margin-left:auto;">${toolsHtml}</div>` : ''}
          </div>
        </div>`;
      gallery.appendChild(card);
    });
  }
}

// ── Gallery Filter Controls ──
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

// ── Modal Logic ──
function openModal(w) {
  if (window.portfolioAudioManager && window.portfolioAudioManager.sfxBtn) window.portfolioAudioManager.sfxBtn();
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
    let images = Array.isArray(w.image) ? w.image : [w.image];
    if (images.length > 1) {
      window.currentGalleryImages = images;
      window.currentGalleryIndex = 0;
      media.innerHTML = `
        <div class="modal-carousel" style="position:relative; width:100%; aspect-ratio:16/9; background:#000; border-bottom:4px solid var(--dark);">
          <button onclick="prevGalleryImage(event)" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);z-index:10;background:var(--white);border:3px solid var(--dark);padding:8px 12px;cursor:pointer;font-weight:bold;font-size:20px;box-shadow:2px 2px 0 var(--dark);">❮</button>
          <img class="modal-img" id="modalImgEl" src="${images[0]}" alt="${w.name}" style="object-fit:contain; width:100%; height:100%; image-rendering:pixelated; display:block;">
          <button onclick="nextGalleryImage(event)" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);z-index:10;background:var(--white);border:3px solid var(--dark);padding:8px 12px;cursor:pointer;font-weight:bold;font-size:20px;box-shadow:2px 2px 0 var(--dark);">❯</button>
          <div id="galleryDots" style="position:absolute;bottom:10px;left:0;right:0;text-align:center;pointer-events:none;">
            ${images.map((_, i) => `<span style="display:inline-block;width:10px;height:10px;margin:0 4px;background:${i===0?'var(--gold)':'var(--white)'};border:2px solid var(--dark);border-radius:50%;"></span>`).join('')}
          </div>
        </div>
        <div id="galleryThumbnails" style="display:flex; gap:8px; padding:12px; overflow-x:auto; background:var(--sky1); border-bottom:4px solid var(--dark);">
          ${images.map((imgUrl, i) => `
            <div onclick="setGalleryImage(${i})" style="flex-shrink:0; width:80px; height:60px; border:3px solid ${i===0?'var(--gold)':'var(--dark)'}; border-radius:4px; overflow:hidden; cursor:pointer; box-shadow:2px 2px 0 var(--dark); transition:transform 0.1s;">
              <img src="${imgUrl}" style="width:100%; height:100%; object-fit:cover;">
            </div>
          `).join('')}
        </div>
        <p class="viewer-hint">Use arrows or click thumbnails to view more images</p>
      `;
    } else {
      media.innerHTML = `<div class="modal-img-wrap" id="imgWrap"><img class="modal-img" id="modalImgEl" src="${images[0]}" alt="${w.name}" style="object-position:center ${w.imageFocal||50}%"></div><p class="viewer-hint">↕ Drag image up/down to adjust</p>`;
      initImgDrag();
    }
  } else {
    media.innerHTML = `<div class="modal-img-placeholder">${catIcon||''}</div>`;
  }

  let toolsHtml = '';
  if(w.tools && w.tools.length > 0 && settings.icons) {
    w.tools.forEach(tid => {
      const ic = settings.icons.find(x => x.id === tid);
      if(ic) toolsHtml += `<img src="${ic.url}" title="${ic.name}" style="width:24px;height:24px;object-fit:cover;image-rendering:pixelated;border:2px solid var(--dark);background:var(--white);">`;
    });
  }

  const safeName = escapeHTML(w.name);
  const safeDesc = escapeHTML(w.desc || '');
  const safeLabel = escapeHTML(catLabel);
  const safeSub = escapeHTML(subLabel);

  document.getElementById('modalTitle').innerText = safeName;
  document.getElementById('modalDesc').innerText = safeDesc;

  const badges = document.getElementById('modalBadges');
  badges.innerHTML = `
    <span class="cat-badge">${catIcon}${safeLabel}</span>
    ${safeSub ? `<span class="cat-badge sub">${safeSub}</span>` : ''}
  `;
  if (toolsHtml) badges.innerHTML += `<div style="display:flex;gap:6px;align-items:center;margin-left:8px;padding-left:8px;border-left:3px solid var(--dark);">${toolsHtml}</div>`;

  window.currentModalWorkId = w.id;
  window.updateModalLikeBtn();

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
    if (teamMembers.length > 0) {
      let teamBtnIconHtml = '';
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
          let iconHtml = '';
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
          if (member.link) {
            tpList.innerHTML += `<a href="${member.link}" target="_blank" rel="noopener" style="text-decoration:none; color:inherit; display:block;">${content}</a>`;
          } else {
            tpList.innerHTML += content;
          }
        });
      }
    }
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

window.nextGalleryImage = function(e) {
  if (e) e.stopPropagation();
  if (!window.currentGalleryImages) return;
  window.currentGalleryIndex = (window.currentGalleryIndex + 1) % window.currentGalleryImages.length;
  updateGalleryCarousel();
};

window.prevGalleryImage = function(e) {
  if (e) e.stopPropagation();
  if (!window.currentGalleryImages) return;
  window.currentGalleryIndex = (window.currentGalleryIndex - 1 + window.currentGalleryImages.length) % window.currentGalleryImages.length;
  updateGalleryCarousel();
};

window.setGalleryImage = function(index) {
  if (!window.currentGalleryImages) return;
  window.currentGalleryIndex = index;
  updateGalleryCarousel();
};

function updateGalleryCarousel() {
  const imgEl = document.getElementById('modalImgEl');
  if (imgEl) imgEl.src = window.currentGalleryImages[window.currentGalleryIndex];
  
  const dotsContainer = document.getElementById('galleryDots');
  if (dotsContainer) {
    const dots = dotsContainer.children;
    for (let i = 0; i < dots.length; i++) {
      dots[i].style.background = i === window.currentGalleryIndex ? 'var(--gold)' : 'var(--white)';
    }
  }

  const thumbContainer = document.getElementById('galleryThumbnails');
  if (thumbContainer) {
    const thumbs = thumbContainer.children;
    for (let i = 0; i < thumbs.length; i++) {
      thumbs[i].style.borderColor = i === window.currentGalleryIndex ? 'var(--gold)' : 'var(--dark)';
    }
  }
}

// ── Image Focal Drag (Modal) ──
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

// ── Modal Drag Logic ──
(function() {
  let draggingM=false, draggingT=false, oxM=0, oyM=0, oxT=0, oyT=0;
  
  function getEventPos(e) {
    return e.touches ? {x: e.touches[0].clientX, y: e.touches[0].clientY} : {x: e.clientX, y: e.clientY};
  }

  function handleDown(e) {
    const barM = document.getElementById('modalDragBar');
    const barT = document.getElementById('teamDragBar');
    const pos = getEventPos(e);
    
    if (barT && barT.contains(e.target)) {
      draggingT = true;
      const tbox = document.getElementById('teamModalBox');
      const mbox = document.getElementById('modalBox');
      tbox.style.zIndex = parseInt(mbox.style.zIndex || 100) + 1;
      oxT = pos.x - tbox.offsetLeft;
      oyT = pos.y - tbox.offsetTop;
      if(!e.touches) e.preventDefault();
      return;
    }
    
    if (barM && barM.contains(e.target)) {
      draggingM = true;
      const mbox = document.getElementById('modalBox');
      oxM = pos.x - mbox.offsetLeft;
      oyM = pos.y - mbox.offsetTop;
      if(!e.touches) e.preventDefault();
    }
  }

  function handleMove(e) {
    if (!draggingM && !draggingT) return;
    const pos = getEventPos(e);
    
    if (draggingT) {
      const box = document.getElementById('teamModalBox');
      const maxX = window.innerWidth - box.offsetWidth, maxY = window.innerHeight - 60;
      box.style.left = Math.max(0, Math.min(maxX, pos.x - oxT)) + 'px';
      box.style.top = Math.max(0, Math.min(maxY, pos.y - oyT)) + 'px';
    } else if (draggingM) {
      const box = document.getElementById('modalBox');
      const maxX = window.innerWidth - box.offsetWidth, maxY = window.innerHeight - 60;
      box.style.left = Math.max(0, Math.min(maxX, pos.x - oxM)) + 'px';
      box.style.top = Math.max(0, Math.min(maxY, pos.y - oyM)) + 'px';
    }
  }

  function handleUp() {
    draggingM = false;
    draggingT = false;
  }

  document.addEventListener('mousedown', handleDown);
  document.addEventListener('touchstart', handleDown, {passive:true});
  document.addEventListener('mousemove', handleMove);
  document.addEventListener('touchmove', handleMove, {passive:true});
  document.addEventListener('mouseup', handleUp);
  document.addEventListener('touchend', handleUp);
})();

function closeModal(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModalDirect();
}

function toggleTeamPopup() {
  if (window.portfolioAudioManager && window.portfolioAudioManager.sfxBtn) window.portfolioAudioManager.sfxBtn();
  const tb = document.getElementById('teamModalBox');
  if (tb.style.display === 'block') {
    tb.style.display = 'none';
    tb.classList.remove('open');
  } else {
    tb.style.display = 'block';
    tb.classList.add('open');
    // Center it slightly offset from the main modal
    const vw = window.innerWidth, vh = window.innerHeight;
    tb.style.left = Math.max(0, (vw - Math.min(400, vw-40))/2 + 40) + 'px';
    tb.style.top = Math.max(20, (vh - tb.offsetHeight)/2 + 40) + 'px';
  }
}
  
function closeModalDirect() {
  document.getElementById('modalOverlay').classList.remove('open');
  const tb = document.getElementById('teamModalBox');
  if (tb) {
    tb.style.display = 'none';
    tb.classList.remove('open');
  }
  document.body.style.overflow = '';
  disposeThreeViewer();
  document.getElementById('modalMedia').innerHTML = '';
}
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModalDirect(); });

// ── Three.js 3D Viewer ──
let threeRenderer=null, threeAnimId=null;
function initThreeViewer(modelUrl) {
  const canvas = document.getElementById('threeCanvas');
  if (!canvas) return;

  if (typeof THREE === 'undefined' || typeof THREE.GLTFLoader === 'undefined') {
    // Show loading text
    const ctx = canvas.getContext('2d');
    if(ctx) { ctx.fillStyle = '#fff'; ctx.fillText('Loading 3D Engine...', 20, 30); }
    
    if (typeof THREE === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.onload = () => initThreeViewer(modelUrl);
      document.head.appendChild(script);
      return;
    }
    if (typeof THREE.GLTFLoader === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';
      script.onload = () => initThreeViewer(modelUrl);
      document.head.appendChild(script);
      return;
    }
  }

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

  // Resize handling
  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        threeRenderer.setSize(width, height, false);
      }
    }
  });
  resizeObserver.observe(canvas);
  
  // Store observer so we can disconnect it
  canvas._resizeObserver = resizeObserver;

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
  if(threeRenderer){ 
    const canvas = threeRenderer.domElement;
    if (canvas && canvas._resizeObserver) {
      canvas._resizeObserver.disconnect();
      canvas._resizeObserver = null;
    }
    threeRenderer.dispose(); 
    threeRenderer=null; 
  }
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
window.updateSoundBtn = function(btn, isMuted) {
  if(!btn) return;
  const set = window.portfolioSettingsManager ? window.portfolioSettingsManager.getSettings() : {};
  let iconUrl = '';
  if (set && set.soundBtnIconId && set.icons) {
    const ic = set.icons.find(x => x.id === set.soundBtnIconId);
    if (ic) iconUrl = ic.url;
  }
  if (iconUrl) {
    btn.innerHTML = `<img src="${iconUrl}" style="width:24px;height:24px;object-fit:contain;image-rendering:pixelated;opacity:${isMuted ? '0.5' : '1'};filter:${isMuted ? 'grayscale(100%)' : 'none'};">`;
  } else {
    btn.textContent = isMuted ? '🔇' : '🔊';
  }
};

window.initSoundBtns = function() {
  const btns = ['masterMuteBtn', 'musicMuteBtn', 'sfxMuteBtn', 'bgmTogglePortfolio'];
  btns.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      const isMuted = btn.textContent.includes('🔇') || btn.innerHTML.includes('opacity: 0.5') || btn.innerHTML.includes('opacity:0.5');
      window.updateSoundBtn(btn, isMuted);
    }
  });
};

function openSettingsModal() {
  const modal = document.getElementById('settingsModal');
  const set = window.portfolioSettingsManager.getSettings();
  

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
    if(window.updateSoundBtn) window.updateSoundBtn(btn, !_bgmOn);
    else btn.textContent = _bgmOn ? '🔊' : '🔇';
  }
};

// ── Global Micro-interactions ──
document.addEventListener('mousedown', (e) => {
  const btn = e.target.closest('button, .tab, .work-card, .like-btn, .admin-btn, .game-btn, .social-btn, .modal-link');
  if (btn) {
    const ripple = document.createElement('div');
    ripple.className = 'px-ripple';
    const rect = btn.getBoundingClientRect();
    ripple.style.left = (e.clientX - rect.left - 4) + 'px';
    ripple.style.top = (e.clientY - rect.top - 4) + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  }
});
