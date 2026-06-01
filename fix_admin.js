const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf-8');

html = html.replace(/if \(catsBox\) \{\n\s*catsBox\.innerHTML = '';\n\s*if \(settings\.categories\) \{/m, 
`if (catsBox) {
    catsBox.innerHTML = '';
    if (!settings.categories) settings.categories = {};
    if (settings.categories) {`);

html = html.replace(/const c = settings\.categories\[id\] \|\| \{\};\n\s*const defaultName = id === 'game' \? 'GAME' : \(id === 'mod' \? 'MINECRAFT MOD' : '3D MODEL'\);/g,
`if (!settings.categories[id]) settings.categories[id] = {};
        const c = settings.categories[id];
        const defaultName = id === 'game' ? 'GAME' : (id === 'mod' ? 'MINECRAFT MOD' : '3D MODEL');`);

html = html.replace(/if \(!settings\.socials\) settings\.socials = \[\];\n\s*settings\.socials\.forEach\(\(s, idx\) => \{/g,
`if (!settings.socials) settings.socials = [];
    settings.socials.forEach((s, idx) => {
      if (!s) { s = {}; settings.socials[idx] = s; }`);

fs.writeFileSync('admin.html', html, 'utf-8');
console.log('Fixed admin.html');
