const path = require('path');
const { chromium } = require('playwright');

async function main() {
  const baseName = process.argv[2];
  if (!baseName) {
    throw new Error('Usage: node render_pdf.js <base-name>');
  }

  const htmlPath = path.resolve(`output/pdf/${baseName}.html`);
  const pdfPath = path.resolve(`output/pdf/${baseName}.pdf`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print' });
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '10mm',
      right: '10mm',
      bottom: '10mm',
      left: '10mm',
    },
  });

  await browser.close();
  console.log(pdfPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
