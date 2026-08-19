const fs = require('fs');
const path = require('path');

const filesToPatch = [
  'RecruiterDashboard.jsx',
  'OrgDashboard.jsx',
  'ExecutiveDashboard.jsx',
  'KanbanBoard.jsx',
  'JDStudio.jsx',
  'CandidateDossier.jsx',
  'UploadWizardPage.jsx',
  'UserManualPage.jsx',
  'AboutProductPage.jsx',
  'ResumeBuilderAboutPage.jsx',
  'ResumeBuilderUserManualPage.jsx'
];

const dir = path.join(__dirname, 'src', 'pages');

filesToPatch.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} - not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Add import
  if (!content.includes("import ThemeToggle")) {
    const importMatch = content.match(/^import .*?;?\n/gm);
    if (importMatch) {
      const lastImport = importMatch[importMatch.length - 1];
      content = content.replace(lastImport, lastImport + "import ThemeToggle from '../components/ThemeToggle';\n");
    } else {
      content = "import ThemeToggle from '../components/ThemeToggle';\n" + content;
    }
  }

  // 2. Add ThemeToggle inside the right side of the header
  // Find <header ...> ... <div className="flex items-center gap-...">
  const headerRegex = /(<header[^>]*>[\s\S]*?<div className="flex items-center gap-\d+">)/;
  
  if (headerRegex.test(content) && !content.includes("<ThemeToggle />")) {
    content = content.replace(headerRegex, `$1\n            <ThemeToggle />`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Patched ${file}`);
  } else {
    // Maybe the right side div has different classes
    // Fallback: Just put it before the closing </header> if not found, but it might mess up layout.
    // Let's try to find a `<div className="flex` that is a direct child of header and is the 2nd one.
    const headerParts = content.split('<header');
    if(headerParts.length > 1 && !content.includes("<ThemeToggle />")) {
      const insideHeader = headerParts[1].split('</header>')[0];
      // Find the last `<div className="flex items-center gap-` in the header
      const lastDiv = insideHeader.lastIndexOf('<div className="flex items-center gap-');
      if (lastDiv !== -1) {
        // we can inject
        const exactMatchStr = insideHeader.substring(lastDiv, insideHeader.indexOf('>', lastDiv) + 1);
        content = content.replace(exactMatchStr, exactMatchStr + '\n            <ThemeToggle />');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Patched ${file} (fallback)`);
      } else {
        console.log(`Could not find insertion point in ${file}`);
      }
    } else {
      console.log(`Skipped ${file} (no header or already has ThemeToggle)`);
    }
  }
});
