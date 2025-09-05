const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs')

const YAML = require('js-yaml');

const rows = 8;
const outputPath = path.join(__dirname, 'output');
const outputHTMLPath = path.join(outputPath, 'index.html');
const outputPDFPath = path.join(outputPath, 'output.pdf');

const templatesPath = path.join(__dirname, 'templates');

if (!fs.existsSync(outputPath))
   fs.mkdirSync(path.join(outputPath, 'shared'),
      { recursive: true });

fs.cpSync(path.join(templatesPath, 'shared'),
   path.join(outputPath, 'shared'), { recursive: true });

const template = path.join(templatesPath, 'index.ejs');

function chunkArray(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

async function parseFlashCardsFile(file, rows, template) {
   let data = YAML.loadAll(file);
   const heading = data.shift();

   data = data.map(function(e) { return { ...e, ...heading }});
   let pages = chunkArray(data, rows);

   return await ejs.renderFile(template, { title: 'Flash Cards', pages });
}

const file = fs.readFileSync('./chapter1.flash', 'utf8');

parseFlashCardsFile(file, rows, template)
   .then((document) => {
      console.log(document);
      fs.writeFileSync(outputHTMLPath, document);
   });

(async () => {
   const browser = await puppeteer.launch();
   const page = await browser.newPage();

   await page.goto(`file:${outputHTMLPath}`, { waitUntil: 'networkidle0', });

   await page.pdf({
      path: outputPDFPath,
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

