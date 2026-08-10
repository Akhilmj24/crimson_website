const fs = require('fs');
const path = require('path');
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let c = fs.readFileSync(fullPath, 'utf8');
      if (c.includes('new: true')) {
        c = c.replace(/new:\s*true/g, "returnDocument: 'after'");
        fs.writeFileSync(fullPath, c);
      }
    }
  }
}
walkDir('./src');
console.log('Fixed deprecation warnings');
