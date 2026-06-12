// =============================================================================
// ARITSIA PORTFOLIO - Main Entry Point
// portfolio.js
// =============================================================================

import { getCurrentUser, onUserChange } from './authManager.js';
import { initSettings, getSettings, updateSettings } from './settingsManager.js';
import { initSkillTree, renderSkillTree } from './portfolio-skills.js';
import { initTimeline, renderTimeline } from './portfolio-timeline.js';

// ── Pixel particles ──
const canvas = document.getElementById('windCanvas');
const ctx = canvas.getContext('2d');
let W, H, particles = [];

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

resize();
window.addEventListener('resize', resize);

function rb(a, b) {
  return a + Math.random() * (b - a);
}

function createParticle(yStart) {
  const size = Math.floor(rb(2, 6)) * 2;
  return {
    x: Math.random() * W,
    y: yStart ?? H + size,
    size: size,
    speedY: rb(0.5, 2.5),
    speedX: rb(-0.5, 0.5),
    opacity: rb(0.1, 0.6)
  };
}

for (let i = 0; i < 40; i++) particles.push(createParticle(Math.random() * H));

function animateParticles() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach((p, i) => {
    p.y -= p.speedY;
    p.x += p.speedX;
    ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
    ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
    if (p.y + p.size < 0) particles[i] = createParticle();
  });
  requestAnimationFrame(animateParticles);
}

animateParticles();

// ── Portfolio Global State ──
let portfolioState = {
  theme: 'blue',
  skills: {},
  timeline: [],
  works: [],
  socials: []
};

// ── Init ──
async function initPortfolio() {
  try {
    // Initialize shared managers
    initSettings();

    // Load portfolio-specific data
    await initSkillTree();
    await initTimeline();
    await loadFeaturedWorks();
    await loadSocials();

    // Render all sections
    renderSkillTree();
    renderTimeline();
    renderWorks();
    renderSocials();

    // Setup event listeners
    setupEventListeners();

  } catch (e) {
    console.error('Portfolio init error:', e);
  }
}

// ── Load Featured Works from works.json ──
async function loadFeaturedWorks() {
  try {
    const response = await fetch('works.json?t=' + Date.now());
    const data = await response.json();
    // Filter for featured works (or just take first 6)
    portfolioState.works = (data || []).slice(0, 6);
  } catch (e) {
    console.error('Error loading works:', e);
    portfolioState.works = [];
  }
}

// ── Load Socials from settings.json ──
async function loadSocials() {
  try {
    const response = await fetch('settings.json?t=' + Date.now());
    const settings = await response.json();
    portfolioState.socials = settings.socials || [];
  } catch (e) {
    console.error('Error loading socials:', e);
    portfolioState.socials = [];
  }
}

// ── Render Works Grid ──
function renderWorks() {
  const container = document.getElementById('worksGrid');
  if (!container) return;

  container.innerHTML = '';

  portfolioState.works.forEach(work => {
    const card = document.createElement('div');
    card.className = 'work-card';

    const imageUrl = work.imageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e8f4f8" width="100" height="100"/%3E%3C/svg%3E';
    const category = work.category || '3D';
    const title = work.title || 'Untitled Work';
    const description = work.description || 'A portfolio piece';

    card.innerHTML = `
      <div class="work-image">
        <img src="${imageUrl}" alt="${title}" onerror="this.style.display='none'">
      </div>
      <div class="work-content">
        <span class="work-category">${category.toUpperCase()}</span>
        <h3 class="work-title">${title}</h3>
        <p class="work-description">${description}</p>
        <a href="index.html" class="work-link">View Gallery →</a>
      </div>
    `;

    container.appendChild(card);
  });
}

// ── Render Socials ──
function renderSocials() {
  const container = document.getElementById('socialsGrid');
  if (!container) return;

  container.innerHTML = '';

  portfolioState.socials.forEach(social => {
    const link = document.createElement('a');
    link.href = social.url;
    link.target = '_blank';
    link.className = 'social-link';

    link.innerHTML = `
      <div class="social-icon">
        <img src="${social.icon}" alt="${social.name}" onerror="this.style.display='none'">
      </div>
      <div class="social-name">${social.name}</div>
    `;

    container.appendChild(link);
  });
}

// ── Scroll to Section ──
window.scrollToSection = function (sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// ── Modal Functions ──
window.closeModal = function (modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
};

// ── Event Listeners ──
function setupEventListeners() {
  // Theme button
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const themes = ['blue', 'purple', 'green', 'orange', 'red'];
      const currentTheme = document.body.className.replace('theme-', '').split(' ')[0] || 'blue';
      const currentIndex = themes.indexOf(currentTheme);
      const nextTheme = themes[(currentIndex + 1) % themes.length];
      setTheme(nextTheme);
    });
  }

  // Help button
  const helpBtn = document.getElementById('helpBtn');
  if (helpBtn) {
    helpBtn.addEventListener('click', () => {
      const modal = document.getElementById('helpModal');
      if (modal) modal.classList.add('active');
    });
  }

  // Close modal on backdrop click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  // Close modal on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.active').forEach(modal => {
        modal.classList.remove('active');
      });
    }
  });
}

// ── Theme System ──
function setTheme(themeName) {
  const themes = ['blue', 'purple', 'green', 'orange', 'red'];
  document.body.className = '';

  if (themeName !== 'blue' && themes.includes(themeName)) {
    document.body.classList.add(`theme-${themeName}`);
  }

  localStorage.setItem('portfolioTheme', themeName);
  portfolioState.theme = themeName;
}

function loadTheme() {
  const saved = localStorage.getItem('portfolioTheme') || 'blue';
  setTheme(saved);
}

// ── DOM Ready ──
window.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  initPortfolio();
});
