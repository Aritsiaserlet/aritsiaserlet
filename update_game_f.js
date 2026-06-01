const fs = require('fs');

let html = fs.readFileSync('game.html', 'utf-8');

// Ensure firework icon is loaded dynamically
const initOld = /window\.worksData = worksData;\s*window\.settingsData = settingsData;\s*initLobby\(\);/;
const initNew = `window.worksData = worksData;
    window.settingsData = settingsData;
    if (settingsData && settingsData.game) {
      if (settingsData.game.fwIconId && settingsData.icons) {
        const ic = settingsData.icons.find(x => x.id === settingsData.game.fwIconId);
        if (ic) {
          const fIconImg = document.querySelector('#fireworkDisplay img');
          if (fIconImg) fIconImg.src = ic.url;
        }
      }
    }
    initLobby();`;
html = html.replace(initOld, initNew);
fs.writeFileSync('game.html', html, 'utf-8');

let js = fs.readFileSync('game.js', 'utf-8');

// Replace floating point spawning on hit
js = js.replace(/if \(dist < hitRadius\) \{[\s\S]*?floatingTexts\.push\(\{ x: e\.x \+ e\.w\/2, y: e\.y, text: "\+" \+ pts, life: 60, maxLife: 60 \}\);[\s\S]*?e\.hit = true;/,
`if (dist < hitRadius) {
          const basePts = (window.settingsData && window.settingsData.game && window.settingsData.game.pointsPerHit !== undefined) ? window.settingsData.game.pointsPerHit : 15;
          const pts = basePts * multiplier;
          score += pts;
          updateHUD();
          const offsetY = floatingTexts.length * 20;
          floatingTexts.push({ x: 30, y: 70 + offsetY, text: "+" + pts, life: 60, maxLife: 60, color: '#f1c40f', isHud: true });
          e.hit = true;`);

// Replace Firework drop chance
js = js.replace(/if \(Math\.random\(\) < 0\.1\) \{/,
  `const fwChance = (window.settingsData && window.settingsData.game && window.settingsData.game.fwDropChance !== undefined) ? window.settingsData.game.fwDropChance / 100 : 0.1;
      if (Math.random() < fwChance) {`);

// Replace Miss penalty on click
js = js.replace(/if \(!hitAny\) \{[\s\S]*?const penalty = 5 \* \(boostStacks > 0 \? boostStacks \* 4 : 1\);[\s\S]*?score = Math\.max\(0, score - penalty\); updateHUD\(\);[\s\S]*?floatingTexts\.push\(\{ x: player\.x \+ player\.w\/2, y: player\.y, text: "-" \+ penalty, life: 40, maxLife: 40, color: '#e74c3c' \}\);[\s\S]*?if \(score === 0\) \{ gameOver\(\); return; \}/,
`if (!hitAny) {
      const basePen = (window.settingsData && window.settingsData.game && window.settingsData.game.missPenalty !== undefined) ? window.settingsData.game.missPenalty : 5;
      const penalty = basePen * (boostStacks > 0 ? boostStacks * 4 : 1);
      score = Math.max(0, score - penalty); updateHUD();
      const offsetY = floatingTexts.length * 20;
      floatingTexts.push({ x: 30, y: 70 + offsetY, text: "-" + penalty, life: 40, maxLife: 40, color: '#e74c3c', isHud: true });
      if (score === 0) { gameOver(); return; }`);

// Replace Miss penalty on passed enemy
js = js.replace(/const penalty = 5 \* \(boostStacks > 0 \? boostStacks \* 4 : 1\);[\s\S]*?score = Math\.max\(0, score - penalty\); updateHUD\(\);[\s\S]*?floatingTexts\.push\(\{ x: player\.x \+ player\.w\/2, y: player\.y, text: "-" \+ penalty, life: 40, maxLife: 40, color: '#e74c3c' \}\);[\s\S]*?if \(window\.gameAudio\) window\.gameAudio\.sfxMiss\(\);[\s\S]*?if \(score === 0\) \{ gameOver\(\); return; \}/,
`const basePen = (window.settingsData && window.settingsData.game && window.settingsData.game.missPenalty !== undefined) ? window.settingsData.game.missPenalty : 5;
      const penalty = basePen * (boostStacks > 0 ? boostStacks * 4 : 1);
      score = Math.max(0, score - penalty); updateHUD();
      const offsetY = floatingTexts.length * 20;
      floatingTexts.push({ x: 30, y: 70 + offsetY, text: "-" + penalty, life: 40, maxLife: 40, color: '#e74c3c', isHud: true });
      if (window.gameAudio) window.gameAudio.sfxMiss();
      if (score === 0) { gameOver(); return; }`);

// Fix floatingTexts rendering logic to handle isHud coordinate system
js = js.replace(/ctx\.strokeText\(ft\.text, ft\.x, ft\.y\);\s*ctx\.fillText\(ft\.text, ft\.x, ft\.y\);/,
`if (ft.isHud) {
      // Draw in screen space relative to scale
      ctx.strokeText(ft.text, ft.x * getGraphicsScale(), ft.y * getGraphicsScale());
      ctx.fillText(ft.text, ft.x * getGraphicsScale(), ft.y * getGraphicsScale());
    } else {
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
    }`);

fs.writeFileSync('game.js', js, 'utf-8');
console.log('game.js updated');
