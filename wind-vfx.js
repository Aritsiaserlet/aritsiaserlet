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
    speedRange: [0.5, 2.0],
    opacityRange: [0.08, 0.25],
    widthRange: [1, 3],
    curveAmount: 35,       // max horizontal bezier curve deviation (px)
    lengthRange: [60, 160] // streak length in px
  },
  particles: {
    count: 40,
    colors: ['#FFFFFF', '#C4B5E8', '#B8D9F0', '#F0EDE8'],
    speedRange: [0.3, 1.5],
    sizeRange: [2, 6],
    glowCount: 12,         // how many particles have soft glow
    sineAmplitude: 22,     // px lateral drift
    sineFrequency: 0.018,
    opacityRange: [0.15, 0.5]
  },
  wisps: {
    count: 7,
    colors: ['#FFFFFF', '#EAF3FA', '#D0E8F8'],
    speedRange: [0.08, 0.35],
    opacityRange: [0.03, 0.1],
    blurRange: [25, 55],
    sizeRange: [80, 220]   // ellipse width in px
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
    'z-index:999'
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
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.strokeStyle = `rgba(${rgb},1)`;
      ctx.lineWidth = this.width;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 0;

      ctx.beginPath();
      // Quadratic bezier — base at bottom, tip at top
      const cpX = this.x + this.curve;
      const cpY = this.y + this.length * 0.5;
      ctx.moveTo(this.x, this.y + this.length);
      ctx.quadraticCurveTo(cpX, cpY, this.x + this.curve * 0.4, this.y);
      ctx.stroke();
      ctx.restore();
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
      ctx.save();
      ctx.globalAlpha = this.opacity;
      if (this.isGlow) {
        ctx.shadowColor = `rgba(${rgb},0.8)`;
        ctx.shadowBlur  = this.size * 3.5;
      }
      ctx.fillStyle = `rgba(${rgb},1)`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
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
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.filter = `blur(${this.blur}px)`;
      ctx.fillStyle = `rgba(${rgb},1)`;
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.w * 0.5, this.h * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
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
