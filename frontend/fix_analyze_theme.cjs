const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'AnalyzePage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace dark-page
content = content.replace(/className="dark-page /g, 'className="');

// Replace text-white outside of buttons/logos
// Let's do this carefully
content = content.replace(/text-white/g, 'text-content');
// Fix the logo one
content = content.replace(/font-black text-content text-lg/g, 'font-black text-white text-lg');

// Replace specific styles
content = content.replace(/'rgba\(255,255,255,0\.02\)'/g, "'var(--theme-surface-hover)'");
content = content.replace(/'rgba\(255,255,255,0\.04\)'/g, "'var(--theme-surface-hover)'");
content = content.replace(/'rgba\(255,255,255,0\.05\)'/g, "'var(--theme-surface-hover)'");
content = content.replace(/'rgba\(255,255,255,0\.06\)'/g, "'var(--theme-border-subtle)'");
content = content.replace(/'rgba\(255,255,255,0\.07\)'/g, "'var(--theme-border-subtle)'");
content = content.replace(/'rgba\(255,255,255,0\.08\)'/g, "'var(--theme-border-default)'");
content = content.replace(/'rgba\(255,255,255,0\.1\)'/g, "'var(--theme-border-default)'");
content = content.replace(/'rgba\(255,255,255,0\.15\)'/g, "'var(--theme-border-default)'");

content = content.replace(/'rgba\(255,255,255,0\.3\)'/g, "'var(--theme-text-muted)'");
content = content.replace(/'rgba\(255,255,255,0\.4\)'/g, "'var(--theme-text-muted)'");
content = content.replace(/'rgba\(255,255,255,0\.5\)'/g, "'var(--theme-text-secondary)'");
content = content.replace(/'rgba\(255,255,255,0\.6\)'/g, "'var(--theme-text-secondary)'");
content = content.replace(/'rgba\(255,255,255,0\.7\)'/g, "'var(--theme-text-secondary)'");

// Replace custom classes that are dark mode specific
content = content.replace(/dark-glass-strong/g, 'bg-surface border border-border-subtle rounded-3xl');
content = content.replace(/input-dark/g, 'bg-page border border-border-default text-content rounded-xl px-4 py-2 w-full focus:border-primary outline-none transition-colors');
content = content.replace(/label-dark/g, 'block text-sm font-semibold text-content');
content = content.replace(/badge-dark/g, 'inline-flex px-3 py-1 rounded-full text-xs font-semibold');
content = content.replace(/skill-dark-matched/g, 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20');
content = content.replace(/skill-dark-missing/g, 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20');
content = content.replace(/btn-neon/g, 'btn-primary');

// Background blob adjustments for light mode (optional, but setting opacity lower for text-content helps)
content = content.replace(/'rgba\(0,0,0,0\.7\)'/g, "'rgba(0,0,0,0.5)'"); // backdrop

fs.writeFileSync(filePath, content, 'utf8');
console.log('Replacements complete.');
