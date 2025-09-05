const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const YAML = require('js-yaml');
const DOM = require('fauxdom');

const document = new DOM('<!DOCTYPE html><head><style>td { border: 1px solid black; }</style></head><body></body>');
const body = document.getElementsByTagName('body')[0];

const columns = 2, rows = 4;

const flashCardFronts = document.createElement('table');

const file = fs.readFileSync('./chapter1.flash', 'utf8');
const data = YAML.loadAll(file);

const meta = data.shift();
const heading = meta.shift().heading;

console.log(heading);

let row = document.createElement('tr');

for (let i = 0; i < data.length; i++) {
  const meta = data[i]; // YAML document

  if (i % 2 == 0 && i > 0) {
    console.log(row.outerHTML, '\n');
    flashCardFronts.appendChild(row);
    row = document.createElement('tr');
  }

  const description = document.createElement('td');
  description.className = 'description';
  description.textContent = meta.description;

  row.appendChild(description);
}

flashCardFronts.appendChild(row);
body.appendChild(flashCardFronts);

console.log(document.innerHTML);

fs.writeFileSync('test.html', document.innerHTML);

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const index = path.join(__dirname, 'public', 'index.html')
  await page.goto(`file:${index}`, { waitUntil: 'networkidle0', });

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

