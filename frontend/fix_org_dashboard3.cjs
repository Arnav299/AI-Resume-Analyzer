const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'OrgDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Regex to match a JSX tag opening that contains multiple className attributes
// This matches: className="class1" ... className="class2"
// or: className="class1" \n className="class2"
// We need to carefully merge them.

// First, fix the literal duplicates that my script generated where it's exactly:
// className="..." className="..."
// on the same line or separated by whitespace.

// Let's just fix the specific lines by replacing the known patterns.

content = content.replace(/className="text-xs mt-0\.5"\s+className="text-content-muted"/g, 'className="text-xs mt-0.5 text-content-muted"');
content = content.replace(/className="text-xs"\s+className="text-content-muted"/g, 'className="text-xs text-content-muted"');
content = content.replace(/className="text-center py-12"\s+className="text-content-muted"/g, 'className="text-center py-12 text-content-muted"');

// Fix the multi-line ones:
// Find instances of `className="SOME_CLASSES"` followed by whitespace/newlines and then `className="MORE_CLASSES"`
content = content.replace(/className="([^"]+)"([\s\n]+)className="([^"]+)"/g, (match, class1, space, class2) => {
  return `className="${class1} ${class2}"`;
});

// Wait, some are dynamic like `className={\`...\`}`
// Let's handle them as well.
content = content.replace(/className="([^"]+)"([\s\n]+)className=\{([^}]+)\}/g, (match, class1, space, dynamicClass) => {
  // e.g. className="text-sm font-medium" className={`${step === i + 1 ? 'text-content' : 'text-content-muted'}`}
  // We can merge them into: className={`text-sm font-medium ${...}`}
  let inner = dynamicClass.trim();
  if (inner.startsWith('`') && inner.endsWith('`')) {
    inner = inner.slice(1, -1);
    return `className={\`${class1} ${inner}\`}`;
  }
  return match; // If we can't easily merge, leave it for manual
});

content = content.replace(/className="([^"]+)"([\s\n]+)className=\{([^}]+)\}/g, (match, class1, space, dynamicClass) => {
  return match;
});

// Wait, let's look at line 173:
// It was: <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
// style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}>
// My script replaced the style with className="bg-surface-hover text-content-secondary border border-border-default".
// So it became:
// className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
// className="bg-surface-hover text-content-secondary border border-border-default"

// Let's do a loop to catch all double classNames on the same tag.
// Since React attributes are separated by whitespace, and `<` `>` bounds the tag:
let changed = false;
do {
  changed = false;
  content = content.replace(/<([a-zA-Z0-9_.-]+)([^>]*?)className="([^"]*)"([^>]*?)className="([^"]*)"([^>]*?)>/g, (match, tag, before1, class1, between, class2, after) => {
    changed = true;
    return `<${tag}${before1}${between}className="${class1} ${class2}"${after}>`;
  });
} while (changed);

do {
  changed = false;
  content = content.replace(/<([a-zA-Z0-9_.-]+)([^>]*?)className="([^"]*)"([^>]*?)className=\{`([^`]*)`\}([^>]*?)>/g, (match, tag, before1, class1, between, class2, after) => {
    changed = true;
    return `<${tag}${before1}${between}className={\`${class1} ${class2}\`}${after}>`;
  });
} while (changed);

do {
  changed = false;
  content = content.replace(/<([a-zA-Z0-9_.-]+)([^>]*?)className=\{`([^`]*)`\}([^>]*?)className="([^"]*)"([^>]*?)>/g, (match, tag, before1, class1, between, class2, after) => {
    changed = true;
    return `<${tag}${before1}${between}className={\`${class1} ${class2}\`}${after}>`;
  });
} while (changed);


fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed duplicate classNames');
