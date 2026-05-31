// ── Portfolio Minigame Engine ──
// Standalone game.js — designed for game.html

let canvas, ctx;
let W, H;
let animId = null;

let worksData = [];
let gameSettings = {};

// Game State
let isPlaying = false;
let score = 0;
let fireworks = 0;
let multiplier = 1;
let boostTimer = 0;
let baseSpeed = 5;
let currentSpeed = baseSpeed;

// Entities
let player = { x: 100, y: 0, w: 40, h: 40, startY: 0, groundY: 0, state: 'fly', diveSpeed: 0 };
let enemies = [];
let particles = [];

// Input
let keys = {};

// ── Cleanup on page leave ──
window.onbeforeunload = function() {
  stopCleanup();
};

function stopCleanup() {
  isPlaying = false;
  if(animId) { cancelAnimationFrame(animId); animId = null; }
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  window.removeEventListener('resize', resizeGame);
}

// ── Init ──
window.initGame = function(portfolioWorks, settings) {
  worksData = (portfolioWorks || []).filter(w => w.image);
  gameSettings = settings || {};

  canvas = document.getElementById('gameCoreCanvas');
  if(!canvas) { console.error('gameCoreCanvas not found'); return; }
  ctx = canvas.getContext('2d');

  window.addEventListener('resize', resizeGame);
  resizeGame();

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  // Mobile touch support
  canvas.addEventListener('touchstart', handleTouch, { passive: false });

  window.resetGame();
};

// ── Stop ──
window.stopGame = function() {
  stopCleanup();
};

// ── Resize ──
function resizeGame() {
  if(!canvas) return;
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  player.startY = H * 0.25;   // Flying high in the sky
  player.groundY = H * 0.68;  // Enemies on the ground
  if(player.state === 'fly') player.y = player.startY;
}

// ── Reset ──
window.resetGame = function() {
  score = 0;
  fireworks = 0;
  multiplier = 1;
  boostTimer = 0;
  currentSpeed = baseSpeed;
  enemies = [];
  particles = [];
  player.x = 150;
  player.state = 'fly';
  player.y = player.startY;
  player.diveSpeed = 0;
  isPlaying = true;

  const goScreen = document.getElementById('gameOverScreen');
  if(goScreen) goScreen.style.display = 'none';

  updateHUD();

  // Restart loop if needed
  if(!animId) loop();
};

// ── Input ──
function handleKeyDown(e) {
  if(e.code === 'Space' || e.code === 'ArrowUp') e.preventDefault();
  if(!isPlaying) return;
  keys[e.code] = true;

  // SPACE / Arrow Up = Dive attack
  if((e.code === 'Space' || e.code === 'ArrowUp') && player.state === 'fly') {
    player.state = 'dive';
    player.diveSpeed = 12 + (currentSpeed * 0.5);
  }

  // SHIFT = Firework Boost
  if((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && fireworks > 0) {
    fireworks--;
    boostTimer += 180;
    multiplier = Math.min(multiplier + 1, 8);
    updateHUD();
  }
}

function handleKeyUp(e) {
  keys[e.code] = false;
}

// ── Touch support (tap = attack, 2-finger tap = boost) ──
function handleTouch(e) {
  e.preventDefault();
  if(!isPlaying) return;
  if(e.touches.length >= 2) {
    // Two finger tap = boost
    if(fireworks > 0) {
      fireworks--;
      boostTimer += 180;
      multiplier = Math.min(multiplier + 1, 8);
      updateHUD();
    }
  } else {
    // Single tap = dive
    if(player.state === 'fly') {
      player.state = 'dive';
      player.diveSpeed = 12 + (currentSpeed * 0.5);
    }
  }
}

// ── HUD ──
function updateHUD() {
  const scoreEl = document.getElementById('gameScore');
  const fwEl = document.getElementById('gameFireworks');
  const mulEl = document.getElementById('gameMultiplier');
  if(scoreEl) scoreEl.textContent = score;
  if(fwEl) fwEl.textContent = fireworks;
  if(mulEl) {
    if(multiplier > 1) {
      mulEl.textContent = `x${multiplier} BOOST!`;
      mulEl.style.display = 'block';
    } else {
      mulEl.style.display = 'none';
    }
  }
}

// ── Spawn Enemy ──
function spawnEnemy() {
  if(worksData.length === 0) return;
  const w = worksData[Math.floor(Math.random() * worksData.length)];
  const size = 55 + Math.random() * 50; // 55–105px

  let img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = w.image;

  enemies.push({
    x: W + 100,
    y: player.groundY - size + 30,
    w: size,
    h: size,
    img: img,
    workName: w.name || '',
    passed: false
  });
}

// ── Particles ──
function spawnParticles(x, y, color, count) {
  count = count || 16;
  for(let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12 - 2,
      life: 1.0,
      size: 2 + Math.random() * 4,
      color
    });
  }
}

// ── Screen Shake ──
let shakeX = 0, shakeY = 0;
function shakeScreen() {
  shakeX = (Math.random() - 0.5) * 12;
  shakeY = (Math.random() - 0.5) * 12;
  setTimeout(() => { shakeX = 0; shakeY = 0; }, 80);
}

// ── Main Game Loop ──
function loop() {
  if(!isPlaying) { animId = null; return; }
  animId = requestAnimationFrame(loop);

  // Clear with slight shake offset
  ctx.save();
  ctx.translate(shakeX, shakeY);

  ctx.clearRect(-20, -20, W + 40, H + 40);

  // ── Draw Sky ──
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
  skyGrad.addColorStop(0, '#7ec8e8');
  skyGrad.addColorStop(1, '#cceeff');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  // ── Clouds (simple pixel rects) ──
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  drawCloud(W * 0.15, H * 0.12, 80);
  drawCloud(W * 0.5, H * 0.08, 110);
  drawCloud(W * 0.8, H * 0.15, 70);

  // ── Ground ──
  ctx.fillStyle = '#2c4a6a';
  ctx.fillRect(0, player.groundY + 38, W, 5);
  ctx.fillStyle = '#3a6b40';
  ctx.fillRect(0, player.groundY + 43, W, H - player.groundY - 43);

  // ── Boost Logic ──
  if(boostTimer > 0) {
    boostTimer--;
    currentSpeed = baseSpeed + (multiplier * 3);
    if(boostTimer <= 0) {
      multiplier = 1;
      currentSpeed = baseSpeed;
      updateHUD();
    }
  }

  // ── Player Logic ──
  if(player.state === 'dive') {
    player.y += player.diveSpeed;
    if(player.y >= player.groundY) {
      player.y = player.groundY;
      player.state = 'return';
    }
  } else if(player.state === 'return') {
    player.y -= 10;
    if(player.y <= player.startY) {
      player.y = player.startY;
      player.state = 'fly';
    }
  }

  // Hover bob when flying
  if(player.state === 'fly') {
    player.y = player.startY + Math.sin(Date.now() * 0.003) * 6;
  }

  // ── Collision (during dive & return) ──
  if(player.state === 'dive' || player.state === 'return') {
    for(let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if(player.x < e.x + e.w && player.x + player.w > e.x &&
         player.y < e.y + e.h && player.y + player.h > e.y) {
        // HIT!
        score += 10 * multiplier;
        if(Math.random() < 0.3) {
          fireworks++;
          updateHUD();
        }
        spawnParticles(e.x + e.w/2, e.y + e.h/2, '#f1c40f', 20);
        spawnParticles(e.x + e.w/2, e.y + e.h/2, '#e74c3c', 10);
        shakeScreen();
        updateHUD();
        enemies.splice(i, 1);
      }
    }
  }

  // ── Draw Player ──
  const playerColor = boostTimer > 0 ? '#f1c40f' : '#3498db';
  ctx.fillStyle = playerColor;
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // Pixel outline
  ctx.strokeStyle = '#1a2a3a';
  ctx.lineWidth = 3;
  ctx.strokeRect(player.x, player.y, player.w, player.h);

  // Boost particle trail
  if(boostTimer > 0 && Math.random() < 0.5) {
    spawnParticles(player.x - 5, player.y + player.h / 2, '#f1c40f', 2);
  }

  // Dive trail
  if(player.state === 'dive') {
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = playerColor;
    ctx.fillRect(player.x + 4, player.y - 16, player.w - 8, 14);
    ctx.fillRect(player.x + 8, player.y - 28, player.w - 16, 10);
    ctx.globalAlpha = 1;
  }

  // ── Spawn Enemies ──
  if(Math.random() < 0.018 + (currentSpeed * 0.001)) {
    spawnEnemy();
  }

  // ── Draw & Update Enemies ──
  for(let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.x -= currentSpeed;

    ctx.save();
    ctx.strokeStyle = '#1a2a3a';
    ctx.lineWidth = 3;
    if(e.img.complete && e.img.naturalHeight !== 0) {
      ctx.drawImage(e.img, e.x, e.y, e.w, e.h);
    } else {
      // Placeholder: red pixel block
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(e.x, e.y, e.w, e.h);
    }
    ctx.strokeRect(e.x, e.y, e.w, e.h);

    // Work name label
    if(e.workName) {
      ctx.fillStyle = 'rgba(26,42,58,0.75)';
      ctx.fillRect(e.x, e.y + e.h, e.w, 22);
      ctx.fillStyle = '#fff';
      ctx.font = '14px VT323, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(e.workName.substring(0, 14), e.x + e.w / 2, e.y + e.h + 16);
      ctx.textAlign = 'left';
    }

    ctx.restore();

    // Miss penalty
    if(e.x + e.w < player.x && !e.passed) {
      e.passed = true;
      if(boostTimer <= 0) {
        score = Math.max(0, score - 5);
        updateHUD();
        if(score === 0) { gameOver(); return; }
      }
    }

    if(e.x + e.w < -150) enemies.splice(i, 1);
  }

  // ── Draw Particles ──
  for(let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.3; // gravity
    p.life -= 0.04;
    if(p.life <= 0) { particles.splice(i, 1); continue; }
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), Math.ceil(p.size), Math.ceil(p.size));
    ctx.globalAlpha = 1;
  }

  // ── Speed ramp-up ──
  if(boostTimer <= 0 && score > 0) {
    baseSpeed = 5 + Math.floor(score / 100) * 0.5;
    currentSpeed = Math.min(baseSpeed, 20);
  }

  ctx.restore();
}

// ── Helper: Draw pixel cloud ──
function drawCloud(x, y, size) {
  ctx.fillRect(x, y, size, size * 0.45);
  ctx.fillRect(x + size * 0.15, y - size * 0.3, size * 0.7, size * 0.45);
  ctx.fillRect(x - size * 0.1, y, size * 0.3, size * 0.45);
  ctx.fillRect(x + size * 0.7, y, size * 0.3, size * 0.45);
}

// ── Game Over ──
function gameOver() {
  isPlaying = false;
  animId = null;
  const finEl = document.getElementById('finalScore');
  const goEl = document.getElementById('gameOverScreen');
  if(finEl) finEl.textContent = score;
  if(goEl) goEl.style.display = 'flex';
}
