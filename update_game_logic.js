const fs = require('fs');
let js = fs.readFileSync('game.js', 'utf-8');

// 1. Add floating text array
js = js.replace(/let speedLines  = \[\];/, 'let speedLines  = [];\nlet floatingTexts = [];');

// 2. Replace multiplier logic with boostStacks
js = js.replace(/let multiplier   = 1;/, 'let boostStacks = 0;\nlet multiplier = 1;');

// resetGame
js = js.replace(/score        = 0; fireworks    = 0; multiplier   = 1; maxMultiplier = 1;/, 'score = 0; fireworks = 0; multiplier = 1; maxMultiplier = 1; boostStacks = 0;');

// Boost activation logic (touch & keyboard)
js = js.replace(/fireworks--; boostTimer \+= 180; multiplier = Math\.min\(multiplier \+ 1, 8\); maxMultiplier = Math\.max\(maxMultiplier, multiplier\); updateHUD\(\);/g, 
  `fireworks--; boostTimer += 180; boostStacks = Math.min(boostStacks + 1, 64); multiplier = boostStacks > 0 ? boostStacks * 2 : 1; maxMultiplier = Math.max(maxMultiplier, boostStacks); updateHUD();`);

// HUD update for multiplier
js = js.replace(/if \(multiplier > 1\) \{ mulEl\.textContent = `x\$\{multiplier\} BOOST!`; mulEl\.style\.display = 'block'; \}/,
  `if (boostStacks > 0) { mulEl.textContent = \`x\${multiplier} SCORE!\`; mulEl.style.display = 'block'; }`);

// 3. Attack Hit / Miss Logic
js = js.replace(/if \(dist < hitRadius\) \{[\s\S]*?score \+= 15; updateHUD\(\);[\s\S]*?e\.hit = true;/,
  `if (dist < hitRadius) {
          const pts = 15 * multiplier;
          score += pts;
          updateHUD();
          floatingTexts.push({ x: e.x + e.w/2, y: e.y, text: "+" + pts, life: 60, maxLife: 60 });
          e.hit = true;`);

// Miss penalty (hitting nothing)
js = js.replace(/if \(!hitAny\) \{/, 
  `if (!hitAny) {
      const penalty = 5 * (boostStacks > 0 ? boostStacks * 4 : 1);
      score = Math.max(0, score - penalty); updateHUD();
      floatingTexts.push({ x: player.x + player.w/2, y: player.y, text: "-" + penalty, life: 40, maxLife: 40, color: '#e74c3c' });
      if (score === 0) { gameOver(); return; }`);

// Miss penalty (enemy passing player)
js = js.replace(/if \(boostTimer <= 0\) \{\s*score = Math\.max\(0, score - 5\); updateHUD\(\);\s*if \(window\.gameAudio\) window\.gameAudio\.sfxMiss\(\);\s*if \(score === 0\) \{ gameOver\(\); return; \}\s*\}/,
  `const penalty = 5 * (boostStacks > 0 ? boostStacks * 4 : 1);
      score = Math.max(0, score - penalty); updateHUD();
      floatingTexts.push({ x: player.x + player.w/2, y: player.y, text: "-" + penalty, life: 40, maxLife: 40, color: '#e74c3c' });
      if (window.gameAudio) window.gameAudio.sfxMiss();
      if (score === 0) { gameOver(); return; }`);

// 4. Boost Speed
js = js.replace(/currentSpeed = baseSpeed \+ \(multiplier \* 3\);/,
  `currentSpeed = baseSpeed + (boostStacks * 15);`);

js = js.replace(/if \(boostTimer <= 0\) \{ multiplier = 1; currentSpeed = baseSpeed; updateHUD\(\); \}/,
  `if (boostTimer <= 0) { boostStacks = 0; multiplier = 1; currentSpeed = baseSpeed; updateHUD(); }`);

// 5. Draw Floating Texts
js = js.replace(/function updateBirds\(\) \{/, 
  `function updateAndDrawFloatingTexts() {
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.life--;
    ft.y -= 1; // float up
    if (ft.life <= 0) { floatingTexts.splice(i, 1); continue; }
    
    ctx.save();
    ctx.globalAlpha = ft.life / ft.maxLife;
    ctx.font = \`\${Math.floor(16 * getGraphicsScale())}px 'Press Start 2P', cursive\`;
    ctx.fillStyle = ft.color || '#f1c40f';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText(ft.text, ft.x, ft.y);
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }
}

function updateBirds() {`);

js = js.replace(/drawSpeedLines\(\);/, `drawSpeedLines();\n  updateAndDrawFloatingTexts();`);

// 6. Particle emission to the left
js = js.replace(/const a = Math\.random\(\) \* Math\.PI \* 2;/,
  `// Shoot backwards (left)
        const baseAngle = Math.PI; // 180 degrees (left)
        const spread = Math.PI / 3; // 60 degree spread
        const a = baseAngle + (Math.random() - 0.5) * spread;`);

// 7. Remove invincibility. It was NOT explicitly invincible in the passing enemy logic except `if (boostTimer <= 0)`.
// I just replaced the passing enemy logic so it ALWAYS penalizes. So invincibility is removed!

fs.writeFileSync('game.js', js, 'utf-8');
console.log('game.js updated');
