const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'OrgDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Second pass replacements
const replacements = [
  {
    regex: /style=\{\{\s*background: 'rgba\(255,255,255,0\.04\)',\s*border: '1px solid rgba\(255,255,255,0\.07\)'\s*\}\}/g,
    replace: `className="bg-surface border border-border-default shadow-sm"`
  },
  {
    regex: /background: bucketFilter === b\.key \? b\.bg : 'rgba\(255,255,255,0\.04\)',/g,
    replace: `background: bucketFilter === b.key ? b.bg : 'var(--theme-surface)',`
  },
  {
    regex: /color: bucketFilter === b\.key \? b\.color : 'rgba\(255,255,255,0\.5\)',/g,
    replace: `color: bucketFilter === b.key ? b.color : 'var(--theme-text-muted)',`
  },
  {
    regex: /border: `1px solid \$\{bucketFilter === b\.key \? b\.border : 'rgba\\(255,255,255,0\.08\\)'\}`/g,
    replace: "border: `1px solid ${bucketFilter === b.key ? b.border : 'var(--theme-border-default)'}`"
  },
  {
    regex: /style=\{\{\s*background: 'rgba\(255,255,255,0\.05\)',\s*border: '1px solid rgba\(255,255,255,0\.09\)'\s*\}\}/g,
    replace: `className="bg-surface border border-border-default shadow-sm"`
  },
  {
    regex: /style=\{\{\s*color: 'rgba\(255,255,255,0\.35\)'\s*\}\}/g,
    replace: `className="text-content-muted"`
  }
];

let newContent = content;

replacements.forEach(r => {
  newContent = newContent.replace(r.regex, r.replace);
});

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Fixed remaining inline styles');
