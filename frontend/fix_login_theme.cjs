const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'LoginPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace main background
content = content.replace(/style={{ background: 'linear-gradient\(135deg, #0A0E1A 0%, #130D2E 50%, #0A1A2E 100%\)' }}/g, "style={{ background: 'var(--theme-hero-gradient)' }}");

// Replace text-white outside of buttons/logos
content = content.replace(/text-3xl font-extrabold text-white/g, 'text-3xl font-extrabold text-content');

// Card styling
content = content.replace(/style={{\s*background: 'rgba\(255,255,255,0\.05\)',\s*backdropFilter: 'blur\(16px\)',\s*border: '1px solid rgba\(255,255,255,0\.1\)'\s*}}/g, "style={{ background: 'var(--theme-glass-bg)', backdropFilter: 'blur(16px)', border: '1px solid var(--theme-glass-border)' }}");

// Text colors
content = content.replace(/'rgba\(255,255,255,0\.6\)'/g, "'var(--theme-text-secondary)'");
content = content.replace(/'rgba\(255,255,255,0\.5\)'/g, "'var(--theme-text-secondary)'");

// Quick Fill buttons
content = content.replace(/bg-surface\/10 hover:bg-surface\/20 border border-white\/20 rounded-xl text-xs font-medium text-white/g, 'bg-page hover:bg-surface-hover border border-border-default rounded-xl text-xs font-medium text-content');

// Inputs
content = content.replace(/bg-surface\/5 border-white\/10 text-white/g, 'bg-page border-border-default text-content');

// Border dividers
content = content.replace(/border-white\/10/g, 'border-border-default');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Replacements complete for LoginPage.jsx');
