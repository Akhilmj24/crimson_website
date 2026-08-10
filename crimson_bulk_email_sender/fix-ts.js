const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  content = content.replace(/export default ([a-zA-Z0-9_]+);\.(.+);?/g, 'export default $1.$2;');

  const exportBlockRegex = /export\s*\{([\s\S]+?)\};?/g;
  content = content.replace(exportBlockRegex, (match, inner) => {
    if (inner.includes(':')) {
      return inner.trim().split(/\n/).map(line => {
        let trimmed = line.trim();
        if (!trimmed) return '';
        if (trimmed.endsWith(',')) trimmed = trimmed.slice(0, -1);
        let colonIndex = trimmed.indexOf(':');
        if (colonIndex !== -1) {
          let key = trimmed.slice(0, colonIndex).trim();
          let value = trimmed.slice(colonIndex + 1).trim();
          return `export const ${key} = ${value};`;
        }
        return line;
      }).join('\n');
    }
    return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walkDir('./src');
processFile('./server.ts');
