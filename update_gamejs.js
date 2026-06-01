const fs = require('fs');

let js = fs.readFileSync('game.js', 'utf-8');

// Add variables for custom sprites
const var_additions = `
// Custom Sprites
let playerSpriteImg = null;
let playerAttackImg = null;
let playerSpriteData = null;
let playerAttackData = null;
let playerAnimFrame = 0;
let playerAnimTimer = 0;
`;
js = js.replace('// ── Audio (UNCHANGED)', var_additions + '\n// ── Audio (UNCHANGED)');

// Update initGame to load sprites
const init_additions = `
  // Preload custom sprites
  if (gameSettings.game) {
    if (gameSettings.game.playerSprite) {
      playerSpriteImg = new Image();
      playerSpriteImg.src = gameSettings.game.playerSprite;
      playerSpriteData = {
        frames: gameSettings.game.playerSpriteFrames || 1,
        fps: gameSettings.game.playerSpriteFps || 12,
        loop: gameSettings.game.playerSpriteLoop !== false
      };
    }
    if (gameSettings.game.playerAttackSprite) {
      playerAttackImg = new Image();
      playerAttackImg.src = gameSettings.game.playerAttackSprite;
      playerAttackData = {
        frames: gameSettings.game.playerAttackFrames || 1,
        fps: gameSettings.game.playerAttackFps || 15,
        loop: gameSettings.game.playerAttackLoop === true
      };
    }
  }
`;
js = js.replace('  window.addEventListener(\'resize\', resizeGame);', init_additions + '\n  window.addEventListener(\'resize\', resizeGame);');

// Update drawPlayer
const draw_player_replacement = `
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

  // 🔹 Dive trail (5 ghosts, tilted)
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
    // 🔹 Ascend trail (2 ghosts)
    for (let i = 1; i <= 2; i++) {
      ctx.globalAlpha = 0.17 - i * 0.05;
      ctx.fillStyle   = playerColor;
      ctx.fillRect(Math.round(player.x), Math.round(player.y - player.vy * i * 0.38), player.w, player.h);
    }
    ctx.globalAlpha = 1;
  }

  // Draw main player
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tiltRad);

  // Custom Sprite Logic
  const isAttacking = (attack.phase === 'dive' || attack.phase === 'strike');
  let activeImg = null;
  let activeData = null;

  if (isAttacking && playerAttackImg && playerAttackImg.complete) {
    activeImg = playerAttackImg;
    activeData = playerAttackData;
  } else if (playerSpriteImg && playerSpriteImg.complete) {
    activeImg = playerSpriteImg;
    activeData = playerSpriteData;
  }

  if (activeImg) {
    // Calculate animation frame
    playerAnimTimer++;
    const frameInterval = 60 / (activeData.fps || 12);
    if (playerAnimTimer >= frameInterval) {
      playerAnimTimer = 0;
      playerAnimFrame++;
      if (playerAnimFrame >= activeData.frames) {
        if (activeData.loop) {
          playerAnimFrame = 0;
        } else {
          playerAnimFrame = activeData.frames - 1; // stop at last frame
        }
      }
    }

    // Determine dimensions
    const frameWidth = activeImg.naturalWidth / activeData.frames;
    const frameHeight = activeImg.naturalHeight;
    
    // Calculate scale to fit player.w and player.h
    const scale = Math.max(player.w / frameWidth, player.h / frameHeight);
    const drawW = frameWidth * scale * 2; // Make sprite slightly larger than hitbox
    const drawH = frameHeight * scale * 2;

    // Draw frame
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      activeImg,
      playerAnimFrame * frameWidth, 0, frameWidth, frameHeight,
      -drawW / 2, -drawH / 2, drawW, drawH
    );
  } else {
    // Procedural rendering fallback
    ctx.fillStyle = playerColor;
    ctx.fillRect(-player.w / 2, -player.h / 2, player.w, player.h);

    // 🔹 "Face"
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(player.w / 2 - 12, -8, 8, 8);
    ctx.fillRect(player.w / 2 - 12, 4, 8, 8);

    // 🔹 Boost flames
    if (boostTimer > 0) {
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.moveTo(-player.w / 2, -player.h / 2 + 4);
      ctx.lineTo(-player.w / 2 - 25 - Math.random() * 15, 0);
      ctx.lineTo(-player.w / 2, player.h / 2 - 4);
      ctx.fill();
    }
  }

  ctx.restore();

  // Reset animation frame if state changes
  if (!isAttacking && window._lastAttacking) {
    playerAnimFrame = 0;
  }
  window._lastAttacking = isAttacking;

  // 🔹 Strike effect
  if (attack.phase === 'strike' && attack.frame < 12) {
    ctx.save();
    ctx.translate(cx, cy);
    const rad = 25 + attack.frame * 8;
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fillStyle = \`rgba(255, 255, 255, \${1 - attack.frame / 12})\`;
    ctx.fill();
    ctx.restore();
  }
}
`;
js = js.replace(/function drawPlayer\(\)\s*\{[\s\S]*?\/\/ 🔹 Strike effect[\s\S]*?\}\s*\n\}/, draw_player_replacement);

fs.writeFileSync('game.js', js, 'utf-8');
