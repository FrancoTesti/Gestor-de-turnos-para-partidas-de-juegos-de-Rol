const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/personajes/personajes.css', 'utf8');
code = code.replace(/\.form-grid-2\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*1fr\s*1fr;\s*gap:\s*1rem;\s*\}/, '.form-grid-2 {\n  display: grid;\n  gap: 1rem;\n}');
fs.writeFileSync('frontend/src/components/personajes/personajes.css', code);
