const fs = require('fs');
const path = require('path');

const chapterCssPath = path.join(__dirname, 'styles', 'chapter.css');

let content = fs.readFileSync(chapterCssPath, 'utf8');

content = content.replace(/'Mali',\s*cursive/g, "'Prompt', sans-serif");
content = content.replace(/'Nunito',\s*sans-serif/g, "'Prompt', sans-serif");
content = content.replace(/'Kaiti',\s*serif/g, "'Kaiti', 'STKaiti', 'KaiTi', serif");

fs.writeFileSync(chapterCssPath, content, 'utf8');

console.log('Fixed fonts in section css!');
