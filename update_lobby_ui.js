const fs = require('fs');
let html = fs.readFileSync('game.html', 'utf-8');

// 1. Title
html = html.replace(/<h1>ARITSIA WITH MACE<\/h1>/, `<h1 style="line-height:1.2; font-size:clamp(32px, 5vw, 56px);">ARITSIA<br><span style="font-size:0.6em; color:var(--dark);">With Elytra Mace</span></h1>`);

// 2. Avatar
html = html.replace(/border-radius:50%;/g, `border-radius:4px;`);

// 3. Emojis in hints
html = html.replace(/Touch: Left Half = Boost[^\w]+Right Half = Dive/g, `Touch: Left Half = Boost | Right Half = Dive`);
html = html.replace(/🔙 BACK TO PORTFOLIO/g, `BACK TO PORTFOLIO`);
html = html.replace(/🏆 TOP 10 PLAYERS/g, `TOP 10 PLAYERS`);

// 4. Boxed Stats
const oldStatRowCSS = /\.lobby-stat-row\s*\{\s*display:\s*flex;\s*justify-content:\s*space-between;\s*margin-bottom:\s*8px;\s*border-bottom:\s*1px dashed\s*var\(--dark\);\s*padding-bottom:\s*4px;\s*\}/;
const newStatRowCSS = `.lobby-stat-row {
    display: flex; justify-content: space-between; margin-bottom: 8px; border: 3px solid var(--dark); padding: 8px 12px; background: var(--sky1); color: var(--dark);
  }`;
html = html.replace(oldStatRowCSS, newStatRowCSS);

// Also remove the inline style `border-bottom:none;` on the last stat row
html = html.replace(/<div class="lobby-stat-row" style="border-bottom:none;"><span>Play Time:<\/span><span id="statTime">0m<\/span><\/div>/, `<div class="lobby-stat-row"><span>Play Time:</span><span id="statTime">0m</span></div>`);

fs.writeFileSync('game.html', html, 'utf-8');
console.log('Lobby UI updated.');
