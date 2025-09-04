const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const YAML = require('yaml');

const file = fs.readFileSync('./chapter1.flash', 'utf8');
const data = YAML.parseAllDocuments(file);

let fronts = [
];

let backs = [
];

for (const d of data) {
  console.log(d.contents);
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(`file:${path.join(__dirname, 'public', 'index.html')}`, {
    waitUntil: 'networkidle0', // Waits until no network connections for 500ms
  });

  await page.pdf({
    path: 'output.pdf',
    format: 'A4',
    margin: {
      left: 10,
      right: 10,
      top: 10,
      bottom: 10,
    }
  });
  await browser.close();
})();

