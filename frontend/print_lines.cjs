const fs = require('fs');
const lines = [173, 679, 683, 1077, 1127, 1174, 1184, 1203, 1273, 1286, 1329, 1378, 1390, 1396, 1411, 1435];
const fileLines = fs.readFileSync('src/pages/OrgDashboard.jsx', 'utf8').split('\n');

for (const lineNum of lines) {
  console.log(`Line ${lineNum}: ${fileLines[lineNum - 1]}`);
}
