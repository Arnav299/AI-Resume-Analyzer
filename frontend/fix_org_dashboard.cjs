const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'OrgDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replacement mappings
const replacements = [
  // 1. Step Indicator
  {
    regex: /style=\{\{\s*background: step > i \+ 1 \? '#10B981' : step === i \+ 1 \? 'linear-gradient\(135deg, #6C63FF, #00D4FF\)' : 'rgba\(255,255,255,0\.1\)',\s*color: 'white',\s*\}\}/g,
    replace: `className={\`\${step > i + 1 ? 'bg-emerald-500 text-white' : step === i + 1 ? 'bg-gradient-to-br from-primary to-accent text-white' : 'bg-surface-hover text-content-muted border border-border-default'}\`}`
  },
  {
    regex: /className=\{step === i \+ 1 \? 'text-content' : 'text-content-muted'\}/g,
    replace: `className={\`\${step === i + 1 ? 'text-content' : 'text-content-muted'}\`}`
  },
  {
    regex: /className="flex-1 h-px" className="bg-surface-hover"/g,
    replace: `className="flex-1 h-px bg-surface-hover"`
  },
  // 2. Borders and Backgrounds mapping to standard classes
  {
    regex: /style=\{\{\s*background: 'rgba\(255,255,255,0\.04\)',\s*border: '1px solid rgba\(255,255,255,0\.09\)'\s*\}\}/g,
    replace: `className="bg-surface border border-border-default shadow-sm"`
  },
  {
    regex: /style=\{\{\s*background: 'rgba\(255,255,255,0\.05\)',\s*border: '1px solid rgba\(255,255,255,0\.1\)'\s*\}\}/g,
    replace: `className="bg-surface border border-border-default shadow-sm"`
  },
  {
    regex: /style=\{\{\s*background: 'rgba\(255,255,255,0\.07\)',\s*border: '1px solid rgba\(255,255,255,0\.12\)'\s*\}\}/g,
    replace: `className="bg-surface border border-border-default shadow-sm"`
  },
  {
    regex: /style=\{\{\s*background: 'rgba\(255,255,255,0\.04\)',\s*border: '1px solid rgba\(255,255,255,0\.08\)'\s*\}\}/g,
    replace: `className="bg-surface border border-border-default shadow-sm"`
  },
  {
    regex: /style=\{\{\s*background: 'rgba\(255,255,255,0\.08\)',\s*border: '1px solid rgba\(255,255,255,0\.15\)'\s*\}\}/g,
    replace: `className="bg-surface border border-border-default shadow-sm"`
  },
  // Table row bottom borders
  {
    regex: /style=\{\{\s*borderBottom: idx < filteredResults\.length - 1 \? '1px solid rgba\(255,255,255,0\.05\)' : 'none'\s*\}\}/g,
    replace: `style={{ borderBottom: idx < filteredResults.length - 1 ? '1px solid var(--theme-border-default)' : 'none' }}`
  },
  {
    regex: /style=\{\{\s*borderBottom: '1px solid rgba\(255,255,255,0\.07\)',\s*background: 'rgba\(255,255,255,0\.03\)'\s*\}\}/g,
    replace: `className="border-b border-border-default bg-surface-hover"`
  },
  // Progress bar backgrounds
  {
    regex: /style=\{\{\s*background: 'rgba\(255,255,255,0\.1\)'\s*\}\}/g,
    replace: `className="bg-surface-hover border border-border-default"`
  },
  {
    regex: /style=\{\{\s*background: 'rgba\(255,255,255,0\.08\)'\s*\}\}/g,
    replace: `className="bg-surface-hover border border-border-default"`
  },
  // Text colors
  {
    regex: /style=\{\{\s*color: 'rgba\(255,255,255,0\.[345]\)'\s*\}\}/g,
    replace: `className="text-content-muted"`
  },
  {
    regex: /style=\{\{\s*color: 'rgba\(255,255,255,0\.45\)'\s*\}\}/g,
    replace: `className="text-content-muted"`
  },
  {
    regex: /style=\{\{\s*color: 'rgba\(255,255,255,0\.25\)'\s*\}\}/g,
    replace: `className="text-content-muted"`
  },
  {
    regex: /style=\{\{\s*color: 'rgba\(255,255,255,0\.7\)'\s*\}\}/g,
    replace: `className="text-content-secondary"`
  },
  // Drag drop styles
  {
    regex: /border: over \? '2px dashed #3B82F6' : '2px dashed rgba\(255,255,255,0\.12\)'/g,
    replace: `border: over ? '2px dashed #3B82F6' : '2px dashed var(--theme-border-default)'`
  },
  {
    regex: /background: over \? 'rgba\(59,130,246,0\.1\)' : 'rgba\(255,255,255,0\.02\)'/g,
    replace: `background: over ? 'rgba(59,130,246,0.1)' : 'var(--theme-surface)'`
  },
  // Dynamic Bucket Buttons
  {
    regex: /style=\{\{\s*background: bucketFilter === b\.key \? b\.bg : 'rgba\(255,255,255,0\.04\)',\s*color: bucketFilter === b\.key \? b\.color : 'rgba\(255,255,255,0\.5\)',\s*border: `1px solid \$\{bucketFilter === b\.key \? b\.border : 'rgba\(255,255,255,0\.08\)'\}`\s*\}\}/g,
    replace: "style={{ background: bucketFilter === b.key ? b.bg : 'var(--theme-surface)', color: bucketFilter === b.key ? b.color : 'var(--theme-text-muted)', border: `1px solid ${bucketFilter === b.key ? b.border : 'var(--theme-border-default)'}` }}"
  },
  // Inline buttons
  {
    regex: /style=\{\{\s*background: r\.bucket === 'successful' \? 'rgba\(16,185,129,0\.25\)' : 'rgba\(255,255,255,0\.05\)',\s*border: '1px solid rgba\(16,185,129,0\.3\)'\s*\}\}/g,
    replace: "className={`border shadow-sm ${r.bucket === 'successful' ? 'bg-success/20 border-success/30' : 'bg-surface border-border-default hover:bg-surface-hover'}`}"
  },
  {
    regex: /style=\{\{\s*background: r\.bucket === 'not_successful' \? 'rgba\(239,68,68,0\.2\)' : 'rgba\(255,255,255,0\.05\)',\s*border: '1px solid rgba\(239,68,68,0\.3\)'\s*\}\}/g,
    replace: "className={`border shadow-sm ${r.bucket === 'not_successful' ? 'bg-error/20 border-error/30' : 'bg-surface border-border-default hover:bg-surface-hover'}`}"
  },
  // Other dynamic
  {
    regex: /style=\{\{\s*background: 'rgba\(255,255,255,0\.07\)',\s*color: 'rgba\(255,255,255,0\.7\)',\s*border: '1px solid rgba\(255,255,255,0\.12\)'\s*\}\}/g,
    replace: `className="bg-surface-hover text-content border border-border-default"`
  }
];

let newContent = content;

replacements.forEach(r => {
  newContent = newContent.replace(r.regex, r.replace);
});

// Fix some specific className collisions created by replacements
newContent = newContent.replace(/className="text-xs mt-1" className="text-content-muted"/g, 'className="text-xs mt-1 text-content-muted"');
newContent = newContent.replace(/className="text-sm mt-1" className="text-content-muted"/g, 'className="text-sm mt-1 text-content-muted"');
newContent = newContent.replace(/className="text-xs" className="text-content-muted"/g, 'className="text-xs text-content-muted"');
newContent = newContent.replace(/className="text-xs font-bold uppercase tracking-wider" className="text-content-muted"/g, 'className="text-xs font-bold uppercase tracking-wider text-content-muted"');
newContent = newContent.replace(/className="text-xs font-bold uppercase tracking-widest mb-3" className="text-content-muted"/g, 'className="text-xs font-bold uppercase tracking-widest mb-3 text-content-muted"');
newContent = newContent.replace(/<p className="mt-1" className="text-content-muted">/g, '<p className="mt-1 text-content-muted">');

// We have <th> with: className="..." style={{ color: 'rgba...' }} 
newContent = newContent.replace(/className="text-xs font-bold uppercase tracking-wider pb-3"\s*className="text-content-muted"/g, 'className="text-xs font-bold uppercase tracking-wider pb-3 text-content-muted"');

// Fix the container backgrounds where we appended className="bg-surface...":
newContent = newContent.replace(/className="rounded-2xl p-7 space-y-6"\s*className="bg-surface border border-border-default shadow-sm"/g, 'className="rounded-2xl p-7 space-y-6 bg-surface border border-border-default shadow-sm"');
newContent = newContent.replace(/className="rounded-2xl p-4"\s*className="bg-surface border border-border-default shadow-sm"/g, 'className="rounded-2xl p-4 bg-surface border border-border-default shadow-sm"');
newContent = newContent.replace(/className="rounded-2xl p-6 mb-6"\s*className="bg-surface border border-border-default shadow-sm"/g, 'className="rounded-2xl p-6 mb-6 bg-surface border border-border-default shadow-sm"');
newContent = newContent.replace(/className="mt-8 rounded-2xl p-8 text-center"\s*className="bg-surface border border-border-default shadow-sm"/g, 'className="mt-8 rounded-2xl p-8 text-center bg-surface border border-border-default shadow-sm"');
newContent = newContent.replace(/className="h-3 rounded-full overflow-hidden"\s*className="bg-surface-hover border border-border-default"/g, 'className="h-3 rounded-full overflow-hidden bg-surface-hover border border-border-default"');
newContent = newContent.replace(/className="h-1\.5 rounded-full overflow-hidden"\s*className="bg-surface-hover border border-border-default"/g, 'className="h-1.5 rounded-full overflow-hidden bg-surface-hover border border-border-default"');
newContent = newContent.replace(/className="flex-1 h-2 rounded-full overflow-hidden"\s*className="bg-surface-hover border border-border-default"/g, 'className="flex-1 h-2 rounded-full overflow-hidden bg-surface-hover border border-border-default"');
newContent = newContent.replace(/className="w-16 h-1\.5 rounded-full overflow-hidden"\s*className="bg-surface-hover border border-border-default"/g, 'className="w-16 h-1.5 rounded-full overflow-hidden bg-surface-hover border border-border-default"');

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Fixed OrgDashboard inline styles');
