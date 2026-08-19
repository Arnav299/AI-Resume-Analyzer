const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'Navbar.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix Analyze Resume (Desktop & Mobile)
content = content.replace(/style={{ background: 'linear-gradient\(135deg, rgba\(108,99,255,0\.1\), rgba\(0,212,255,0\.08\)\)', color: '#6C63FF', border: '1px solid rgba\(108,99,255,0\.2\)' }}/g,
  "style={{ background: 'linear-gradient(135deg, #60A5FA, #3B82F6)', color: 'white', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}");
  
// Mobile might have different text for Analyze Resume (Free), let's ensure it's matched
content = content.replace(/🤖 Analyze Resume \(Free\)/g, "🤖 Analyze Resume (Free)"); // just in case

// Fix Get Full Access (Desktop & Mobile)
content = content.replace(/style={{ background: 'linear-gradient\(135deg, #6C63FF, #00D4FF\)', color: 'white', boxShadow: '0 4px 12px rgba\(108,99,255,0\.2\)' }}/g,
  "style={{ background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)', color: 'white', boxShadow: '0 4px 12px rgba(14,165,233,0.3)' }}");

// Fix Create Account (Desktop & Mobile)
content = content.replace(/style={{ background: 'linear-gradient\(135deg, #6C63FF, #5A52E0\)', color: 'white', boxShadow: '0 4px 12px rgba\(108,99,255,0\.3\)' }}/g,
  "style={{ background: 'linear-gradient(135deg, #22D3EE, #06B6D4)', color: 'white', boxShadow: '0 4px 12px rgba(6,182,212,0.3)' }}");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Restored gradients.');
