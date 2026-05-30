// ── Portfolio Minigame Engine ──

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

window.initGame = function(portfolioWorks, settings) {
  worksData = portfolioWorks.filter(w => w.image); // Only works with images can be enemies
  gameSettings = settings;

  canvas = document.getElementById('gameCoreCanvas');
  ctx = canvas.getContext('2d');
  
  window.addEventListener('resize', resizeGame);
  resizeGame();

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  resetGame();
  
  if(!animId) loop();
};

window.stopGame = function() {
  isPlaying = false;
  if(animId) { cancelAnimationFrame(animId); animId = null; }
  window.removeEventListener('resize', resizeGame);
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
};

function resizeGame() {
  if(!canvas) return;
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  player.startY = H * 0.3; // Flying high
  player.groundY = H * 0.7; // Enemies on ground
  if(player.state === 'fly') player.y = player.startY;
}

window.resetGame = function() {
  score = 0;
  fireworks = 0;
  multiplier = 1;
  boostTimer = 0;
  currentSpeed = baseSpeed;
  enemies = [];
  particles = [];
  player.state = 'fly';
  player.y = player.startY;
  isPlaying = true;
  
  document.getElementById('gameOverScreen').style.display = 'none';
  updateHUD();
};

function handleKeyDown(e) {
  if(!isPlaying) return;
  keys[e.code] = true;

  // SPACE = Attack (Dive)
  if(e.code === 'Space' && player.state === 'fly') {
    player.state = 'dive';
    player.diveSpeed = 15 + (currentSpeed * 0.5); // Dive faster if boosted
  }

  // SHIFT = Firework Boost
  if((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && fireworks > 0) {
    fireworks--;
    boostTimer += 180; // 3 seconds at 60fps per firework stack
    multiplier++;
    updateHUD();
  }
}

function handleKeyUp(e) {
  keys[e.code] = false;
}

function updateHUD() {
  document.getElementById('gameScore').innerText = score;
  document.getElementById('gameFireworks').innerText = fireworks;
  
  const mulEl = document.getElementById('gameMultiplier');
  if(multiplier > 1) {
    mulEl.innerText = `x${multiplier} BOOST!`;
    mulEl.style.display = 'block';
  } else {
    mulEl.style.display = 'none';
  }
}

function spawnEnemy() {
  if(worksData.length === 0) return;
  const w = worksData[Math.floor(Math.random() * worksData.length)];
  const size = 60 + Math.random() * 40; // 60 to 100
  
  // Create an image object to draw
  let img = new Image();
  img.src = w.image;

  enemies.push({
    x: W + 100,
    y: player.groundY - size + 40,
    w: size,
    h: size,
    img: img,
    workName: w.name,
    passed: false
  });
}

function spawnParticles(x, y, color) {
  for(let i=0; i<15; i++) {
    particles.push({
      x: x, y: y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      life: 1.0,
      color: color
    });
  }
}

function shakeScreen() {
  const overlay = document.getElementById('gameOverlay');
  overlay.style.transform = `translate(${(Math.random()-0.5)*10}px, ${(Math.random()-0.5)*10}px)`;
  setTimeout(() => overlay.style.transform = 'none', 50);
}

function loop() {
  if(!isPlaying) return;
  animId = requestAnimationFrame(loop);

  // Boost logic
  if(boostTimer > 0) {
    boostTimer--;
    currentSpeed = baseSpeed + (multiplier * 3);
    if(boostTimer <= 0) {
      multiplier = 1;
      currentSpeed = baseSpeed;
      updateHUD();
    }
  }

  // Clear
  ctx.clearRect(0, 0, W, H);

  // Draw Ground Line
  ctx.fillStyle = '#1a2a3a';
  ctx.fillRect(0, player.groundY + 40, W, H - player.groundY);
  ctx.fillStyle = '#2c4a6a';
  ctx.fillRect(0, player.groundY + 40, W, 4);

  // Player Logic
  if(player.state === 'dive' || player.state === 'return') {
    if(player.state === 'dive') {
      player.y += player.diveSpeed;
      if(player.y >= player.groundY) {
        player.y = player.groundY;
        player.state = 'return';
      }
    } else {
      player.y -= 10;
      if(player.y <= player.startY) {
        player.y = player.startY;
        player.state = 'fly';
      }
    }

    // Check collision continuously during the attack
    for(let i = enemies.length - 1; i >= 0; i--) {
      let e = enemies[i];
      // AABB Collision
      if(player.x < e.x + e.w && player.x + player.w > e.x &&
         player.y < e.y + e.h && player.y + player.h > e.y) {
           
        // HIT!
        score += 10 * multiplier;
        
        // Firework drop chance (30%)
        if(Math.random() < 0.3) {
          fireworks++;
          updateHUD(); // ensure fireworks UI updates immediately
        }
        
        spawnParticles(e.x + e.w/2, e.y + e.h/2, '#e74c3c');
        shakeScreen();
        updateHUD();
        
        enemies.splice(i, 1); // Remove enemy
      }
    }
  }

  // Draw Player (Placeholder block)
  ctx.fillStyle = boostTimer > 0 ? '#f1c40f' : '#3498db'; // Gold if boosted, blue normally
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // Boost trail
  if(boostTimer > 0 && Math.random() < 0.5) {
    spawnParticles(player.x, player.y + 20, '#f1c40f');
  }

  // Enemy Logic
  if(Math.random() < 0.02 + (currentSpeed * 0.001)) { // Spawn rate scales with speed
    spawnEnemy();
  }

  for(let i = enemies.length - 1; i >= 0; i--) {
    let e = enemies[i];
    e.x -= currentSpeed;

    // Draw Enemy (Work image)
    ctx.save();
    ctx.strokeStyle = '#1a2a3a';
    ctx.lineWidth = 3;
    if(e.img.complete && e.img.naturalHeight !== 0) {
      ctx.drawImage(e.img, e.x, e.y, e.w, e.h);
      ctx.strokeRect(e.x, e.y, e.w, e.h);
    } else {
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(e.x, e.y, e.w, e.h);
    }
    ctx.restore();

    // Miss Penalty (Enemy passes player without being hit)
    if(e.x + e.w < player.x && !e.passed) {
      e.passed = true;
      if(boostTimer <= 0) { // No penalty if invincible/boosting
        score = Math.max(0, score - 5);
        updateHUD();
        
        // If score is 0 and they missed, Game Over!
        if(score === 0) {
          gameOver();
        }
      }
    }

    if(e.x + e.w < -100) {
      enemies.splice(i, 1);
    }
  }

  // Particles
  for(let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.05;
    if(p.life <= 0) {
      particles.splice(i, 1);
    } else {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 4, 4);
      ctx.globalAlpha = 1.0;
    }
  }
}

function gameOver() {
  isPlaying = false;
  document.getElementById('finalScore').innerText = score;
  document.getElementById('gameOverScreen').style.display = 'flex';
}
