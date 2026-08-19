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
  'ResumeBuilderUserManualPage.jsx',
  'StudentDashboard.jsx'
];

const dir = path.join(__dirname, 'src', 'pages');

const homeButton = `
            <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-content-secondary hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 rounded-xl transition-all" title="Home">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Home
            </Link>`;

filesToPatch.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} - not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // We need to ensure `Link` is imported from `react-router-dom`
  if (!content.includes("import { Link") && !content.includes("import {Link") && !content.includes("import { Link,") && !content.includes(", Link } from 'react-router-dom'")) {
    if (content.includes("from 'react-router-dom'")) {
      content = content.replace(/import \{(.*?)\} from 'react-router-dom'/g, (match, p1) => {
        if (!p1.includes('Link')) return `import { ${p1.trim()}, Link } from 'react-router-dom'`;
        return match;
      });
    } else {
      const importMatch = content.match(/^import .*?;?\n/gm);
      if (importMatch) {
        const lastImport = importMatch[importMatch.length - 1];
        content = content.replace(lastImport, lastImport + "import { Link } from 'react-router-dom';\n");
      }
    }
  }

  // Inject Home button right after ThemeToggle
  if (content.includes("<ThemeToggle />") && !content.includes('title="Home"')) {
    content = content.replace("<ThemeToggle />", "<ThemeToggle />" + homeButton);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Patched ${file}`);
  } else {
    console.log(`Skipped ${file} - ThemeToggle not found or Home already exists`);
  }
});
