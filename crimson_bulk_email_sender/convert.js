const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Convert const x = require('y') to import x from 'y'
  content = content.replace(/const\s+([a-zA-Z0-9_]+)\s*=\s*require\(['"]([^'"]+)['"]\);?/g, "import $1 from '$2';");

  // Convert const { x, y } = require('z') to import { x, y } from 'z'
  content = content.replace(/const\s+(\{[^}]+\})\s*=\s*require\(['"]([^'"]+)['"]\);?/g, "import $1 from '$2';");

  // Convert module.exports = { x, y } to export { x, y }
  content = content.replace(/module\.exports\s*=\s*\{([^}]+)\};?/g, "export { $1 };");

  // Convert module.exports = x to export default x
  content = content.replace(/module\.exports\s*=\s*([a-zA-Z0-9_]+);?/g, "export default $1;");

  // Convert exports.x = y to export const x = y
  // careful not to match module.exports.x = y, although they are equivalent, we'll handle both
  content = content.replace(/(?:module\.)?exports\.([a-zA-Z0-9_]+)\s*=\s*(function|\([^)]*\)\s*=>)/g, "export const $1 = $2");
  content = content.replace(/(?:module\.)?exports\.([a-zA-Z0-9_]+)\s*=\s*([^;]+);?/g, (match, p1, p2) => {
    if (p2.trim().startsWith('function') || p2.trim().startsWith('async') || p2.includes('=>')) {
       return `export const ${p1} = ${p2};`;
    }
    return `export const ${p1} = ${p2};`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Converted', filePath);
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
