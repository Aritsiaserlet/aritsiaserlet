// ── Portfolio Minigame Engine ──
// Standalone game.js — designed for game.html

// ─────────────────────────────────────────────
// ── Tunable Constants (attack — UNCHANGED)
// ─────────────────────────────────────────────
const MIN_ENEMY_GAP   = 380;
const DIVE_SPEED      = 22;
const VX_DIVE         = 3;
const STRIKE_FRAMES   = 4;
const ASCENT_SPEED    = 16;
const CHAIN_THRESHOLD = 0.38;
const HITBOX_PAD      = 8;
const TILT_DIVE       = 15;
const TILT_STRIKE     = 25;
const DEG             = Math.PI / 180;

// ─────────────────────────────────────────────
// ── Engine State
// ─────────────────────────────────────────────
let canvas, ctx;
let W, H;
let animId     = null;
let frameCount = 0;

let worksData    = [];
let gameSettings = {};

let isPlaying    = false;
let score        = 0;
let fireworks    = 0;
let multiplier   = 1;
let boostTimer   = 0;
let baseSpeed    = 5;
let currentSpeed = baseSpeed;

// ── Player (UNCHANGED)
let player = {
  x: 0, y: 0, vy: 0, vxDive: 0, baseX: 0,
  w: 44, h: 44, startY: 0, groundY: 0
};

// ── Attack (UNCHANGED)
let attack = { phase: 'idle', frameCount: 0, canChain: true, chainY: 0 };

let enemies   = [];
let particles = [];
let keys      = {};

// ─────────────────────────────────────────────
// ── Visual Systems State
// ─────────────────────────────────────────────
let clouds      = [];
let windStreaks  = [];
let speedLines  = [];
let grassBack   = [];
let grassMid    = [];
let grassFront  = [];
let dirtStones  = [];
let flowers     = [];
let birds       = [];
let nextBirdFrame = 0;
let groundOffset  = 0;   // scrolls left each frame

function getGraphicsScale() {
  try {
    const raw = localStorage.getItem('portfolioSettings');
    if(raw) {
      const set = JSON.parse(raw);
      if(set.graphics === 'Low') return 0.4;
      if(set.graphics === 'Medium') return 0.7;
      if(set.graphics === 'High') return 1.0;
      if(set.graphics === 'Ultra') return 1.5;
    }
  } catch(e) {}
  return 1.0;
}

// ── Screen shake (frame-based)
let shakeX = 0, shakeY = 0, shakeFrames = 0;

// ─────────────────────────────────────────────
// ── Cloud System (boost-aware)
// ─────────────────────────────────────────────
function initClouds() {
  clouds = [];
  const g = getGraphicsScale();
  const count = Math.floor(7 * g);
  for (let i = 0; i < count; i++)
    clouds.push(makeCloud(Math.random() * W));
}
function makeCloud(startX) {
  return {
    x:     startX,
    y:     H * (0.03 + Math.random() * 0.20),
    size:  55 + Math.random() * 90,
    speed: 0.12 + Math.random() * 0.28,
    alpha: 0.40 + Math.random() * 0.30
  };
}
function updateClouds() {
  const mult = boostTimer > 0 ? 3.0 : 1.0;
  for (const c of clouds) {
    c.x -= c.speed * mult;
    if (c.x + c.size * 1.4 < 0) {
      c.x     = W + 20 + Math.random() * 150;
      c.y     = H * (0.03 + Math.random() * 0.20);
      c.size  = 55 + Math.random() * 90;
      c.speed = 0.12 + Math.random() * 0.28;
      c.alpha = 0.40 + Math.random() * 0.30;
    }
  }
}
function drawClouds() {
  for (const c of clouds) {
    ctx.globalAlpha = c.alpha;
    ctx.fillStyle   = '#ffffff';
    const s = c.size;
    ctx.fillRect(c.x,              c.y,            s,         s * 0.42);
    ctx.fillRect(c.x + s * 0.15,   c.y - s * 0.28, s * 0.70,  s * 0.42);
    ctx.fillRect(c.x - s * 0.08,   c.y,            s * 0.28,  s * 0.42);
    ctx.fillRect(c.x + s * 0.72,   c.y,            s * 0.28,  s * 0.42);
  }
  ctx.globalAlpha = 1;
}

// ─────────────────────────────────────────────
// ── Wind Streaks (more visible, boost-aware)
// ─────────────────────────────────────────────
function initWind() {
  windStreaks = [];
  const target = Math.floor(40 * getGraphicsScale());
  for (let i = 0; i < target; i++)
    windStreaks.push(makeWindStreak(Math.random() * W));
}
function makeWindStreak(startX) {
  const tier = Math.random(); // 0=short 1=long
  return {
    x:     startX,
    y:     Math.random() * H * 0.82,
    len:   tier < 0.35 ? (15 + Math.random() * 15)
         : tier < 0.70 ? (30 + Math.random() * 20)
                       : (55 + Math.random() * 30),
    speed: 2.8 + Math.random() * 4.5,
    alpha: 0.12 + Math.random() * 0.23,
    thick: Math.random() < 0.25 ? 2 : 1
  };
}
function updateWindStreaks() {
  const g = getGraphicsScale();
  const targetCount = boostTimer > 0 ? Math.floor(55 * g) : Math.floor(40 * g);
  const speedMult   = boostTimer > 0 ? 2.5 : 1.0; // Intensify wind blur during boost

  while (windStreaks.length < targetCount)
    windStreaks.push(makeWindStreak(W + Math.random() * 80));
  while (windStreaks.length > 60)
    windStreaks.pop();

  for (const w of windStreaks) {
    w.x -= w.speed * speedMult;
    if (w.x + w.len < 0) {
      w.x     = W + Math.random() * 60;
      w.y     = Math.random() * H * 0.82;
      const tier = Math.random();
      w.len   = tier < 0.35 ? (15 + Math.random() * 15)
              : tier < 0.70 ? (30 + Math.random() * 20)
                            : (55 + Math.random() * 30);
      w.speed = 2.8 + Math.random() * 4.5;
      w.alpha = 0.12 + Math.random() * 0.23;
    }
  }
}
function drawWindStreaks() {
  ctx.strokeStyle = '#ffffff';
  ctx.lineCap     = 'round';
  for (const w of windStreaks) {
    ctx.globalAlpha = w.alpha;
    ctx.lineWidth   = w.thick;
    ctx.beginPath();
    ctx.moveTo(w.x + w.len, w.y);
    ctx.lineTo(w.x, w.y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.lineCap     = 'butt';
}

// ─────────────────────────────────────────────
// ── Speed Lines (boost only)
// ─────────────────────────────────────────────
function updateSpeedLines() {
  const g = getGraphicsScale();
  if (boostTimer > 0) {
    const linesPerFrame = Math.max(1, Math.floor(4 * g));
    for (let i = 0; i < linesPerFrame; i++) {
      speedLines.push({
        x:     W + 5,
        y:     Math.random() * H,
        len:   70 + Math.random() * 130,
        alpha: 0.28 + Math.random() * 0.32,
        speed: 18 + Math.random() * 14
      });
    }
  }
  for (let i = speedLines.length - 1; i >= 0; i--) {
    speedLines[i].x     -= speedLines[i].speed;
    speedLines[i].alpha -= 0.035;
    if (speedLines[i].alpha <= 0 || speedLines[i].x + speedLines[i].len < 0)
      speedLines.splice(i, 1);
  }
  if (speedLines.length > 50) speedLines.splice(0, speedLines.length - 50);
}
function drawSpeedLines() {
  if (speedLines.length === 0) return;
  ctx.strokeStyle = '#ffffff';
  ctx.lineCap     = 'round';
  for (const sl of speedLines) {
    ctx.globalAlpha = sl.alpha;
    ctx.lineWidth   = 1 + (Math.random() < 0.3 ? 1 : 0);
    ctx.beginPath();
    ctx.moveTo(sl.x + sl.len, sl.y);
    ctx.lineTo(sl.x, sl.y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.lineCap     = 'butt';
}

// ─────────────────────────────────────────────
// ── Ground (4 layers, scrolling parallax)
// ─────────────────────────────────────────────
function initGrass() {
  const g = getGraphicsScale();
  grassBack = []; grassMid = []; grassFront = []; dirtStones = []; flowers = [];

  const genClumps = (arr, density, maxH, minH, colors) => {
    const spacing = 12 / density;
    const numClumps = Math.ceil(W / spacing) + 3;
    for (let i = 0; i < numClumps; i++) {
      const cx = i * spacing + (Math.random() - 0.5) * 8;
      const numBlades = 2 + Math.floor(Math.random() * 3);
      const blades = [];
      for (let j = 0; j < numBlades; j++) {
        blades.push({
          dx: (Math.random() - 0.5) * 10,
          h: Math.round(minH + Math.random() * (maxH - minH)),
          w: 1 + (Math.random() < 0.38 ? 1 : 0),
          cBot: colors.cBot, cMid: colors.cMid, cTop: colors.cTop,
          swayFactor: 0.5 + Math.random() * 0.7,
          swayPhase: Math.random() * Math.PI * 2
        });
      }
      arr.push({ relX: cx, blades });
    }
  };

  // 3 Layers of grass (parallax)
  // Background (tall, dark, slow)
  genClumps(grassBack, 0.7 * g, 30, 20, {cBot:'#154015', cMid:'#1e5a1e', cTop:'#2e7030'});
  // Mid (medium, normal, normal)
  genClumps(grassMid, 1.0 * g, 20, 12, {cBot:'#2e7030', cMid:'#3a8536', cTop:'#4a9b3a'});
  // Front (short, bright, fast)
  genClumps(grassFront, 0.8 * g, 14, 6, {cBot:'#4a9932', cMid:'#6abf48', cTop:'#90e040'});

  // Tiny pixel flowers in Mid layer
  const numFlowers = Math.floor(8 * g);
  const fCols = ['#f1c40f','#e74c3c','#9b59b6','#3498db'];
  for(let i=0; i<numFlowers; i++) {
    flowers.push({
      relX: Math.random() * W,
      yOff: Math.random() * 8,
      c: fCols[Math.floor(Math.random()*fCols.length)],
      swayPhase: Math.random() * 10
    });
  }

  // ── Dense dirt stones (warm tones, many sizes)
  const stoneColors = ['#4a2810','#6a3c1a','#8a5228','#7a4420','#9e6535','#5e3216','#3c2008'];
  const stoneCount = Math.floor(W / (11 / g)) + 6;
  for (let i = 0; i < stoneCount; i++) {
    dirtStones.push({
      relX:  Math.random() * W,
      dy:    4 + Math.random() * 50,
      w:     2 + Math.floor(Math.random() * 5),
      h:     2 + Math.floor(Math.random() * 4),
      color: stoneColors[Math.floor(Math.random() * stoneColors.length)]
    });
  }
}

function drawGround() {
  const gy     = player.groundY + 42;
  const off    = groundOffset % W;
  const grassH = 36;
  const t      = Date.now() * 0.001;
  const boostM = boostTimer > 0 ? 2.5 : 1.0;
  const windAmp = boostTimer > 0 ? 6   : 2.8;

  // Helper to draw clumps
  const drawClumps = (clumps, parallax, offsetMod = 0) => {
    const pOff = (groundOffset * parallax + offsetMod) % W;
    for (const clump of clumps) {
      const cx = ((clump.relX - pOff) % W + W) % W;
      for (const b of clump.blades) {
        const bx  = cx + b.dx;
        if (bx < -12 || bx > W + 12) continue;
        const sway = Math.sin(t * 1.5 * boostM + b.swayPhase) * windAmp * b.swayFactor;
        const seg1H = Math.max(1, Math.round(b.h * 0.38));
        const seg2H = Math.max(1, Math.round(b.h * 0.34));
        const seg3H = Math.max(1, b.h - seg1H - seg2H);
        const x0 = Math.round(bx);
        const x1 = Math.round(bx + sway * 0.45);
        const x2 = Math.round(bx + sway);

        ctx.fillStyle = b.cBot; ctx.fillRect(x0, gy - seg1H, b.w, seg1H);
        ctx.fillStyle = b.cMid; ctx.fillRect(x1, gy - seg1H - seg2H, b.w, seg2H);
        ctx.fillStyle = b.cTop; ctx.fillRect(x2, gy - seg1H - seg2H - seg3H, b.w, seg3H);
      }
    }
  };

  // 1. Background Grass (slowest parallax)
  drawClumps(grassBack, 0.4, 0);

  // 2. Dirt base & Stones (normal speed)
  ctx.fillStyle = '#8b5530';
  ctx.fillRect(0, gy + grassH, W, H - gy - grassH);
  for (const s of dirtStones) {
    const sx = ((s.relX - off) % W + W) % W;
    ctx.fillStyle = s.color;
    ctx.fillRect(Math.round(sx), gy + grassH + s.dy, s.w, s.h);
    if (sx < 8) ctx.fillRect(Math.round(sx + W), gy + grassH + s.dy, s.w, s.h);
  }

  // 3. Dark transition & Mid solid fill
  ctx.fillStyle = '#1e5022'; ctx.fillRect(0, gy + grassH - 8, W, 10);
  ctx.fillStyle = '#4a9b3a'; ctx.fillRect(0, gy, W, grassH - 8);
  ctx.fillStyle = '#6abf50'; ctx.fillRect(0, gy, W, 8); // bright top strip

  // 4. Mid Grass (normal speed)
  drawClumps(grassMid, 1.0, 0);

  // 4.5 Pixel Flowers (in mid layer)
  for(const f of flowers) {
    const fx = ((f.relX - off) % W + W) % W;
    if(fx < -10 || fx > W + 10) continue;
    const sway = Math.sin(t * 1.5 * boostM + f.swayPhase) * windAmp * 0.6;
    ctx.fillStyle = '#3a8536'; // stem
    ctx.fillRect(Math.round(fx + sway*0.5), gy - f.yOff, 2, f.yOff);
    ctx.fillStyle = f.c; // petal
    ctx.fillRect(Math.round(fx + sway), gy - f.yOff - 2, 4, 4);
    ctx.fillStyle = '#ffffff'; // center
    ctx.fillRect(Math.round(fx + sway + 1), gy - f.yOff - 1, 2, 2);
  }

  // 5. Foreground Grass (fast parallax)
  drawClumps(grassFront, 1.5, 0);

  // 6. Ground separator line
  ctx.fillStyle = '#111a10';
  ctx.fillRect(0, gy - 1, W, 1);
}

// ─────────────────────────────────────────────
// ── Ambient Birds (tiny V-shapes)
// ─────────────────────────────────────────────
function updateBirds() {
  if (frameCount >= nextBirdFrame && birds.length < 5) {
    const flock = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < flock; i++) {
      birds.push({
        x:     W + 30 + i * 20,
        y:     H * (0.05 + Math.random() * 0.18),
        speed: 0.55 + Math.random() * 0.5,
        size:  2 + (Math.random() < 0.35 ? 1 : 0),
        bob:   Math.random() * Math.PI * 2
      });
    }
    nextBirdFrame = frameCount + 600 + Math.floor(Math.random() * 300);
  }
  for (let i = birds.length - 1; i >= 0; i--) {
    birds[i].x   -= birds[i].speed;
    birds[i].bob += 0.038;
    if (birds[i].x < -20) birds.splice(i, 1);
  }
}
function drawBirds() {
  ctx.fillStyle = 'rgba(26,42,58,0.32)';
  for (const b of birds) {
    const ry = b.y + Math.sin(b.bob) * 2.5;
    ctx.fillRect(Math.round(b.x),          Math.round(ry),     b.size, 1);
    ctx.fillRect(Math.round(b.x + b.size), Math.round(ry - 1), b.size, 1);
  }
}

// ─────────────────────────────────────────────
// ── Screen Shake (frame-based, decreasing)
// ─────────────────────────────────────────────
function shakeScreen() { shakeFrames = 7; }
function updateShake() {
  if (shakeFrames > 0) {
    const mag = shakeFrames * 1.5;
    shakeX = (Math.random() - 0.5) * mag;
    shakeY = (Math.random() - 0.5) * mag;
    shakeFrames--;
  } else { shakeX = 0; shakeY = 0; }
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

  // ── Mouse controls
  canvas.addEventListener('click', (e) => {
    if (!isPlaying) return;
    if (attack.canChain) triggerDive();
  });
  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (!isPlaying) return;
    if (fireworks > 0) { fireworks--; boostTimer += 180; multiplier = Math.min(multiplier + 1, 8); updateHUD(); }
  });

  // ── Touch: left half = dive, right half = boost
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

  initClouds();
  initWind();
  initGrass();
}

// ─────────────────────────────────────────────
// ── Reset
// ─────────────────────────────────────────────
window.resetGame = function () {
  score        = 0; fireworks    = 0; multiplier   = 1;
  boostTimer   = 0; baseSpeed    = 5; currentSpeed = baseSpeed;
  enemies      = []; particles   = [];
  frameCount   = 0; groundOffset = 0;
  birds        = []; speedLines  = [];
  nextBirdFrame = 600 + Math.floor(Math.random() * 300);

  player.x = player.baseX; player.y = player.startY;
  player.vy = 0; player.vxDive = 0;

  attack.phase = 'idle'; attack.frameCount = 0; attack.canChain = true;
  shakeX = 0; shakeY = 0; shakeFrames = 0;

  if (clouds.length === 0)       initClouds();
  if (windStreaks.length === 0)   initWind();
  if (grassClumps.length === 0)  initGrass();

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
  if ((e.code === 'Space' || e.code === 'ArrowUp') && attack.canChain) triggerDive();
  if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && fireworks > 0) {
    fireworks--; boostTimer += 180; multiplier = Math.min(multiplier + 1, 8); updateHUD();
  }
}
function handleKeyUp(e) { keys[e.code] = false; }

function handleTouch(e) {
  e.preventDefault();
  if (!isPlaying || e.touches.length === 0) return;
  const touchX = e.touches[0].clientX;
  if (touchX < W / 2) {
    // Left half → Boost
    if (fireworks > 0) { fireworks--; boostTimer += 180; multiplier = Math.min(multiplier + 1, 8); updateHUD(); }
  } else {
    // Right half → Dive
    if (attack.canChain) triggerDive();
  }
}

// ─────────────────────────────────────────────
// ── HUD (UNCHANGED)
// ─────────────────────────────────────────────
function updateHUD() {
  const scoreEl = document.getElementById('gameScore');
  const fwEl    = document.getElementById('gameFireworks');
  const mulEl   = document.getElementById('gameMultiplier');
  if (scoreEl) scoreEl.textContent = score;
  if (fwEl)    fwEl.textContent    = fireworks;
  if (mulEl) {
    if (multiplier > 1) { mulEl.textContent = `x${multiplier} BOOST!`; mulEl.style.display = 'block'; }
    else mulEl.style.display = 'none';
  }
}

// ─────────────────────────────────────────────
// ── Elytra Dive Attack — State Machine (UNCHANGED)
// ─────────────────────────────────────────────
function getStrikeY() { return player.groundY - player.h - 80; }

function triggerDive() {
  player.vy = DIVE_SPEED; player.vxDive = VX_DIVE;
  attack.phase = 'dive'; attack.frameCount = 0; attack.canChain = false;
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
    player.y += player.vy; player.x += player.vxDive;
    if (player.y >= strikeY) {
      player.y = strikeY; player.vxDive = 0;
      attack.phase = 'strike'; attack.frameCount = 0;
    }
  } else if (attack.phase === 'strike') {
    player.y = strikeY;
    if (attack.frameCount >= STRIKE_FRAMES) {
      attack.chainY = player.startY + (strikeY - player.startY) * (1 - CHAIN_THRESHOLD);
      player.vy = -ASCENT_SPEED;
      attack.phase = 'ascend'; attack.frameCount = 0;
    }
  } else if (attack.phase === 'ascend') {
    player.y += player.vy;
    player.x += (player.baseX - player.x) * 0.12;
    if (!attack.canChain && player.y <= attack.chainY) attack.canChain = true;
    if (player.y <= player.startY) {
      player.y = player.startY; player.x = player.baseX; player.vy = 0;
      attack.phase = 'idle'; attack.frameCount = 0; attack.canChain = true;
    }
  }
}

// ─────────────────────────────────────────────
// ── Collision (UNCHANGED logic, improved particles)
// ─────────────────────────────────────────────
function checkDiveCollision() {
  if (attack.phase !== 'strike') return;
  const hx = player.x - HITBOX_PAD, hy = player.y - HITBOX_PAD;
  const hw = player.w + HITBOX_PAD * 2, hh = player.h + HITBOX_PAD * 2;
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (hx < e.x + e.w && hx + hw > e.x && hy < e.y + e.h && hy + hh > e.y) {
      score += 10 * multiplier;
      if (Math.random() < 0.3) { fireworks++; updateHUD(); }
      const ex = e.x + e.w / 2, ey = e.y + e.h / 2;
      spawnParticles(ex, ey, '#f1c40f', 16);
      spawnParticles(ex, ey, '#ffffff', 10);
      spawnParticles(ex, ey, '#ffd700', 8);
      shakeScreen(); updateHUD();
      enemies.splice(i, 1);
    }
  }
}

// ─────────────────────────────────────────────
// ── Draw Player (improved trail + Minecraft firework boost trail)
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

  // ── Dive trail (5 ghosts, tilted)
  if (attack.phase === 'dive') {
    for (let i = 1; i <= 5; i++) {
      ctx.globalAlpha = 0.30 - i * 0.05;
      ctx.fillStyle   = playerColor;
      const gx = player.x - player.vxDive * i * 0.5;
      const gy = player.y + player.vy     * i * 0.38;
      ctx.save();
      ctx.translate(gx + player.w / 2, gy + player.h / 2);
      ctx.rotate(tiltRad * (1 - i * 0.08));
      ctx.fillRect(-player.w / 2, -player.h / 2, player.w, player.h);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  } else if (attack.phase === 'ascend') {
    // ── Ascend trail (2 ghosts)
    for (let i = 1; i <= 2; i++) {
      ctx.globalAlpha = 0.17 - i * 0.05;
      ctx.fillStyle   = playerColor;
      ctx.fillRect(Math.round(player.x), Math.round(player.y - player.vy * i * 0.38), player.w, player.h);
    }
    ctx.globalAlpha = 1;
  }

  // ── Main player block
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tiltRad);
  ctx.fillStyle   = playerColor;
  ctx.fillRect(-player.w / 2, -player.h / 2, player.w, player.h);
  ctx.strokeStyle = '#1a2a3a'; ctx.lineWidth = 3;
  ctx.strokeRect(-player.w / 2, -player.h / 2, player.w, player.h);
  ctx.restore();

  // ── Minecraft-style Elytra firework boost trail (white/gray sparks)
  if (boostTimer > 0) {
    if (frameCount % 2 === 0) {
      const trailColors = ['#ffffff', '#dddddd', '#eeeeee', '#cccccc'];
      for (let i = 0; i < 3; i++) {
        spawnParticles(
          player.x - 4 + (Math.random() - 0.5) * 6,
          player.y + player.h * (0.25 + Math.random() * 0.5),
          trailColors[Math.floor(Math.random() * trailColors.length)],
          1
        );
      }
    }
  }

  // ── Strike flash
  if (attack.phase === 'strike' && attack.frameCount <= 2) {
    ctx.globalAlpha = 0.55;
    ctx.fillStyle   = '#ffffff';
    ctx.fillRect(player.x - HITBOX_PAD, player.y - HITBOX_PAD,
                 player.w + HITBOX_PAD * 2, player.h + HITBOX_PAD * 2);
    ctx.globalAlpha = 1;
  }
}

// ─────────────────────────────────────────────
// ── Enemy Spawn (160–220px for better readability)
// ─────────────────────────────────────────────
function canSpawnEnemy() {
  if (enemies.length === 0) return true;
  const rightmost = enemies.reduce((max, e) => Math.max(max, e.x + e.w), -Infinity);
  return rightmost < W - MIN_ENEMY_GAP;
}
function spawnEnemy() {
  if (worksData.length === 0 || !canSpawnEnemy()) return;
  const w    = worksData[Math.floor(Math.random() * worksData.length)];
  const size = 160 + Math.random() * 60; // ✦ 160–220px
  const img  = new Image();
  img.crossOrigin = 'anonymous';
  img.src = w.image;
  enemies.push({
    x: W + 80, y: player.groundY - size + 30,
    w: size, h: size, img,
    workName: w.name || '',
    passed: false,
    offset: Math.random() * Math.PI * 2
  });
}

// ─────────────────────────────────────────────
// ── Particles (UNCHANGED)
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// ── Main Loop
// ─────────────────────────────────────────────
function loop() {
  if (!isPlaying) { animId = null; return; }
  animId = requestAnimationFrame(loop);
  frameCount++;

  updateShake();

  ctx.save();
  ctx.translate(shakeX, shakeY);
  ctx.clearRect(-20, -20, W + 40, H + 40);

  // ── Sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
  skyGrad.addColorStop(0,    '#4aa8ce');
  skyGrad.addColorStop(0.65, '#c4eaff');
  skyGrad.addColorStop(1,    '#daeef5');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  // ── Layer 1: Clouds (slowest parallax)
  updateClouds();
  drawClouds();

  // ── Layer 2: Wind streaks (medium)
  updateWindStreaks();
  drawWindStreaks();

  // ── Layer 3: Boost speed lines
  updateSpeedLines();
  drawSpeedLines();

  // ── Layer 4: Birds (ambient)
  updateBirds();
  drawBirds();

  // ── Ground scrolling
  const groundSpeedMult = boostTimer > 0 ? 3.0 : 1.0;
  groundOffset += currentSpeed * groundSpeedMult * 0.45;

  // ── Layer 5: Ground (4 layers)
  drawGround();

  // ── Boost / speed logic
  if (boostTimer > 0) {
    boostTimer--;
    currentSpeed = baseSpeed + (multiplier * 3);
    if (boostTimer <= 0) { multiplier = 1; currentSpeed = baseSpeed; updateHUD(); }
  }

  // ── Attack
  updateAttack();

  // ── Player
  drawPlayer();

  // ── Collision
  checkDiveCollision();

  // ── Spawn enemies
  if (Math.random() < 0.022 + currentSpeed * 0.001) spawnEnemy();

  // ── Enemies (Layer 6: fastest — with hover bob + ghost motion blur)
  const now = Date.now();
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.x -= currentSpeed;

    const renderY = e.y + Math.sin(now * 0.002 + e.offset) * 3;

    // ── Ghost motion blur: 2 copies to the right (previous positions)
    for (let g = 1; g <= 2; g++) {
      const ghostX = e.x + currentSpeed * g * 0.55;
      ctx.globalAlpha = g === 1 ? 0.14 : 0.07;
      if (e.img.complete && e.img.naturalHeight !== 0)
        ctx.drawImage(e.img, ghostX, renderY, e.w, e.h);
      else {
        ctx.fillStyle = '#c0d8e8';
        ctx.fillRect(ghostX, renderY, e.w, e.h);
      }
    }
    ctx.globalAlpha = 1;

    ctx.save();

    // Card shadow
    ctx.fillStyle = 'rgba(26,42,58,0.20)';
    ctx.fillRect(e.x + 5, renderY + 5, e.w, e.h);

    // Thumbnail
    ctx.strokeStyle = '#1a2a3a'; ctx.lineWidth = 2;
    if (e.img.complete && e.img.naturalHeight !== 0) {
      ctx.drawImage(e.img, e.x, renderY, e.w, e.h);
    } else {
      ctx.fillStyle = '#c0d8e8';
      ctx.fillRect(e.x, renderY, e.w, e.h);
      ctx.fillStyle = '#a0c0d8';
      const cs = 18;
      for (let bx = 0; bx < e.w; bx += cs)
        for (let by = 0; by < e.h; by += cs)
          if ((Math.floor(bx / cs) + Math.floor(by / cs)) % 2 === 0)
            ctx.fillRect(e.x + bx, renderY + by, Math.min(cs, e.w - bx), Math.min(cs, e.h - by));
    }
    ctx.strokeRect(e.x, renderY, e.w, e.h);

    // Label — 22px VT323
    if (e.workName) {
      const label  = e.workName.substring(0, 20);
      const labelH = 30;
      ctx.fillStyle = 'rgba(18,30,46,0.90)';
      ctx.fillRect(e.x, renderY + e.h, e.w, labelH);
      ctx.fillStyle = '#ffffff';
      ctx.font      = '22px VT323, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, e.x + e.w / 2, renderY + e.h + 22);
      ctx.textAlign = 'left';
    }

    ctx.restore();

    // Miss penalty
    if (e.x + e.w < player.x && !e.passed) {
      e.passed = true;
      if (boostTimer <= 0) {
        score = Math.max(0, score - 5); updateHUD();
        if (score === 0) { gameOver(); return; }
      }
    }
    if (e.x + e.w < -200) enemies.splice(i, 1);
  }

  // ── Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.32; p.life -= 0.04;
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

// ── Game Over (UNCHANGED)
function gameOver() {
  isPlaying = false; animId = null;
  const finEl = document.getElementById('finalScore');
  const goEl  = document.getElementById('gameOverScreen');
  if (finEl) finEl.textContent = score;
  if (goEl)  goEl.style.display = 'flex';
}
