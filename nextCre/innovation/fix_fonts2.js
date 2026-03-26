const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'styles', 'chapter.css');
let txt = fs.readFileSync(p, 'utf8');
txt = txt.replace(/'Kaiti',\s*'STKaiti',\s*'KaiTi',\s*serif/g, "'KaiTi', '楷体', 'STKaiti', 'Prompt', serif");
fs.writeFileSync(p, txt, 'utf8');
console.log('Done chap');
