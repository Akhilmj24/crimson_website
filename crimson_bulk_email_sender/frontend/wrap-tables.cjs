const fs = require('fs');
const path = require('path');
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let c = fs.readFileSync(fullPath, 'utf8');
      if (c.includes('<table')) {
        const lines = c.split('\n');
        let modified = false;
        let insideTable = false;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('<table') && !lines[i].includes('overflow-x-auto')) {
            lines[i] = lines[i].replace('<table', '<div className="overflow-x-auto w-full max-w-full custom-scrollbar"><table');
            modified = true;
            insideTable = true;
          }
          if (lines[i].includes('</table') && insideTable) {
            lines[i] = lines[i].replace('</table>', '</table></div>');
            insideTable = false; // in case of multiple tables
          }
        }
        if (modified) {
          fs.writeFileSync(fullPath, lines.join('\n'));
          console.log('Wrapped tables in', fullPath);
        }
      }
    }
  }
}
walkDir('./src');
