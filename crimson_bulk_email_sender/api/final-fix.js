const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  content = content.replace(/query\s*=\s*\{\}/g, 'query: any = {}');
  content = content.replace(/data\s*=\s*\{\}/g, 'data: any = {}');
  content = content.replace(/filter\s*=\s*\{\}/g, 'filter: any = {}');
  content = content.replace(/import\s*\{\s*isDBConnected\s*\}\s*from\s*['"]\.\.\/config\/db['"];?/g, "import db from '../config/db';\nconst { isDBConnected } = db;");

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
