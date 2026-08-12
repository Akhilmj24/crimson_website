const fs = require('fs');
let c = fs.readFileSync('src/index.css', 'utf8');
const responsiveRule = `
@media (max-width: 900px) {
  div[style*="display: grid"],
  form[style*="display: grid"] {
    grid-template-columns: 1fr !important;
  }
  .mode-select {
    grid-template-columns: 1fr !important;
  }
}
`;
if (!c.includes('@media (max-width: 900px)')) {
  fs.writeFileSync('src/index.css', c + '\n' + responsiveRule);
}
console.log('Global grid responsive fix applied');
