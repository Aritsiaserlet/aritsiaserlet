// ── Portfolio Minigame Engine ──
// Standalone game.js — designed for game.html

let canvas, ctx;
let W, H;
let animId = null;

let worksData = [];
let gameSettings = {};

// ── Game State ──
let isPlaying = false;
let score = 0;
let fireworks = 0;
let multiplier = 1;
let boostTimer = 0;
let baseSpeed = 5;
let currentSpeed = baseSpeed;

// ── Entities ──
// Goal 1: player.x is now set responsively in resizeGame()
let player = {
  x: 0,        // set by resizeGame() → W * 0.22
  y: 0,
  w: 44,
  h: 44,
  startY: 0,   // set by resizeGame() → H * 0.25
  groundY: 0,  // set by resizeGame() → H * 0.68
  state: 'fly' // 'fly' only — dive removed, mace handles attack
};
let enemies = [];
let particles = [];

// ── Goal 2: Enemy spacing tracker ──
const MIN_ENEMY_GAP = 380; // minimum px gap between right edge of last enemy and right edge of screen

// ── Goal 4: Mace object ──
const DEG = Math.PI / 180;
let mace = {
  angle: -60 * DEG,       // current angle in radians (idle = -60°, left-upward)
  idleAngle: -60 * DEG,   // resting position
  swingAngle: 60 * DEG,   // fully swung position
  progress: 0,             // 0.0 → 1.0
  phase: 'idle',           // 'idle' | 'swing' | 'return'
  length: 52,              // chain length in px
  ballRadius: 9,           // mace ball radius
  chainSegs: 5,            // number of chain link squares
  canSwing: true           // cooldown guard
};

// ── Input ──
let keys = {};

// ── Cleanup on page leave ──
window.onbeforeunload = function () { stopCleanup(); };

function stopCleanup() {
  isPlaying = false;
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  window.removeEventListener('resize', resizeGame);
}

// ────────────────────────────────────────
// ── Init ──
// ────────────────────────────────────────
window.initGame = function (portfolioWorks, settings) {
  worksData = (portfolioWorks || []).filter(w => w.image);
  gameSettings = settings || {};

  canvas = document.getElementById('gameCoreCanvas');
  if (!canvas) { console.error('gameCoreCanvas not found'); return; }
  ctx = canvas.getContext('2d');

  window.addEventListener('resize', resizeGame);
  resizeGame();

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  canvas.addEventListener('touchstart', handleTouch, { passive: false });

  window.resetGame();
};

window.stopGame = function () { stopCleanup(); };

// ────────────────────────────────────────
// ── Resize — sets ALL position constants ──
// ────────────────────────────────────────
function resizeGame() {
  if (!canvas) return;
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;

  // Goal 1: responsive player X (22% from left)
  player.x      = W * 0.22;
  player.startY = H * 0.25;   // fly altitude
  player.groundY = H * 0.68;  // ground / enemy baseline

  if (player.state === 'fly') player.y = player.startY;
}

// ────────────────────────────────────────
// ── Reset ──
// ────────────────────────────────────────
window.resetGame = function () {
  score = 0;
  fireworks = 0;
  multiplier = 1;
  boostTimer = 0;
  baseSpeed = 5;
  currentSpeed = baseSpeed;
  enemies = [];
  particles = [];

  player.state = 'fly';
  player.y = player.startY;
  // Goal 1: reset to responsive position
  player.x = W * 0.22;

  // Reset mace
  mace.angle    = mace.idleAngle;
  mace.progress = 0;
  mace.phase    = 'idle';
  mace.canSwing = true;

  isPlaying = true;

  const goScreen = document.getElementById('gameOverScreen');
  if (goScreen) goScreen.style.display = 'none';
  updateHUD();

  if (!animId) loop();
};

// ────────────────────────────────────────
// ── Input ──
// ────────────────────────────────────────
function handleKeyDown(e) {
  if (e.code === 'Space' || e.code === 'ArrowUp') e.preventDefault();
  if (!isPlaying) return;
  keys[e.code] = true;

  // Goal 4: SPACE / ArrowUp = swing mace (not dive)
  if ((e.code === 'Space' || e.code === 'ArrowUp') && mace.canSwing && mace.phase === 'idle') {
    triggerMaceSwing();
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
    if (mace.canSwing && mace.phase === 'idle') triggerMaceSwing();
  }
}

// ────────────────────────────────────────
// ── HUD ──
// ────────────────────────────────────────
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

// ────────────────────────────────────────
// ── Goal 2: Enemy Spawn with gap guard ──
// ────────────────────────────────────────
function canSpawnEnemy() {
  if (enemies.length === 0) return true;
  // Find rightmost enemy x
  const rightmost = enemies.reduce((max, e) => Math.max(max, e.x + e.w), -Infinity);
  return rightmost < W - MIN_ENEMY_GAP;
}

function spawnEnemy() {
  if (worksData.length === 0) return;
  if (!canSpawnEnemy()) return; // Goal 2: gap guard

  const w = worksData[Math.floor(Math.random() * worksData.length)];

  // Goal 3: larger card size (110–160px)
  const size = 110 + Math.random() * 50;

  let img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = w.image;

  enemies.push({
    x: W + 80,
    y: player.groundY - size + 30,
    w: size,
    h: size,
    img: img,
    workName: w.name || '',
    passed: false
  });
}

// ────────────────────────────────────────
// ── Particles ──
// ────────────────────────────────────────
function spawnParticles(x, y, color, count) {
  count = count || 16;
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.5) * 14 - 3,
      life: 1.0,
      size: 2 + Math.random() * 5,
      color
    });
  }
}

// ── Screen Shake ──
let shakeX = 0, shakeY = 0;
function shakeScreen() {
  shakeX = (Math.random() - 0.5) * 14;
  shakeY = (Math.random() - 0.5) * 14;
  setTimeout(() => { shakeX = 0; shakeY = 0; }, 90);
}

// ────────────────────────────────────────
// ── Goal 4: Mace System ──
// ────────────────────────────────────────
function triggerMaceSwing() {
  mace.phase    = 'swing';
  mace.progress = 0;
  mace.canSwing = false;
}

// Cubic ease-in-out
function easeInOut(t) { return t * t * (3 - 2 * t); }

function updateMace() {
  if (mace.phase === 'idle') return;

  const speed = 0.065; // progress increment per frame (~15 frames for full swing)

  if (mace.phase === 'swing') {
    mace.progress += speed;
    if (mace.progress >= 1) {
      mace.progress = 1;
      mace.phase = 'return';
    }
    const t = easeInOut(mace.progress);
    mace.angle = mace.idleAngle + (mace.swingAngle - mace.idleAngle) * t;
  } else if (mace.phase === 'return') {
    mace.progress -= speed * 0.75; // return slightly slower
    if (mace.progress <= 0) {
      mace.progress = 0;
      mace.phase    = 'idle';
      mace.angle    = mace.idleAngle;
      mace.canSwing = true;
    }
    const t = easeInOut(mace.progress);
    mace.angle = mace.idleAngle + (mace.swingAngle - mace.idleAngle) * t;
  }
}

// Mace ball world position (for collision)
function getMaceBallPos() {
  const pivotX = player.x + player.w;             // right edge of player block
  const pivotY = player.y + player.h * 0.5;        // vertical center of player block
  return {
    x: pivotX + Math.sin(mace.angle) * mace.length,
    y: pivotY + Math.cos(mace.angle) * mace.length,
    pivotX,
    pivotY
  };
}

function drawMace() {
  const { pivotX, pivotY } = getMaceBallPos();

  ctx.save();
  ctx.translate(pivotX, pivotY);
  ctx.rotate(mace.angle);

  // Chain links (pixel squares along Y axis downward)
  const segLen = mace.length / mace.chainSegs;
  ctx.strokeStyle = '#1a2a3a';
  ctx.lineWidth = 2;
  for (let i = 0; i < mace.chainSegs; i++) {
    const cy = i * segLen + segLen * 0.2;
    const cSize = (i % 2 === 0) ? 6 : 5;
    ctx.fillStyle = i % 2 === 0 ? '#8899aa' : '#aabbcc';
    ctx.fillRect(-cSize / 2, cy, cSize, segLen * 0.65);
    ctx.strokeRect(-cSize / 2, cy, cSize, segLen * 0.65);
  }

  // Mace ball (spiky pixel circle)
  const bY = mace.length;
  const br = mace.ballRadius;

  // Shadow
  ctx.fillStyle = 'rgba(26,42,58,0.35)';
  ctx.beginPath();
  ctx.arc(2, bY + 2, br, 0, Math.PI * 2);
  ctx.fill();

  // Ball body
  ctx.fillStyle = boostTimer > 0 ? '#f1c40f' : '#7a7a8a';
  ctx.beginPath();
  ctx.arc(0, bY, br, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1a2a3a';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Spikes (4 pixel protrusions)
  ctx.fillStyle = '#55556a';
  const spikes = [[0,-br-4], [br+4,0], [0,br+4], [-br-4,0]];
  spikes.forEach(([sx, sy]) => {
    ctx.fillRect(sx - 2, bY + sy - 2, 5, 5);
  });

  // Shine
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillRect(-br * 0.4, bY - br * 0.6, br * 0.4, br * 0.3);

  ctx.restore();
}

// Mace-ball vs enemy collision (circle vs AABB)
function checkMaceCollision() {
  if (mace.phase !== 'swing' && mace.phase !== 'return') return;
  const ball = getMaceBallPos();

  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    // Clamp ball center to enemy rect, measure distance
    const nearX = Math.max(e.x, Math.min(ball.x, e.x + e.w));
    const nearY = Math.max(e.y, Math.min(ball.y, e.y + e.h));
    const dist  = Math.hypot(ball.x - nearX, ball.y - nearY);

    if (dist < mace.ballRadius + 4) {
      // HIT!
      score += 10 * multiplier;
      if (Math.random() < 0.3) { fireworks++; updateHUD(); }
      spawnParticles(e.x + e.w / 2, e.y + e.h / 2, '#f1c40f', 20);
      spawnParticles(e.x + e.w / 2, e.y + e.h / 2, '#e74c3c', 10);
      shakeScreen();
      updateHUD();
      enemies.splice(i, 1);
    }
  }
}

// ────────────────────────────────────────
// ── Main Loop ──
// ────────────────────────────────────────
function loop() {
  if (!isPlaying) { animId = null; return; }
  animId = requestAnimationFrame(loop);

  ctx.save();
  ctx.translate(shakeX, shakeY);
  ctx.clearRect(-20, -20, W + 40, H + 40);

  // ── Sky gradient ──
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
  skyGrad.addColorStop(0, '#5ab0d8');
  skyGrad.addColorStop(0.7, '#cceeff');
  skyGrad.addColorStop(1, '#ddeef0');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  // ── Clouds ──
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  drawCloud(W * 0.12, H * 0.10, 90);
  drawCloud(W * 0.42, H * 0.07, 120);
  drawCloud(W * 0.75, H * 0.13, 75);

  // ── Ground ──
  ctx.fillStyle = '#2c4a6a';
  ctx.fillRect(0, player.groundY + 42, W, 5);
  ctx.fillStyle = '#3a6b40';
  ctx.fillRect(0, player.groundY + 47, W, H - player.groundY - 47);

  // ── Boost logic ──
  if (boostTimer > 0) {
    boostTimer--;
    currentSpeed = baseSpeed + (multiplier * 3);
    if (boostTimer <= 0) { multiplier = 1; currentSpeed = baseSpeed; updateHUD(); }
  }

  // ── Player hover bob ──
  if (player.state === 'fly') {
    player.y = player.startY + Math.sin(Date.now() * 0.003) * 7;
  }

  // ── Goal 4: Update & check mace ──
  updateMace();
  checkMaceCollision();

  // ── Draw player ──
  const playerColor = boostTimer > 0 ? '#f1c40f' : '#3498db';
  ctx.fillStyle = playerColor;
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.strokeStyle = '#1a2a3a';
  ctx.lineWidth = 3;
  ctx.strokeRect(player.x, player.y, player.w, player.h);

  // Boost particle trail
  if (boostTimer > 0 && Math.random() < 0.5) {
    spawnParticles(player.x - 5, player.y + player.h / 2, '#f1c40f', 2);
  }

  // ── Draw mace (after player so it renders on top) ──
  drawMace();

  // ── Goal 2+3: Spawn enemies with gap guard ──
  if (Math.random() < 0.022 + (currentSpeed * 0.001)) {
    spawnEnemy(); // canSpawnEnemy() is checked inside spawnEnemy()
  }

  // ── Draw & update enemies ──
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.x -= currentSpeed;

    ctx.save();

    // Card shadow
    ctx.fillStyle = 'rgba(26,42,58,0.2)';
    ctx.fillRect(e.x + 4, e.y + 4, e.w, e.h);

    // Card image or placeholder
    ctx.strokeStyle = '#1a2a3a';
    ctx.lineWidth = 3;
    if (e.img.complete && e.img.naturalHeight !== 0) {
      ctx.drawImage(e.img, e.x, e.y, e.w, e.h);
    } else {
      // Checkerboard placeholder
      ctx.fillStyle = '#c0d8e8';
      ctx.fillRect(e.x, e.y, e.w, e.h);
      ctx.fillStyle = '#a0c0d8';
      const cs = 16;
      for (let cx = 0; cx < e.w; cx += cs) {
        for (let cy = 0; cy < e.h; cy += cs) {
          if ((Math.floor(cx / cs) + Math.floor(cy / cs)) % 2 === 0) {
            ctx.fillRect(e.x + cx, e.y + cy, Math.min(cs, e.w - cx), Math.min(cs, e.h - cy));
          }
        }
      }
    }
    ctx.strokeRect(e.x, e.y, e.w, e.h);

    // Goal 3: Larger work name label (18px, 20 chars)
    if (e.workName) {
      const label = e.workName.substring(0, 20);
      const labelH = 26;
      ctx.fillStyle = 'rgba(26,42,58,0.82)';
      ctx.fillRect(e.x, e.y + e.h, e.w, labelH);
      ctx.fillStyle = '#ffffff';
      ctx.font = '18px VT323, monospace';
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

  // ── Particles ──
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x  += p.vx;
    p.y  += p.vy;
    p.vy += 0.35; // gravity
    p.life -= 0.04;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), Math.ceil(p.size), Math.ceil(p.size));
    ctx.globalAlpha = 1;
  }

  // ── Speed ramp-up ──
  if (boostTimer <= 0 && score > 0) {
    baseSpeed    = 5 + Math.floor(score / 100) * 0.4;
    currentSpeed = Math.min(baseSpeed, 18);
  }

  ctx.restore();
}

// ── Cloud helper ──
function drawCloud(x, y, size) {
  ctx.fillRect(x, y, size, size * 0.42);
  ctx.fillRect(x + size * 0.15, y - size * 0.28, size * 0.7, size * 0.42);
  ctx.fillRect(x - size * 0.08, y, size * 0.28, size * 0.42);
  ctx.fillRect(x + size * 0.72, y, size * 0.28, size * 0.42);
}

// ── Game Over ──
function gameOver() {
  isPlaying = false;
  animId = null;
  const finEl = document.getElementById('finalScore');
  const goEl  = document.getElementById('gameOverScreen');
  if (finEl) finEl.textContent = score;
  if (goEl)  goEl.style.display = 'flex';
}
