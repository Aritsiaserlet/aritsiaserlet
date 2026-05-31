// ── Portfolio Minigame Engine ──
// Standalone game.js — designed for game.html

// ─────────────────────────────────────────────
// ── Tunable Constants
// ─────────────────────────────────────────────
const MIN_ENEMY_GAP   = 380;   // px gap between enemies
const DIVE_SPEED      = 22;    // constant downward velocity px/frame
const VX_DIVE         = 3;     // forward lean px/frame
const STRIKE_FRAMES   = 4;     // frames held at impact
const ASCENT_SPEED    = 16;    // constant upward velocity px/frame
const CHAIN_THRESHOLD = 0.38;  // fraction of ascent before SPACE re-enables
const HITBOX_PAD      = 8;     // extra px on each side of AABB during strike
const TILT_DIVE       = 15;    // degrees of block rotation during dive
const TILT_STRIKE     = 25;    // degrees of block rotation at impact
const DEG             = Math.PI / 180;

// ─────────────────────────────────────────────
// ── Engine State
// ─────────────────────────────────────────────
let canvas, ctx;
let W, H;
let animId = null;
let frameCount = 0; // global frame counter for time-based effects

let worksData    = [];
let gameSettings = {};

let isPlaying    = false;
let score        = 0;
let fireworks    = 0;
let multiplier   = 1;
let boostTimer   = 0;
let baseSpeed    = 5;
let currentSpeed = baseSpeed;

// ── Player (unchanged from approved system)
let player = {
  x:       0,
  y:       0,
  vy:      0,
  vxDive:  0,
  baseX:   0,
  w:       44,
  h:       44,
  startY:  0,
  groundY: 0
};

// ── Attack State Machine (unchanged)
let attack = {
  phase:      'idle',
  frameCount: 0,
  canChain:   true,
  chainY:     0
};

let enemies   = [];
let particles = [];

// ── Input
let keys = {};

// ─────────────────────────────────────────────
// ── Visual Polish Systems
// ─────────────────────────────────────────────

// ── Animated Clouds (moving left)
let clouds = [];

function initClouds() {
  clouds = [];
  for (let i = 0; i < 6; i++) {
    clouds.push(makeCloud(Math.random() * W)); // spread across screen on init
  }
}

function makeCloud(startX) {
  return {
    x:     startX,
    y:     H * (0.04 + Math.random() * 0.22),
    size:  60 + Math.random() * 80,
    speed: 0.1 + Math.random() * 0.3,
    alpha: 0.45 + Math.random() * 0.25
  };
}

function updateClouds() {
  for (const c of clouds) {
    c.x -= c.speed;
    if (c.x + c.size * 1.3 < 0) {
      // Reset to right side with new random values
      c.x     = W + 20 + Math.random() * 200;
      c.y     = H * (0.04 + Math.random() * 0.22);
      c.size  = 60 + Math.random() * 80;
      c.speed = 0.1 + Math.random() * 0.3;
      c.alpha = 0.45 + Math.random() * 0.25;
    }
  }
}

function drawClouds() {
  for (const c of clouds) {
    ctx.globalAlpha = c.alpha;
    ctx.fillStyle   = '#ffffff';
    drawCloudShape(c.x, c.y, c.size);
  }
  ctx.globalAlpha = 1;
}

function drawCloudShape(x, y, s) {
  ctx.fillRect(x,              y,            s,          s * 0.42);
  ctx.fillRect(x + s * 0.15,   y - s * 0.28, s * 0.7,    s * 0.42);
  ctx.fillRect(x - s * 0.08,   y,            s * 0.28,   s * 0.42);
  ctx.fillRect(x + s * 0.72,   y,            s * 0.28,   s * 0.42);
}

// ── Wind Streak Particles
let windStreaks = [];

function initWind() {
  windStreaks = [];
  for (let i = 0; i < 20; i++) {
    windStreaks.push(makeWindStreak(Math.random() * W));
  }
}

function makeWindStreak(startX) {
  return {
    x:      startX,
    y:      Math.random() * H * 0.80,
    len:    18 + Math.random() * 32,
    speed:  2.5 + Math.random() * 4,
    alpha:  0.08 + Math.random() * 0.16,
    h:      1 + (Math.random() < 0.3 ? 1 : 0) // most are 1px, some 2px
  };
}

function updateWindStreaks() {
  // Keep count between 15–25
  while (windStreaks.length < 15) windStreaks.push(makeWindStreak(W + Math.random() * 100));
  while (windStreaks.length > 25) windStreaks.pop();

  for (const w of windStreaks) {
    w.x -= w.speed;
    if (w.x + w.len < 0) {
      w.x     = W + Math.random() * 60;
      w.y     = Math.random() * H * 0.80;
      w.len   = 18 + Math.random() * 32;
      w.speed = 2.5 + Math.random() * 4;
      w.alpha = 0.08 + Math.random() * 0.16;
    }
  }
}

function drawWindStreaks() {
  ctx.strokeStyle = '#ffffff';
  ctx.lineCap     = 'round';
  for (const w of windStreaks) {
    ctx.globalAlpha = w.alpha;
    ctx.lineWidth   = w.h;
    ctx.beginPath();
    ctx.moveTo(w.x + w.len, w.y);
    ctx.lineTo(w.x, w.y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.lineCap     = 'butt';
}

// ── Ground Detail (layered grass)
// Grass blade positions are seeded once per resize for stable layout
let grassBlades = [];

function initGrass() {
  grassBlades = [];
  const count = Math.floor(W / 8);
  for (let i = 0; i < count; i++) {
    grassBlades.push({
      x:    i * 8 + Math.random() * 6,
      h:    4 + Math.random() * 9,     // blade height 4–13px
      w:    1 + (Math.random() < 0.4 ? 1 : 0), // 1–2px wide
      dark: Math.random() < 0.35        // some darker blades
    });
  }
}

function drawGround() {
  const gy = player.groundY + 42; // ground top edge

  // Base layer — dark ground
  ctx.fillStyle = '#1e3a28';
  ctx.fillRect(0, gy + 8, W, H - gy - 8);

  // Bright grass top strip (~8px)
  ctx.fillStyle = '#4a9b50';
  ctx.fillRect(0, gy, W, 8);

  // Mid strip slightly darker
  ctx.fillStyle = '#3a7a40';
  ctx.fillRect(0, gy + 8, W, 6);

  // Grass blades scattered across the top edge
  for (const b of grassBlades) {
    ctx.fillStyle = b.dark ? '#2d6632' : '#5db864';
    ctx.fillRect(Math.round(b.x), gy - b.h, b.w, b.h);
  }

  // Ground line separator
  ctx.fillStyle = '#1a2a3a';
  ctx.fillRect(0, gy - 1, W, 2);
}

// ── Ambient Birds (tiny, subtle, 1 every 10–15s)
let birds = [];
let nextBirdFrame = 0;

function updateBirds() {
  // Spawn
  if (frameCount >= nextBirdFrame && birds.length < 4) {
    const flock = 1 + Math.floor(Math.random() * 3); // 1–3 birds in a cluster
    for (let i = 0; i < flock; i++) {
      birds.push({
        x:     W + 30 + i * 18,
        y:     H * (0.06 + Math.random() * 0.20),
        speed: 0.6 + Math.random() * 0.5,
        size:  2 + (Math.random() < 0.4 ? 1 : 0), // 2–3px
        bob:   Math.random() * Math.PI * 2
      });
    }
    // 10–15 seconds = 600–900 frames at 60fps
    nextBirdFrame = frameCount + 600 + Math.floor(Math.random() * 300);
  }

  for (let i = birds.length - 1; i >= 0; i--) {
    const b = birds[i];
    b.x   -= b.speed;
    b.bob += 0.04;
    if (b.x < -20) birds.splice(i, 1);
  }
}

function drawBirds() {
  ctx.fillStyle   = 'rgba(26,42,58,0.35)';
  for (const b of birds) {
    const renderY = b.y + Math.sin(b.bob) * 2;
    // Tiny V-shape bird: 2 angled pixel strokes = just 2 fillRects
    ctx.fillRect(Math.round(b.x),          Math.round(renderY),     b.size,     1);
    ctx.fillRect(Math.round(b.x + b.size), Math.round(renderY - 1), b.size,     1);
  }
}

// ── Extended Screen Shake (frame-based)
let shakeX = 0, shakeY = 0, shakeFrames = 0;

function shakeScreen() {
  shakeFrames = 7; // shake for 7 frames
}

function updateShake() {
  if (shakeFrames > 0) {
    shakeFrames--;
    const mag = shakeFrames * 1.4; // decreasing magnitude
    shakeX = (Math.random() - 0.5) * mag;
    shakeY = (Math.random() - 0.5) * mag;
  } else {
    shakeX = 0;
    shakeY = 0;
  }
}

// ─────────────────────────────────────────────
// ── Cleanup
// ─────────────────────────────────────────────
window.onbeforeunload = function () { stopCleanup(); };

function stopCleanup() {
  isPlaying = false;
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup',   handleKeyUp);
  window.removeEventListener('resize',  resizeGame);
}

// ─────────────────────────────────────────────
// ── Init
// ─────────────────────────────────────────────
window.initGame = function (portfolioWorks, settings) {
  worksData    = (portfolioWorks || []).filter(w => w.image);
  gameSettings = settings || {};

  canvas = document.getElementById('gameCoreCanvas');
  if (!canvas) { console.error('gameCoreCanvas not found'); return; }
  ctx = canvas.getContext('2d');

  window.addEventListener('resize', resizeGame);
  resizeGame();

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup',   handleKeyUp);
  canvas.addEventListener('touchstart', handleTouch, { passive: false });

  window.resetGame();
};

window.stopGame = function () { stopCleanup(); };

// ─────────────────────────────────────────────
// ── Resize
// ─────────────────────────────────────────────
function resizeGame() {
  if (!canvas) return;
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;

  player.baseX   = W * 0.22;
  player.startY  = H * 0.25;
  player.groundY = H * 0.68;

  if (attack.phase === 'idle') {
    player.x = player.baseX;
    player.y = player.startY;
  }

  // Re-init visual systems on resize
  initClouds();
  initWind();
  initGrass();
}

// ─────────────────────────────────────────────
// ── Reset
// ─────────────────────────────────────────────
window.resetGame = function () {
  score        = 0;
  fireworks    = 0;
  multiplier   = 1;
  boostTimer   = 0;
  baseSpeed    = 5;
  currentSpeed = baseSpeed;
  enemies      = [];
  particles    = [];
  frameCount   = 0;
  nextBirdFrame = 600 + Math.floor(Math.random() * 300);
  birds        = [];

  player.x      = player.baseX;
  player.y      = player.startY;
  player.vy     = 0;
  player.vxDive = 0;

  attack.phase      = 'idle';
  attack.frameCount = 0;
  attack.canChain   = true;

  shakeX = 0; shakeY = 0; shakeFrames = 0;

  // Re-init visuals if not done yet
  if (clouds.length === 0)      initClouds();
  if (windStreaks.length === 0)  initWind();
  if (grassBlades.length === 0) initGrass();

  isPlaying = true;

  const goScreen = document.getElementById('gameOverScreen');
  if (goScreen) goScreen.style.display = 'none';
  updateHUD();

  if (!animId) loop();
};

// ─────────────────────────────────────────────
// ── Input (unchanged)
// ─────────────────────────────────────────────
function handleKeyDown(e) {
  if (e.code === 'Space' || e.code === 'ArrowUp') e.preventDefault();
  if (!isPlaying) return;
  keys[e.code] = true;

  if ((e.code === 'Space' || e.code === 'ArrowUp') && attack.canChain) {
    triggerDive();
  }

  if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && fireworks > 0) {
    fireworks--;
    boostTimer += 180;
    multiplier = Math.min(multiplier + 1, 8);
    updateHUD();
  }
}

function handleKeyUp(e) { keys[e.code] = false; }

function handleTouch(e) {
  e.preventDefault();
  if (!isPlaying) return;
  if (e.touches.length >= 2) {
    if (fireworks > 0) { fireworks--; boostTimer += 180; multiplier = Math.min(multiplier + 1, 8); updateHUD(); }
  } else {
    if (attack.canChain) triggerDive();
  }
}

// ─────────────────────────────────────────────
// ── HUD (unchanged)
// ─────────────────────────────────────────────
function updateHUD() {
  const scoreEl = document.getElementById('gameScore');
  const fwEl    = document.getElementById('gameFireworks');
  const mulEl   = document.getElementById('gameMultiplier');
  if (scoreEl) scoreEl.textContent = score;
  if (fwEl)    fwEl.textContent    = fireworks;
  if (mulEl) {
    if (multiplier > 1) { mulEl.textContent = `x${multiplier} BOOST!`; mulEl.style.display = 'block'; }
    else                { mulEl.style.display = 'none'; }
  }
}

// ─────────────────────────────────────────────
// ── Elytra Dive Attack — State Machine (UNCHANGED)
// ─────────────────────────────────────────────
function getStrikeY() {
  return player.groundY - player.h - 80;
}

function triggerDive() {
  player.vy     = DIVE_SPEED;
  player.vxDive = VX_DIVE;

  attack.phase      = 'dive';
  attack.frameCount = 0;
  attack.canChain   = false;
}

function updateAttack() {
  const strikeY = getStrikeY();

  if (attack.phase === 'idle') {
    player.y = player.startY + Math.sin(Date.now() * 0.003) * 7;
    player.x += (player.baseX - player.x) * 0.08;
    return;
  }

  attack.frameCount++;

  if (attack.phase === 'dive') {
    player.y      += player.vy;
    player.x      += player.vxDive;

    if (player.y >= strikeY) {
      player.y      = strikeY;
      player.vxDive = 0;
      attack.phase      = 'strike';
      attack.frameCount = 0;
    }

  } else if (attack.phase === 'strike') {
    player.y = strikeY;
    if (attack.frameCount >= STRIKE_FRAMES) {
      attack.chainY = player.startY + (strikeY - player.startY) * (1 - CHAIN_THRESHOLD);
      player.vy     = -ASCENT_SPEED;
      attack.phase      = 'ascend';
      attack.frameCount = 0;
    }

  } else if (attack.phase === 'ascend') {
    player.y  += player.vy;
    player.x  += (player.baseX - player.x) * 0.12;

    if (!attack.canChain && player.y <= attack.chainY) {
      attack.canChain = true;
    }

    if (player.y <= player.startY) {
      player.y     = player.startY;
      player.x     = player.baseX;
      player.vy    = 0;
      attack.phase      = 'idle';
      attack.frameCount = 0;
      attack.canChain   = true;
    }
  }
}

// ─────────────────────────────────────────────
// ── Collision — only active during 'strike' (UNCHANGED)
// ─────────────────────────────────────────────
function checkDiveCollision() {
  if (attack.phase !== 'strike') return;

  const hx = player.x - HITBOX_PAD;
  const hy = player.y - HITBOX_PAD;
  const hw = player.w + HITBOX_PAD * 2;
  const hh = player.h + HITBOX_PAD * 2;

  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (hx < e.x + e.w && hx + hw > e.x &&
        hy < e.y + e.h && hy + hh > e.y) {
      score += 10 * multiplier;
      if (Math.random() < 0.3) { fireworks++; updateHUD(); }

      // Improved hit feedback: yellow + white + gold burst
      const ex = e.x + e.w / 2;
      const ey = e.y + e.h / 2;
      spawnParticles(ex, ey, '#f1c40f', 18); // gold
      spawnParticles(ex, ey, '#ffffff', 10); // white
      spawnParticles(ex, ey, '#ffd700', 8);  // bright gold

      // 1-frame enemy flash: mark it before splice
      shakeScreen(); // now frame-based (7 frames)
      updateHUD();
      enemies.splice(i, 1);
    }
  }
}

// ─────────────────────────────────────────────
// ── Draw Player (improved trail + tilt)
// ─────────────────────────────────────────────
function drawPlayer() {
  const cx = player.x + player.w / 2;
  const cy = player.y + player.h / 2;

  let tiltDeg = 0;
  if (attack.phase === 'dive')   tiltDeg = TILT_DIVE;
  if (attack.phase === 'strike') tiltDeg = TILT_STRIKE;
  if (attack.phase === 'ascend') tiltDeg = -5;
  const tiltRad = tiltDeg * DEG;

  let playerColor = '#3498db';
  if (boostTimer > 0) playerColor = '#f1c40f';
  if (attack.phase === 'ascend' && attack.canChain) playerColor = '#55eebb';

  // ── Improved dive trail: 5 ghosts on dive, 2 on ascend
  if (attack.phase === 'dive') {
    const ghostCount = 5;
    for (let i = 1; i <= ghostCount; i++) {
      ctx.globalAlpha = 0.30 - i * 0.05;
      ctx.fillStyle   = playerColor;
      const gx = player.x - player.vxDive * i * 0.5;
      const gy = player.y + player.vy     * i * 0.4;
      ctx.save();
      ctx.translate(gx + player.w / 2, gy + player.h / 2);
      ctx.rotate(tiltRad * (1 - i * 0.1));
      ctx.fillRect(-player.w / 2, -player.h / 2, player.w, player.h);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  } else if (attack.phase === 'ascend') {
    for (let i = 1; i <= 2; i++) {
      ctx.globalAlpha = 0.18 - i * 0.05;
      ctx.fillStyle   = playerColor;
      const gy = player.y - player.vy * i * 0.4;
      ctx.fillRect(Math.round(player.x), Math.round(gy), player.w, player.h);
    }
    ctx.globalAlpha = 1;
  }

  // ── Main player block
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tiltRad);
  ctx.fillStyle   = playerColor;
  ctx.fillRect(-player.w / 2, -player.h / 2, player.w, player.h);
  ctx.strokeStyle = '#1a2a3a';
  ctx.lineWidth   = 3;
  ctx.strokeRect(-player.w / 2, -player.h / 2, player.w, player.h);
  ctx.restore();

  // Boost trail
  if (boostTimer > 0 && Math.random() < 0.5) {
    spawnParticles(player.x - 5, player.y + player.h / 2, '#f1c40f', 2);
  }

  // Strike flash
  if (attack.phase === 'strike' && attack.frameCount <= 2) {
    ctx.globalAlpha = 0.55;
    ctx.fillStyle   = '#ffffff';
    ctx.fillRect(player.x - HITBOX_PAD, player.y - HITBOX_PAD,
                 player.w + HITBOX_PAD * 2, player.h + HITBOX_PAD * 2);
    ctx.globalAlpha = 1;
  }
}

// ─────────────────────────────────────────────
// ── Enemy Spawn (size 140–190, improved readability)
// ─────────────────────────────────────────────
function canSpawnEnemy() {
  if (enemies.length === 0) return true;
  const rightmost = enemies.reduce((max, e) => Math.max(max, e.x + e.w), -Infinity);
  return rightmost < W - MIN_ENEMY_GAP;
}

function spawnEnemy() {
  if (worksData.length === 0) return;
  if (!canSpawnEnemy()) return;

  const w    = worksData[Math.floor(Math.random() * worksData.length)];
  const size = 140 + Math.random() * 50; // ✦ 140–190px for better readability

  const img       = new Image();
  img.crossOrigin = 'anonymous';
  img.src         = w.image;

  enemies.push({
    x:      W + 80,
    y:      player.groundY - size + 30,
    w:      size,
    h:      size,
    img,
    workName: w.name || '',
    passed:   false,
    offset:   Math.random() * Math.PI * 2 // unique phase for hover bob
  });
}

// ─────────────────────────────────────────────
// ── Particles
// ─────────────────────────────────────────────
function spawnParticles(x, y, color, count) {
  count = count || 16;
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx:   (Math.random() - 0.5) * 14,
      vy:   (Math.random() - 0.5) * 14 - 3,
      life: 1.0,
      size: 2 + Math.random() * 5,
      color
    });
  }
}

// ─────────────────────────────────────────────
// ── Main Loop
// ─────────────────────────────────────────────
function loop() {
  if (!isPlaying) { animId = null; return; }
  animId = requestAnimationFrame(loop);
  frameCount++;

  // Update shake first (frame-based)
  updateShake();

  ctx.save();
  ctx.translate(shakeX, shakeY);
  ctx.clearRect(-20, -20, W + 40, H + 40);

  // ── Sky gradient (Layer 0 — static)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
  skyGrad.addColorStop(0,    '#4da8d0');
  skyGrad.addColorStop(0.65, '#c8eeff');
  skyGrad.addColorStop(1,    '#ddeef5');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  // ── Layer 1: Animated Clouds (slowest parallax)
  updateClouds();
  drawClouds();

  // ── Layer 2: Wind streaks (medium speed)
  updateWindStreaks();
  drawWindStreaks();

  // ── Layer 3: Ambient birds (tiny, subtle)
  updateBirds();
  drawBirds();

  // ── Layer 4: Ground (fast — scrolls with enemy speed feel)
  drawGround();

  // ── Boost logic
  if (boostTimer > 0) {
    boostTimer--;
    currentSpeed = baseSpeed + (multiplier * 3);
    if (boostTimer <= 0) { multiplier = 1; currentSpeed = baseSpeed; updateHUD(); }
  }

  // ── Update attack
  updateAttack();

  // ── Draw player
  drawPlayer();

  // ── Collision check
  checkDiveCollision();

  // ── Spawn enemies
  if (Math.random() < 0.022 + currentSpeed * 0.001) {
    spawnEnemy();
  }

  // ── Draw & update enemies (Layer 5: fastest)
  const now = Date.now();
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.x -= currentSpeed;

    // Enemy hover bob (±3px)
    const renderY = e.y + Math.sin(now * 0.002 + e.offset) * 3;

    ctx.save();

    // Card shadow
    ctx.fillStyle = 'rgba(26,42,58,0.22)';
    ctx.fillRect(e.x + 5, renderY + 5, e.w, e.h);

    // Thumbnail or checkerboard placeholder
    ctx.strokeStyle = '#1a2a3a';
    ctx.lineWidth   = 2; // reduced from 3 — more artwork visible
    if (e.img.complete && e.img.naturalHeight !== 0) {
      ctx.drawImage(e.img, e.x, renderY, e.w, e.h);
    } else {
      ctx.fillStyle = '#c0d8e8';
      ctx.fillRect(e.x, renderY, e.w, e.h);
      ctx.fillStyle = '#a0c0d8';
      const cs = 16;
      for (let bx = 0; bx < e.w; bx += cs) {
        for (let by = 0; by < e.h; by += cs) {
          if ((Math.floor(bx / cs) + Math.floor(by / cs)) % 2 === 0)
            ctx.fillRect(e.x + bx, renderY + by, Math.min(cs, e.w - bx), Math.min(cs, e.h - by));
        }
      }
    }
    ctx.strokeRect(e.x, renderY, e.w, e.h);

    // Label — 22px VT323, 20-char limit, improved readability
    if (e.workName) {
      const label  = e.workName.substring(0, 20);
      const labelH = 30;
      ctx.fillStyle = 'rgba(20,35,50,0.88)';
      ctx.fillRect(e.x, renderY + e.h, e.w, labelH);
      ctx.fillStyle = '#ffffff';
      ctx.font      = '22px VT323, monospace'; // ✦ 22px
      ctx.textAlign = 'center';
      ctx.fillText(label, e.x + e.w / 2, renderY + e.h + 22);
      ctx.textAlign = 'left';
    }

    ctx.restore();

    // Miss penalty (use base e.y for logic, not renderY)
    if (e.x + e.w < player.x && !e.passed) {
      e.passed = true;
      if (boostTimer <= 0) {
        score = Math.max(0, score - 5);
        updateHUD();
        if (score === 0) { gameOver(); return; }
      }
    }

    if (e.x + e.w < -200) enemies.splice(i, 1);
  }

  // ── Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x    += p.vx;
    p.y    += p.vy;
    p.vy   += 0.35;
    p.life -= 0.04;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    ctx.globalAlpha = p.life;
    ctx.fillStyle   = p.color;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), Math.ceil(p.size), Math.ceil(p.size));
    ctx.globalAlpha = 1;
  }

  // ── Speed ramp-up
  if (boostTimer <= 0 && score > 0) {
    baseSpeed    = 5 + Math.floor(score / 100) * 0.4;
    currentSpeed = Math.min(baseSpeed, 18);
  }

  ctx.restore();
}

// ── Game Over (unchanged)
function gameOver() {
  isPlaying = false;
  animId    = null;
  const finEl = document.getElementById('finalScore');
  const goEl  = document.getElementById('gameOverScreen');
  if (finEl) finEl.textContent = score;
  if (goEl)  goEl.style.display = 'flex';
}
