const fs = require('fs');

const data = JSON.parse(fs.readFileSync('works.json', 'utf8'));

data.forEach(work => {
  if (typeof work.featured === 'undefined') {
    work.featured = false;
  }
  if (!work.tags) {
    work.tags = [];
  }
});

fs.writeFileSync('works.json', JSON.stringify(data, null, 2));
console.log('works.json updated successfully');
