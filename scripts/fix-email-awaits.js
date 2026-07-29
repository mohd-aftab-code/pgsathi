const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('app/api');

let filesChanged = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Regex to find send<Something>Email(..).catch without await
  // We use negative lookbehind to ensure there's no await before it.
  const regex = /(?<!await\s+)(send[A-Za-z0-9_]*Email\([\s\S]*?\)\.catch)/g;
  
  if (regex.test(content)) {
    console.log(`Fixing ${file}`);
    content = content.replace(regex, 'await $1');
    fs.writeFileSync(file, content, 'utf8');
    filesChanged++;
  }
});

console.log(`Total files changed: ${filesChanged}`);
