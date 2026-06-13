/**
 * 🌬️ Wind VFX — Anti-Gravity Portfolio Background Effect
 * Version 1.0
 * 3 layers: Wind Streaks | Floating Particles | Cloud Wisps
 * Pure Vanilla JS + Canvas API — no dependencies
 */

// ─────────────────────────────────────────────
// CONFIG — tweak all values here
// ─────────────────────────────────────────────
const WIND_CONFIG = {
  streaks: {
    count: 20,
    colors: ['#FFFFFF', '#B8D9F0', '#EAF3FA'],
    speedRange: [3.0, 8.0],
    opacityRange: [0.2, 0.5],
    widthRange: [4, 8],
    curveAmount: 30,       // max horizontal sine curve deviation (px)
    lengthRange: [60, 160] // streak length in px
  },
  particles: {
    count: 40,
    colors: ['#FFFFFF', '#C4B5E8', '#B8D9F0', '#F0EDE8'],
    speedRange: [2.0, 5.0],
    sizeRange: [4, 12],
    glowCount: 0,          // no soft glow for pixel style
    sineAmplitude: 15,     // px lateral drift
    sineFrequency: 0.02,
    opacityRange: [0.3, 0.8]
  },
  wisps: {
    count: 10,
    colors: ['#FFFFFF', '#EAF3FA', '#D0E8F8'],
    speedRange: [0.5, 2.0],
    opacityRange: [0.05, 0.15],
    blurRange: [0, 0],
    sizeRange: [40, 100]   // block width in px
  },
  performance: {
    targetFPS: 60,
    reducedMotionMultiplier: 0.2 // keeps 20% of particles if reduced-motion
  }
};

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────
function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}
function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

// ─────────────────────────────────────────────
// MAIN — initialise and run
// ─────────────────────────────────────────────
(function initWindVFX() {
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'wind-vfx';
  canvas.style.cssText = [
    'position:fixed',
    'inset:0',
    'width:100%',
    'height:100%',
    'pointer-events:none',
    'z-index:0',
    'image-rendering:pixelated'
  ].join(';');
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  // Respect reduced-motion preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const multiplier = prefersReduced ? WIND_CONFIG.performance.reducedMotionMultiplier : 1;

  let W, H;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // ─── Layer 1: WIND STREAKS ───────────────────
  class Streak {
    constructor() { this.reset(true); }
    reset(randomY = false) {
      const cfg = WIND_CONFIG.streaks;
      this.x     = rand(0, W);
      this.y     = randomY ? rand(-H, H) : H + rand(10, 80);
      this.speed = rand(...cfg.speedRange);
      this.color = randChoice(cfg.colors);
      this.opacity = rand(...cfg.opacityRange);
      this.width = rand(...cfg.widthRange);
      this.length = rand(...cfg.lengthRange);
      this.curve = rand(-cfg.curveAmount, cfg.curveAmount);
      this.sineOffset = rand(0, Math.PI * 2);
      this.driftSpeed = rand(0.003, 0.009);
    }
    update() {
      this.y -= this.speed;
      // subtle horizontal drift via sine
      this.x += Math.sin(this.y * 0.012 + this.sineOffset) * 0.3;
      if (this.y + this.length < 0) this.reset();
    }
    draw() {
      const rgb = hexToRgb(this.color);
      ctx.fillStyle = `rgba(${rgb},${this.opacity})`;
      
      let currentY = this.y;
      let segSize = this.width;
      let segCount = Math.floor(this.length / (segSize * 1.5));
      
      for (let j = 0; j < segCount; j++) {
        let alpha = this.opacity * (1 - j / segCount);
        ctx.fillStyle = `rgba(${rgb},${alpha})`;
        let waveX = Math.sin(currentY * 0.012 + this.sineOffset) * this.curve;
        ctx.fillRect(Math.floor(this.x + waveX), Math.floor(currentY), Math.floor(segSize), Math.floor(segSize));
        currentY += segSize * 1.5;
      }
    }
  }

  // ─── Layer 2: FLOATING PARTICLES ─────────────
  class Particle {
    constructor(index) {
      this.isGlow = index < WIND_CONFIG.particles.glowCount;
      this.reset(true);
    }
    reset(randomY = false) {
      const cfg = WIND_CONFIG.particles;
      this.x         = rand(0, W);
      this.y         = randomY ? rand(-H, H) : H + rand(10, 60);
      this.speed     = rand(...cfg.speedRange);
      this.color     = randChoice(cfg.colors);
      this.opacity   = rand(...cfg.opacityRange);
      this.size      = rand(...cfg.sizeRange);
      this.sineOff   = rand(0, Math.PI * 2);
      this.sineFreq  = cfg.sineFrequency * rand(0.6, 1.4);
      this.sineAmp   = cfg.sineAmplitude * rand(0.5, 1.5);
      this.baseX     = this.x;
      this.t         = rand(0, 1000);
    }
    update() {
      this.t += 1;
      this.y  -= this.speed;
      // sine-wave lateral float
      this.x = this.baseX + Math.sin(this.t * this.sineFreq + this.sineOff) * this.sineAmp;
      if (this.y + this.size < 0) {
        this.baseX = rand(0, W);
        this.reset();
      }
    }
    draw() {
      const rgb = hexToRgb(this.color);
      ctx.fillStyle = `rgba(${rgb},${this.opacity})`;
      let s = Math.floor(this.size);
      ctx.fillRect(Math.floor(this.x), Math.floor(this.y), s, s);
    }
  }

  // ─── Layer 3: CLOUD WISPS ────────────────────
  class Wisp {
    constructor() { this.reset(true); }
    reset(randomY = false) {
      const cfg = WIND_CONFIG.wisps;
      this.w      = rand(...cfg.sizeRange);
      this.h      = this.w * rand(0.3, 0.55);
      this.x      = rand(-this.w * 0.5, W + this.w * 0.5);
      this.y      = randomY ? rand(-H, H) : H + this.h + rand(20, 100);
      this.speed  = rand(...cfg.speedRange);
      this.color  = randChoice(cfg.colors);
      this.opacity = rand(...cfg.opacityRange);
      this.blur   = rand(...cfg.blurRange);
    }
    update() {
      this.y -= this.speed;
      if (this.y + this.h < 0) this.reset();
    }
    draw() {
      const rgb = hexToRgb(this.color);
      ctx.fillStyle = `rgba(${rgb},${this.opacity})`;
      // Draw a cluster of large pixel blocks for the wisp
      let bw = Math.floor(this.w / 4);
      let bh = Math.floor(this.h / 4);
      let px = Math.floor(this.x);
      let py = Math.floor(this.y);
      
      ctx.fillRect(px, py, bw*2, bh*2);
      ctx.fillRect(px - bw, py + bh/2, bw, bh);
      ctx.fillRect(px + bw*2, py + bh/2, bw, bh);
      ctx.fillRect(px + bw/2, py - bh, bw, bh);
      ctx.fillRect(px + bw/2, py + bh*2, bw, bh);
    }
  }

  // ─── Instantiate all elements ────────────────
  const streakCount   = Math.round(WIND_CONFIG.streaks.count   * multiplier);
  const particleCount = Math.round(WIND_CONFIG.particles.count * multiplier);
  const wispCount     = Math.round(WIND_CONFIG.wisps.count     * multiplier);

  const streaks   = Array.from({ length: streakCount },   () => new Streak());
  const particles = Array.from({ length: particleCount }, (_, i) => new Particle(i));
  const wisps     = Array.from({ length: wispCount },     () => new Wisp());

  // ─── Animation loop ───────────────────────────
  let animId;
  function tick() {
    ctx.clearRect(0, 0, W, H);

    // Layer 3 first (back) → wisps (large blurry)
    wisps.forEach(w => { w.update(); w.draw(); });

    // Layer 1 → streaks (mid)
    streaks.forEach(s => { s.update(); s.draw(); });

    // Layer 2 → particles (front/glow on top)
    particles.forEach(p => { p.update(); p.draw(); });

    animId = requestAnimationFrame(tick);
  }
  tick();

  // Expose cleanup
  window.windVFX = {
    destroy() {
      cancelAnimationFrame(animId);
      canvas.remove();
      window.removeEventListener('resize', resize);
    },
    pause() { cancelAnimationFrame(animId); },
    resume() { tick(); }
  };
})();
