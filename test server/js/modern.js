// =============================================================================
// ARITSIA RETRO-PIXEL PORTFOLIO - MAIN LOGIC ENGINE
// test server/js/modern.js
// =============================================================================

// ── Config ──
const GH_USER = 'OzonZ';
const GH_REPO = 'Non-Four-Portfolio-Data';
const DATA_PATH = 'All File Aritsia';
const WORKS_URL = `https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/${encodeURIComponent(DATA_PATH)}/works.json`;
const SETTINGS_URL = `https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/${encodeURIComponent(DATA_PATH)}/settings.json`;

// ── State ──
let works = [];
let settings = {};
let currentMainCat = 'all';
let currentSubCat = 'all';
let currentSort = 'newest';
let searchQuery = '';
let globalLikes = {};
let userLikes = {};
let currentModalWork = null;
let currentModalImageIdx = 0;

// 3D Reel Carousel State
let showcaseWorks = [];
let showcaseActiveIndex = 0;
let showcaseTimer = null;
let isShowcasePaused = false;

// ── SVG Icons ──
const ICONS = {
  github: `<svg viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`,
  itch: `<svg viewBox="0 0 24 24"><path d="M3.13 1.338C2.08 1.96.02 4.328 0 4.95v1.03c0 1.303 1.22 2.45 2.325 2.45 1.33 0 2.436-1.102 2.436-2.41 0 1.308 1.07 2.41 2.4 2.41 1.328 0 2.362-1.102 2.362-2.41 0 1.308 1.137 2.41 2.466 2.41h.024c1.33 0 2.466-1.102 2.466-2.41 0 1.308 1.034 2.41 2.363 2.41 1.33 0 2.4-1.102 2.4-2.41 0 1.308 1.106 2.41 2.435 2.41C22.78 8.43 24 7.282 24 5.98V4.95c-.02-.62-2.082-2.99-3.13-3.612-3.253-.114-5.508-.134-8.87-.133-3.362 0-7.945.053-8.87.133zm6.376 6.477a2.74 2.74 0 0 1-.468.602c-.5.49-1.19.795-1.947.795a2.786 2.786 0 0 1-1.95-.795c-.182-.178-.32-.37-.446-.59-.127.222-.303.412-.486.59a2.788 2.788 0 0 1-1.95.795c-.092 0-.187-.025-.264-.052-.107 1.113-.152 2.176-.168 2.95v.005l-.006 1.167c.02 2.334-.23 7.564 1.03 8.85 1.952.454 5.545.662 9.15.663 3.605 0 7.198-.21 9.15-.664 1.26-1.284 1.01-6.514 1.03-8.848l-.006-1.167v-.004c-.016-.775-.06-1.838-.168-2.95-.077.026-.172.052-.263.052a2.788 2.788 0 0 1-1.95-.795c-.184-.178-.36-.368-.486-.59-.127.22-.265.412-.447.59a2.786 2.786 0 0 1-1.95.794c-.76 0-1.446-.303-1.948-.793a2.74 2.74 0 0 1-.468-.602 2.738 2.738 0 0 1-.463.602 2.787 2.787 0 0 1-1.95.794h-.16a2.787 2.787 0 0 1-1.95-.793 2.738 2.738 0 0 1-.464-.602z"/></svg>`,
  discord: `<svg viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z"/></svg>`,
  external: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>`,
  heart: `<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
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

// ── Data Fetching ──
async function loadData() {
  const token = sessionStorage.getItem('ghToken');

  try {
    let wRes, sRes;
    if (token) {
      wRes = await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${DATA_PATH}/works.json?t=` + Date.now(), {
        headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3.raw' }
      });
      sRes = await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${DATA_PATH}/settings.json?t=` + Date.now(), {
        headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3.raw' }
      });
    }

    if (!wRes || !wRes.ok) wRes = await fetch(WORKS_URL + '?t=' + Date.now());
    if (!sRes || !sRes.ok) sRes = await fetch(SETTINGS_URL + '?t=' + Date.now());

    if (wRes.ok) {
      works = await wRes.json();
      localStorage.setItem('cached_works', JSON.stringify(works));
    }
    if (sRes.ok) {
      settings = await sRes.json();
      localStorage.setItem('cached_settings', JSON.stringify(settings));
    }
  } catch (err) {
    console.warn('Network fetch failed, fallback to cache', err);
    const cw = localStorage.getItem('cached_works');
    const cs = localStorage.getItem('cached_settings');
    if (cw) works = JSON.parse(cw);
    if (cs) settings = JSON.parse(cs);
  }

  renderProfile();
  initShowcase();
  initCategories();
  renderWorksGrid();
}

// ── Profile & Socials ──
function renderProfile() {
  const avatarEl = document.getElementById('profileAvatar');
  if (avatarEl && settings.avatar) {
    avatarEl.src = settings.avatar;
  }

  const socialBox = document.getElementById('socialLinksBox');
  if (!socialBox) return;

  const socials = settings.socials || [
    { name: 'GitHub', url: 'https://github.com/Aritsiaserlet' },
    { name: 'Modrinth', url: 'https://modrinth.com/user/Aritsia' },
    { name: 'Itch.io', url: 'https://itch.io' },
    { name: 'Discord', url: 'https://discord.gg' }
  ];

  socialBox.innerHTML = socials.map(s => {
    let icon = ICONS.external;
    const nameLower = (s.name || '').toLowerCase();
    if (nameLower.includes('github')) icon = ICONS.github;
    else if (nameLower.includes('itch')) icon = ICONS.itch;
    else if (nameLower.includes('discord')) icon = ICONS.discord;

    return `
      <a href="${s.url}" target="_blank" rel="noreferrer" class="social-btn">
        ${icon}
        <span>${escapeHTML(s.name)}</span>
      </a>
    `;
  }).join('');
}

// ── Retro 3D Rotating Reel (Dynamic Showcase) ──
function initShowcase() {
  const deck = document.getElementById('carouselDeck');
  const dotsContainer = document.getElementById('carouselIndicators');
  if (!deck || !works.length) return;

  // Shuffle or select 8 works for the dynamic reel
  showcaseWorks = [...works].sort(() => Math.random() - 0.5).slice(0, 8);
  showcaseActiveIndex = 0;

  deck.innerHTML = showcaseWorks.map((w, idx) => {
    const imgUrl = Array.isArray(w.image) ? w.image[0] : (w.image || '../favicon.jpg');
    const catName = ({ game: 'GAME DEV', mod: 'MINECRAFT MOD', '3d': '3D MODEL' }[w.cat] || w.cat || 'PROJECT').toUpperCase();
    const yearStr = String(w.year || '').split(' ')[0] || '';
    const focalY = w.imageFocal !== undefined ? w.imageFocal : 50;

    return `
      <div class="carousel-card slot-hidden" data-index="${idx}" onclick="handleShowcaseCardClick(${idx})">
        <img src="${imgUrl}" alt="${escapeHTML(w.name)}" style="object-position: center ${focalY}%" loading="lazy">
        <div class="carousel-card-gradient"></div>
        <div class="carousel-card-content">
          <div class="card-badge-row">
            <span class="pixel-cat-badge">${catName}</span>
            ${yearStr ? `<span class="pixel-year-badge">${yearStr}</span>` : ''}
          </div>
          <h3 class="carousel-card-title">${escapeHTML(w.name)}</h3>
          <p class="carousel-card-desc">${escapeHTML(w.desc || 'An interactive pixel & 3D creation.')}</p>
          <div class="carousel-card-btn">
            <span>▶ EXPLORE WORK</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (dotsContainer) {
    dotsContainer.innerHTML = showcaseWorks.map((_, i) => `
      <div class="indicator-dot ${i === 0 ? 'active' : ''}" onclick="setShowcaseIndex(${i})"></div>
    `).join('');
  }

  updateShowcaseSlots();
  startShowcaseTimer();

  const stage = document.getElementById('carouselStage');
  if (stage) {
    stage.addEventListener('mouseenter', () => { isShowcasePaused = true; });
    stage.addEventListener('mouseleave', () => { isShowcasePaused = false; });
  }
}

function updateShowcaseSlots() {
  const cards = document.querySelectorAll('.carousel-card');
  const dots = document.querySelectorAll('.indicator-dot');
  const N = showcaseWorks.length;
  if (!N) return;

  cards.forEach((card, i) => {
    let diff = (i - showcaseActiveIndex) % N;
    if (diff < -Math.floor(N / 2)) diff += N;
    if (diff > Math.floor(N / 2)) diff -= N;

    card.classList.remove('slot-center', 'slot-left-1', 'slot-right-1', 'slot-left-2', 'slot-right-2', 'slot-hidden');

    if (diff === 0) {
      card.classList.add('slot-center');
    } else if (diff === -1) {
      card.classList.add('slot-left-1');
    } else if (diff === 1) {
      card.classList.add('slot-right-1');
    } else if (diff === -2) {
      card.classList.add('slot-left-2');
    } else if (diff === 2) {
      card.classList.add('slot-right-2');
    } else {
      card.classList.add('slot-hidden');
    }
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === showcaseActiveIndex);
  });
}

function nextShowcase() {
  const N = showcaseWorks.length;
  showcaseActiveIndex = (showcaseActiveIndex + 1) % N;
  updateShowcaseSlots();
}

function prevShowcase() {
  const N = showcaseWorks.length;
  showcaseActiveIndex = (showcaseActiveIndex - 1 + N) % N;
  updateShowcaseSlots();
}

function setShowcaseIndex(idx) {
  showcaseActiveIndex = idx;
  updateShowcaseSlots();
}

function startShowcaseTimer() {
  if (showcaseTimer) clearInterval(showcaseTimer);
  showcaseTimer = setInterval(() => {
    if (!isShowcasePaused) {
      nextShowcase();
    }
  }, 3800);
}

window.handleShowcaseCardClick = function(idx) {
  if (idx === showcaseActiveIndex) {
    openProjectModal(showcaseWorks[idx]);
  } else {
    setShowcaseIndex(idx);
  }
};

window.nextShowcase = nextShowcase;
window.prevShowcase = prevShowcase;
window.setShowcaseIndex = setShowcaseIndex;

// ── Enhanced Works Zone Engine ──
function initCategories() {
  const tabsContainer = document.getElementById('categoryTabs');
  if (!tabsContainer) return;

  const catCounts = { all: works.length };
  works.forEach(w => {
    if (w.cat) catCounts[w.cat] = (catCounts[w.cat] || 0) + 1;
  });

  const catLabels = {
    all: 'ALL',
    mod: 'MINECRAFT MODS',
    game: 'GAME DEV',
    '3d': '3D MODELS'
  };

  const cats = ['all', 'mod', 'game', '3d'];
  // Add any other dynamic categories
  Object.keys(catCounts).forEach(c => {
    if (!cats.includes(c)) cats.push(c);
  });

  tabsContainer.innerHTML = cats.map(cat => {
    const label = catLabels[cat] || (settings.categories && settings.categories[cat] && settings.categories[cat].name) || cat.toUpperCase();
    const count = catCounts[cat] || 0;
    const isActive = cat === currentMainCat ? 'active' : '';

    return `
      <button class="cat-tab ${isActive}" data-cat="${cat}" onclick="selectCategory('${cat}', this)">
        <span>${label}</span>
        <span class="cat-tab-count">${count}</span>
      </button>
    `;
  }).join('');
}

window.selectCategory = function(cat, btn) {
  currentMainCat = cat;
  currentSubCat = 'all';

  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');

  // Subcategories
  const subRow = document.getElementById('subcatRow');
  if (subRow) {
    const subcats = new Set();
    works.forEach(w => {
      if (w.cat === cat && w.subcat) subcats.add(w.subcat);
    });

    if (subcats.size > 0) {
      subRow.style.display = 'flex';
      subRow.innerHTML = `<span style="font-family:'Press Start 2P',cursive;font-size:10px;color:var(--dark);">SUBTYPE:</span>
        <button class="subcat-pill active" onclick="selectSubcat('all', this)">ALL</button>` +
        Array.from(subcats).map(s => `
          <button class="subcat-pill" onclick="selectSubcat('${s}', this)">${escapeHTML(s.toUpperCase())}</button>
        `).join('');
    } else {
      subRow.style.display = 'none';
    }
  }

  renderWorksGrid();
};

window.selectSubcat = function(sub, btn) {
  currentSubCat = sub;
  document.querySelectorAll('.subcat-pill').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderWorksGrid();
};

function renderWorksGrid() {
  const container = document.getElementById('worksGrid');
  if (!container) return;

  let filtered = works.filter(w => {
    if (currentMainCat !== 'all' && w.cat !== currentMainCat) return false;
    if (currentSubCat !== 'all' && w.subcat !== currentSubCat) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = (w.name || '').toLowerCase().includes(q);
      const matchDesc = (w.desc || '').toLowerCase().includes(q);
      const matchCat = (w.cat || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    if (currentSort === 'random') return Math.random() - 0.5;

    const parseY = (yStr) => {
      if (!yStr) return 0;
      return parseInt(String(yStr).split(' ')[0]) || 0;
    };

    if (currentSort === 'newest') return parseY(b.year) - parseY(a.year) || (b.id - a.id);
    if (currentSort === 'oldest') return parseY(a.year) - parseY(b.year) || (a.id - b.id);
    if (currentSort === 'most_liked') {
      const la = globalLikes[a.id] || 0;
      const lb = globalLikes[b.id] || 0;
      if (la !== lb) return lb - la;
      return parseY(b.year) - parseY(a.year);
    }
    return 0;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state">NO WORKS FOUND IN THIS CATEGORY.</div>`;
    return;
  }

  container.innerHTML = filtered.map(w => {
    const imgUrl = Array.isArray(w.image) ? w.image[0] : (w.image || '../favicon.jpg');
    const catName = ({ game: 'GAME', mod: 'MINECRAFT', '3d': '3D MODEL' }[w.cat] || w.cat || 'WORK').toUpperCase();
    const yearStr = String(w.year || '').split(' ')[0];
    const focalY = w.imageFocal !== undefined ? w.imageFocal : 50;
    const likesCount = globalLikes[w.id] || 0;
    const isLiked = userLikes[w.id] ? 'liked' : '';

    let toolsHtml = '';
    if (w.tools && w.tools.length > 0 && settings.icons) {
      toolsHtml = w.tools.slice(0, 3).map(tid => {
        const ic = settings.icons.find(x => x.id === tid);
        return ic ? `<img src="${ic.url}" title="${escapeHTML(ic.name)}" loading="lazy">` : '';
      }).join('');
    }

    return `
      <article class="work-card" onclick="openProjectModalById('${w.id}')">
        <div class="card-thumb-wrap">
          <img src="${imgUrl}" alt="${escapeHTML(w.name)}" style="object-position:center ${focalY}%" loading="lazy">
          <div class="card-top-badges">
            <span class="badge-cat">${catName}</span>
            ${yearStr ? `<span class="badge-year">${yearStr}</span>` : ''}
          </div>
        </div>
        <div class="card-body">
          <h3 class="card-title">${escapeHTML(w.name)}</h3>
          <p class="card-desc">${escapeHTML(w.desc || '')}</p>
          <div class="card-footer">
            <div class="card-tools">${toolsHtml}</div>
            <div style="display:flex;align-items:center;gap:8px;">
              <div class="like-btn ${isLiked}" onclick="handleLikeClick(event, '${w.id}')">
                ${ICONS.heart}
                <span>${likesCount}</span>
              </div>
              <span class="card-explore-btn">VIEW ▶</span>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// ── Detail Modal (RPG Inspection Dialogue) ──
window.openProjectModalById = function(id) {
  const w = works.find(item => String(item.id) === String(id));
  if (w) openProjectModal(w);
};

function openProjectModal(w) {
  currentModalWork = w;
  currentModalImageIdx = 0;

  const modal = document.getElementById('projectModal');
  const mediaArea = document.getElementById('modalMediaArea');
  const titleEl = document.getElementById('modalTitle');
  const metaEl = document.getElementById('modalMeta');
  const descEl = document.getElementById('modalDesc');
  const toolsEl = document.getElementById('modalTools');
  const actionBtnEl = document.getElementById('modalActionBtn');

  if (!modal) return;

  const catName = ({ game: 'GAME DEV', mod: 'MINECRAFT MOD', '3d': '3D MODEL' }[w.cat] || w.cat || 'PROJECT').toUpperCase();
  const yearStr = String(w.year || '').split(' ')[0];

  titleEl.textContent = w.name;
  metaEl.innerHTML = `
    <span class="pixel-cat-badge">${catName}</span>
    ${yearStr ? `<span class="pixel-year-badge">${yearStr}</span>` : ''}
  `;

  descEl.textContent = w.desc || 'No detailed description provided for this work.';

  if (w.tools && w.tools.length > 0 && settings.icons) {
    toolsEl.innerHTML = `<span style="font-family:'Press Start 2P',cursive;font-size:10px;color:var(--dark);">TOOLS:</span>` +
      w.tools.map(tid => {
        const ic = settings.icons.find(x => x.id === tid);
        return ic ? `<img src="${ic.url}" title="${escapeHTML(ic.name)}" style="width:26px;height:26px;border:2px solid var(--dark);background:#fff;object-fit:cover;">` : '';
      }).join('');
  } else {
    toolsEl.innerHTML = '';
  }

  if (w.link || (w.links && w.links.length > 0)) {
    const primaryUrl = w.link || w.links[0].url;
    const label = (w.links && w.links[0] && w.links[0].label) || 'VISIT PROJECT / DOWNLOAD';
    actionBtnEl.style.display = 'inline-flex';
    actionBtnEl.href = primaryUrl;
    actionBtnEl.innerHTML = `▶ ${escapeHTML(label)} ${ICONS.external}`;
  } else {
    actionBtnEl.style.display = 'none';
  }

  // Media
  if (w.cat === '3d' && w.model) {
    mediaArea.innerHTML = `<canvas id="threeModalCanvas" class="modal-3d-canvas"></canvas>`;
    setTimeout(() => initThreeViewer(w.model), 60);
  } else {
    const images = Array.isArray(w.image) ? w.image : [w.image || '../favicon.jpg'];
    renderModalImage(images, 0);
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function renderModalImage(images, idx) {
  const mediaArea = document.getElementById('modalMediaArea');
  if (!mediaArea) return;

  currentModalImageIdx = idx;
  const isMultiple = images.length > 1;

  mediaArea.innerHTML = `
    <img src="${images[idx]}" alt="Preview" style="width:100%;height:100%;object-fit:contain;">
    ${isMultiple ? `
      <button class="modal-carousel-nav prev" onclick="prevModalImg(event)">◀</button>
      <button class="modal-carousel-nav next" onclick="nextModalImg(event)">▶</button>
      <div class="modal-dots">
        ${images.map((_, i) => `<span class="modal-dot ${i === idx ? 'active' : ''}" onclick="setModalImg(${i}, event)"></span>`).join('')}
      </div>
    ` : ''}
  `;
}

window.prevModalImg = function(e) {
  if (e) e.stopPropagation();
  if (!currentModalWork) return;
  const images = Array.isArray(currentModalWork.image) ? currentModalWork.image : [currentModalWork.image];
  const nextIdx = (currentModalImageIdx - 1 + images.length) % images.length;
  renderModalImage(images, nextIdx);
};

window.nextModalImg = function(e) {
  if (e) e.stopPropagation();
  if (!currentModalWork) return;
  const images = Array.isArray(currentModalWork.image) ? currentModalWork.image : [currentModalWork.image];
  const nextIdx = (currentModalImageIdx + 1) % images.length;
  renderModalImage(images, nextIdx);
};

window.setModalImg = function(idx, e) {
  if (e) e.stopPropagation();
  if (!currentModalWork) return;
  const images = Array.isArray(currentModalWork.image) ? currentModalWork.image : [currentModalWork.image];
  renderModalImage(images, idx);
};

window.closeProjectModal = function() {
  const modal = document.getElementById('projectModal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
  currentModalWork = null;
};

// ── Three.js 3D Viewer ──
function initThreeViewer(modelUrl) {
  const canvas = document.getElementById('threeModalCanvas');
  if (!canvas) return;

  if (typeof THREE === 'undefined') {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    s.onload = () => initThreeViewer(modelUrl);
    document.head.appendChild(s);
    return;
  }

  if (typeof THREE.GLTFLoader === 'undefined') {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';
    s.onload = () => initThreeViewer(modelUrl);
    document.head.appendChild(s);
    return;
  }

  const W = canvas.clientWidth || 700;
  const H = canvas.clientHeight || 400;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a2a3a);

  const camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 1000);
  camera.position.set(0, 1.5, 4);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dir = new THREE.DirectionalLight(0xffffff, 1.2);
  dir.position.set(3, 5, 3);
  scene.add(dir);

  const loader = new THREE.GLTFLoader();
  loader.load(modelUrl, (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    function animate() {
      if (!document.getElementById('threeModalCanvas')) return;
      requestAnimationFrame(animate);
      model.rotation.y += 0.01;
      renderer.render(scene, camera);
    }
    animate();
  });
}

// ── Likes Interaction ──
window.handleLikeClick = async function(e, workId) {
  if (e) e.stopPropagation();

  const isLiked = userLikes[workId];
  if (isLiked) {
    userLikes[workId] = false;
    globalLikes[workId] = Math.max(0, (globalLikes[workId] || 1) - 1);
  } else {
    userLikes[workId] = true;
    globalLikes[workId] = (globalLikes[workId] || 0) + 1;
  }
  renderWorksGrid();

  if (window.portfolioAuthManager && window.portfolioAuthManager.toggleLike) {
    try {
      await window.portfolioAuthManager.toggleLike(workId, !isLiked);
    } catch (err) {
      console.warn('Firebase like failed:', err);
    }
  }
};

// ── Admin & Settings ──
window.goToAdmin = function() {
  const token = document.getElementById('adminTokenInput').value.trim();
  if (token.toLowerCase() === 'raktianna') {
    window.location.href = '../lovertian.html';
  } else if (token && (token.startsWith('ghp_') || token.startsWith('github_pat_'))) {
    sessionStorage.setItem('ghToken', token);
    window.location.href = '../admin.html';
  } else {
    const errEl = document.getElementById('adminErrorMsg');
    if (errEl) {
      errEl.innerText = 'PLEASE ENTER A VALID GITHUB TOKEN OR CODE.';
      setTimeout(() => { errEl.innerText = ''; }, 2500);
    }
  }
};

window.openSettingsModal = function() {
  const modal = document.getElementById('settingsModal');
  if (modal) modal.classList.add('open');
};

window.closeSettingsModal = function() {
  const modal = document.getElementById('settingsModal');
  if (modal) modal.classList.remove('open');
};

// ── Search & Controls Init ──
function initControls() {
  const searchInput = document.getElementById('workSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderWorksGrid();
    });
  }

  const sortSelect = document.getElementById('workSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderWorksGrid();
    });
  }

  const jumpBtn = document.getElementById('exploreJumpBtn');
  if (jumpBtn) {
    jumpBtn.addEventListener('click', () => {
      const target = document.getElementById('worksSection');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProjectModal();
      closeSettingsModal();
    }
  });
}

// ── Pixel Wind Canvas Animation ──
function initWindCanvas() {
  const canvas = document.getElementById('windCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      size: Math.floor(Math.random() * 3 + 2) * 2,
      speedX: Math.random() * 1.5 - 0.75,
      speedY: -(Math.random() * 1.5 + 0.8),
      opacity: Math.random() * 0.4 + 0.1
    };
  }

  for (let i = 0; i < 35; i++) particles.push(createParticle());

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      if (p.y < -10) {
        p.y = H + 10;
        p.x = Math.random() * W;
      }
    });
    requestAnimationFrame(animate);
  }
  animate();
}

// ── App Init ──
document.addEventListener('DOMContentLoaded', () => {
  initWindCanvas();
  initControls();
  loadData();
});
