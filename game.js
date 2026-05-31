// ── Portfolio Minigame Engine ──
// Standalone game.js — designed for game.html

// ─────────────────────────────────────────────
// ── Tunable Constants (easy to adjust)
// ─────────────────────────────────────────────
const MIN_ENEMY_GAP  = 380;   // px gap between enemies (Goal 2)

const DIVE_SPEED     = 14;    // initial downward velocity px/frame
const DIVE_DECEL     = 0.88;  // velocity multiplier per dive frame
const VX_DIVE        = 3;     // forward lean px/frame (reduced for mostly vertical Elytra mace style)
const STRIKE_FRAMES  = 5;     // frames held at impact
const ASCENT_SPEED   = 9;     // initial upward velocity px/frame
const ASCENT_DECEL   = 0.92;  // velocity multiplier per ascent frame
const CHAIN_THRESHOLD = 0.38; // [TUNED] fraction of ascent before SPACE re-enables (was 0.55 → 0.38 for fast chaining)
const HITBOX_PAD     = 8;     // extra px on each side of AABB during strike
const TILT_DIVE      = 15;    // degrees of block rotation during dive
const TILT_STRIKE    = 25;    // degrees of block rotation at impact
const DEG            = Math.PI / 180;

// ─────────────────────────────────────────────
// ── Engine State
// ─────────────────────────────────────────────
let canvas, ctx;
let W, H;
let animId = null;

let worksData    = [];
let gameSettings = {};

let isPlaying    = false;
let score        = 0;
let fireworks    = 0;
let multiplier   = 1;
let boostTimer   = 0;
let baseSpeed    = 5;
let currentSpeed = baseSpeed;

// ── Player
// player.x and startY/groundY are all set by resizeGame() — responsive
let player = {
  x:       0,
  y:       0,
  vy:      0,    // vertical velocity
  vxDive:  0,    // horizontal lean during dive (resets on ascend)
  baseX:   0,    // W * 0.22 — restored during ascend
  w:       44,
  h:       44,
  startY:  0,
  groundY: 0
};

// ── Attack State Machine
// phases: 'idle' | 'dive' | 'strike' | 'ascend'
let attack = {
  phase:      'idle',
  frameCount: 0,
  canChain:   true,
  chainY:     0     // computed on each ascent start
};

let enemies   = [];
let particles = [];

// ── Input
let keys = {};

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
// ── Resize — all positions derived here
// ─────────────────────────────────────────────
function resizeGame() {
  if (!canvas) return;
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;

  player.baseX   = W * 0.22;   // Goal 1: responsive horizontal position
  player.startY  = H * 0.25;   // fly altitude
  player.groundY = H * 0.68;   // ground / enemy baseline

  // Only snap X if idle — don't interrupt active dive
  if (attack.phase === 'idle') {
    player.x = player.baseX;
    player.y = player.startY;
  }
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

  player.x     = player.baseX;
  player.y     = player.startY;
  player.vy    = 0;
  player.vxDive = 0;

  attack.phase      = 'idle';
  attack.frameCount = 0;
  attack.canChain   = true;

  isPlaying = true;

  const goScreen = document.getElementById('gameOverScreen');
  if (goScreen) goScreen.style.display = 'none';
  updateHUD();

  if (!animId) loop();
};

// ─────────────────────────────────────────────
// ── Input
// ─────────────────────────────────────────────
function handleKeyDown(e) {
  if (e.code === 'Space' || e.code === 'ArrowUp') e.preventDefault();
  if (!isPlaying) return;
  keys[e.code] = true;

  // SPACE / ArrowUp = dive attack
  if ((e.code === 'Space' || e.code === 'ArrowUp') && attack.canChain) {
    triggerDive();
  }

  // SHIFT = Firework Boost
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
// ── HUD
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
// ── Goal 4: Elytra Dive Attack — State Machine
// ─────────────────────────────────────────────

// [TUNED] strikeY: player stops here — 80px above enemy tops (was groundY-h-10)
function getStrikeY() {
  return player.groundY - player.h - 80;
}

function triggerDive() {
  // Clean velocity reset on chain-dive (prevents double-velocity bug)
  player.vy     = DIVE_SPEED;
  player.vxDive = VX_DIVE;

  attack.phase      = 'dive';
  attack.frameCount = 0;
  attack.canChain   = false;
}

function updateAttack() {
  const strikeY = getStrikeY();

  if (attack.phase === 'idle') {
    // Hover bob
    player.y = player.startY + Math.sin(Date.now() * 0.003) * 7;
    // Drift back to baseX slowly if slightly off
    player.x += (player.baseX - player.x) * 0.08;
    return;
  }

  attack.frameCount++;

  if (attack.phase === 'dive') {
    // Apply velocity
    player.y      += player.vy;
    player.x      += player.vxDive;
    player.vy     *= DIVE_DECEL;       // decelerate naturally toward bottom

    // Hard clamp — never go below strikeY
    if (player.y >= strikeY) {
      player.y      = strikeY;
      player.vxDive = 0;
      attack.phase      = 'strike';
      attack.frameCount = 0;
    }

  } else if (attack.phase === 'strike') {
    // Hold at strikeY for STRIKE_FRAMES
    player.y = strikeY;
    if (attack.frameCount >= STRIKE_FRAMES) {
      // Compute chain-window Y for this ascent
      // [TUNED] CHAIN_THRESHOLD = 0.38 → canChain true when 38% up from strikeY
      attack.chainY = player.startY + (strikeY - player.startY) * (1 - CHAIN_THRESHOLD);
      player.vy     = -ASCENT_SPEED;
      attack.phase      = 'ascend';
      attack.frameCount = 0;
    }

  } else if (attack.phase === 'ascend') {
    player.y  += player.vy;
    player.vy *= ASCENT_DECEL;  // decelerate as approaching top

    // Drift X back toward baseX during ascent
    player.x += (player.baseX - player.x) * 0.12;

    // [TUNED] Chain window: SPACE valid again at 38% of ascent complete
    if (!attack.canChain && player.y <= attack.chainY) {
      attack.canChain = true;
    }

    // Fully returned
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
// ── Hitbox collision — only active during 'strike'
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
      // HIT!
      score += 10 * multiplier;
      if (Math.random() < 0.3) { fireworks++; updateHUD(); }
      spawnParticles(e.x + e.w / 2, e.y + e.h / 2, '#f1c40f', 22);
      spawnParticles(e.x + e.w / 2, e.y + e.h / 2, '#e74c3c', 10);
      shakeScreen();
      updateHUD();
      enemies.splice(i, 1);
    }
  }
}

// ─────────────────────────────────────────────
// ── Draw Player (with tilt + trail)
// ─────────────────────────────────────────────
function drawPlayer() {
  const cx = player.x + player.w / 2;
  const cy = player.y + player.h / 2;

  // Tilt angle based on phase
  let tiltDeg = 0;
  if (attack.phase === 'dive')   tiltDeg = TILT_DIVE;
  if (attack.phase === 'strike') tiltDeg = TILT_STRIKE;
  if (attack.phase === 'ascend') tiltDeg = -5;
  const tiltRad = tiltDeg * DEG;

  // Player color: gold if boosted, chain-flash if canChain just became true during ascend, else blue
  let playerColor = '#3498db';
  if (boostTimer > 0) playerColor = '#f1c40f';
  if (attack.phase === 'ascend' && attack.canChain) playerColor = '#55eebb'; // chain-ready flash

  // ── Dive / ascend trail (3 ghost rects, no sprites)
  if (attack.phase === 'dive' || attack.phase === 'ascend') {
    const trailVY = attack.phase === 'dive' ? player.vy : -player.vy;
    const trailVX = attack.phase === 'dive' ? player.vxDive : 0;
    for (let i = 1; i <= 3; i++) {
      ctx.globalAlpha = 0.28 - i * 0.07;
      ctx.fillStyle   = playerColor;
      const gx = player.x - trailVX * i * 0.55;
      const gy = player.y + trailVY  * i * 0.45;
      ctx.fillRect(Math.round(gx), Math.round(gy), player.w, player.h);
    }
    ctx.globalAlpha = 1;
  }

  // ── Main player block with tilt
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tiltRad);
  ctx.fillStyle   = playerColor;
  ctx.fillRect(-player.w / 2, -player.h / 2, player.w, player.h);
  ctx.strokeStyle = '#1a2a3a';
  ctx.lineWidth   = 3;
  ctx.strokeRect(-player.w / 2, -player.h / 2, player.w, player.h);
  ctx.restore();

  // ── Boost particle trail
  if (boostTimer > 0 && Math.random() < 0.5) {
    spawnParticles(player.x - 5, player.y + player.h / 2, '#f1c40f', 2);
  }

  // ── Strike impact flash (brief white overlay on player rect)
  if (attack.phase === 'strike' && attack.frameCount <= 2) {
    ctx.globalAlpha = 0.5;
    ctx.fillStyle   = '#ffffff';
    ctx.fillRect(player.x - HITBOX_PAD, player.y - HITBOX_PAD,
                 player.w + HITBOX_PAD * 2, player.h + HITBOX_PAD * 2);
    ctx.globalAlpha = 1;
  }
}

// ─────────────────────────────────────────────
// ── Enemy Spawn (Goal 2: gap guard + Goal 3: larger cards)
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
  const size = 110 + Math.random() * 50; // Goal 3: 110–160px

  const img       = new Image();
  img.crossOrigin = 'anonymous';
  img.src         = w.image;

  enemies.push({
    x: W + 80,
    y: player.groundY - size + 30,
    w: size,
    h: size,
    img,
    workName: w.name || '',
    passed:   false
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
      vx:    (Math.random() - 0.5) * 14,
      vy:    (Math.random() - 0.5) * 14 - 3,
      life:  1.0,
      size:  2 + Math.random() * 5,
      color
    });
  }
}

// ── Screen Shake
let shakeX = 0, shakeY = 0;
function shakeScreen() {
  shakeX = (Math.random() - 0.5) * 14;
  shakeY = (Math.random() - 0.5) * 14;
  setTimeout(() => { shakeX = 0; shakeY = 0; }, 90);
}

// ─────────────────────────────────────────────
// ── Main Loop
// ─────────────────────────────────────────────
function loop() {
  if (!isPlaying) { animId = null; return; }
  animId = requestAnimationFrame(loop);

  ctx.save();
  ctx.translate(shakeX, shakeY);
  ctx.clearRect(-20, -20, W + 40, H + 40);

  // ── Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
  skyGrad.addColorStop(0,   '#5ab0d8');
  skyGrad.addColorStop(0.7, '#cceeff');
  skyGrad.addColorStop(1,   '#ddeef0');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  // ── Clouds
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  drawCloud(W * 0.12, H * 0.10, 90);
  drawCloud(W * 0.42, H * 0.07, 120);
  drawCloud(W * 0.75, H * 0.13, 75);

  // ── Ground
  ctx.fillStyle = '#2c4a6a';
  ctx.fillRect(0, player.groundY + 42, W, 5);
  ctx.fillStyle = '#3a6b40';
  ctx.fillRect(0, player.groundY + 47, W, H - player.groundY - 47);

  // ── Boost logic
  if (boostTimer > 0) {
    boostTimer--;
    currentSpeed = baseSpeed + (multiplier * 3);
    if (boostTimer <= 0) { multiplier = 1; currentSpeed = baseSpeed; updateHUD(); }
  }

  // ── Update attack state machine
  updateAttack();

  // ── Draw player (trail → body → strike flash)
  drawPlayer();

  // ── Check dive collision (strike phase only)
  checkDiveCollision();

  // ── Spawn enemies
  if (Math.random() < 0.022 + currentSpeed * 0.001) {
    spawnEnemy();
  }

  // ── Draw & update enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.x -= currentSpeed;

    ctx.save();

    // Card shadow
    ctx.fillStyle = 'rgba(26,42,58,0.2)';
    ctx.fillRect(e.x + 4, e.y + 4, e.w, e.h);

    // Thumbnail or checkerboard placeholder
    ctx.strokeStyle = '#1a2a3a';
    ctx.lineWidth   = 3;
    if (e.img.complete && e.img.naturalHeight !== 0) {
      ctx.drawImage(e.img, e.x, e.y, e.w, e.h);
    } else {
      ctx.fillStyle = '#c0d8e8';
      ctx.fillRect(e.x, e.y, e.w, e.h);
      ctx.fillStyle = '#a0c0d8';
      const cs = 16;
      for (let cx = 0; cx < e.w; cx += cs) {
        for (let cy = 0; cy < e.h; cy += cs) {
          if ((Math.floor(cx / cs) + Math.floor(cy / cs)) % 2 === 0)
            ctx.fillRect(e.x + cx, e.y + cy, Math.min(cs, e.w - cx), Math.min(cs, e.h - cy));
        }
      }
    }
    ctx.strokeRect(e.x, e.y, e.w, e.h);

    // Goal 3: larger label — 18px VT323, 20-char limit
    if (e.workName) {
      const label  = e.workName.substring(0, 20);
      const labelH = 26;
      ctx.fillStyle = 'rgba(26,42,58,0.82)';
      ctx.fillRect(e.x, e.y + e.h, e.w, labelH);
      ctx.fillStyle = '#ffffff';
      ctx.font      = '18px VT323, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, e.x + e.w / 2, e.y + e.h + 19);
      ctx.textAlign = 'left';
    }

    ctx.restore();

    // Miss penalty
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
    p.x   += p.vx;
    p.y   += p.vy;
    p.vy  += 0.35;  // gravity
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

// ── Cloud helper
function drawCloud(x, y, size) {
  ctx.fillRect(x,                y,               size,         size * 0.42);
  ctx.fillRect(x + size * 0.15,  y - size * 0.28, size * 0.7,   size * 0.42);
  ctx.fillRect(x - size * 0.08,  y,               size * 0.28,  size * 0.42);
  ctx.fillRect(x + size * 0.72,  y,               size * 0.28,  size * 0.42);
}

// ── Game Over
function gameOver() {
  isPlaying = false;
  animId    = null;
  const finEl = document.getElementById('finalScore');
  const goEl  = document.getElementById('gameOverScreen');
  if (finEl) finEl.textContent = score;
  if (goEl)  goEl.style.display = 'flex';
}
