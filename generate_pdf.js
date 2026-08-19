const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const htmlPath = `file://${path.resolve(__dirname, 'tanuja_shelke_data_analyst_resume_v2.html')}`;
    
    await page.goto(htmlPath, { waitUntil: 'networkidle0' });
    
    await page.pdf({
      path: 'Tanuja_Shelke_Perfect_Match.pdf',
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    await browser.close();
    console.log('PDF generated successfully: Tanuja_Shelke_Perfect_Match.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
})();
