const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');

const oldScript = /function createParticle[\s\S]*?animateParticles\(\);/;

const newScript = `function createParticle(yStart) {
  return {
    x: Math.floor(Math.random() * W),
    y: yStart ?? Math.floor(H + 100),
    length: Math.floor(randBetween(6, 25)) * 6,
    speedY: randBetween(1.5, 5.0),
    phase: Math.random() * Math.PI * 2,
    opacity: randBetween(0.1, 0.6)
  };
}

for (let i = 0; i < 40; i++) {
  particles.push(createParticle(Math.random() * H));
}

function animateParticles() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach((p, i) => {
    p.y -= p.speedY;
    
    let currentY = p.y;
    let segCount = Math.floor(p.length / 6);
    for (let j=0; j<segCount; j++) {
      let alpha = p.opacity * (1 - j/segCount); // fade out tail
      ctx.fillStyle = \`rgba(255,255,255,\${alpha})\`;
      let waveX = Math.floor(Math.sin(currentY * 0.015 + p.phase) * 8);
      ctx.fillRect(Math.floor(p.x + waveX), Math.floor(currentY), 4, 4);
      currentY += 6;
    }
    
    if (p.y + p.length < 0) {
      particles[i] = createParticle();
    }
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();`;

html = html.replace(oldScript, newScript);
fs.writeFileSync('index.html', html, 'utf-8');
console.log('Wind effect updated.');
