const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs')
const YAML = require('js-yaml');

const DEFAULT_TEMPLATES_PATH = path.join(__dirname, 'templates');
const TEMPLATE = path.join(DEFAULT_TEMPLATES_PATH, 'index.ejs');

function _chunkArray(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

async function _parseFlashCardsFile(flashCardsContent, batchSize, template) {
   let data = YAML.loadAll(flashCardsContent);
   const heading = data.shift();

   data = data.map(function(e) { return {
      list: [], listStyle: "roman",
      footer: "", page: 0,
      ...e, ...heading
   }});

   let pages = _chunkArray(data, batchSize);
   return await ejs.renderFile(template, { pages });
}

function exportToHTML(sourceFlashPath, outputHTMLPath, options) {
   const outputDirectory = path.dirname(outputHTMLPath);

   if (!fs.existsSync(outputDirectory))
      fs.mkdirSync(path.join(outputDirectory, 'shared'),
         { recursive: true });

   fs.cpSync(path.join(DEFAULT_TEMPLATES_PATH, 'shared'),
      path.join(outputDirectory, 'shared'), { recursive: true });

   const batchSize = options.columns * options.rows;
   const contents = fs.readFileSync(sourceFlashPath, 'utf8');

   _parseFlashCardsFile(contents, batchSize, TEMPLATE)
   .then((document) => {
      if (options.debug)
         console.log(document);

      fs.writeFileSync(outputHTMLPath, document);
   });
}

async function exportToPDF(sourceHTMLPath, outputPDFPath, options) {
   const browser = await puppeteer.launch();
   const page = await browser.newPage();
   await page.goto(`file:${sourceHTMLPath}`, { waitUntil: 'networkidle0', });

   await page.pdf({
      path: outputPDFPath,
      format: options.format,
      margin: {
         left: '5mm',
         right: '5mm',
         top: '5mm',
         bottom: '5mm',
      }
   });
   await browser.close();
}

module.exports = {
   exportToPDF,
   exportToHTML,
   DEFAULT_TEMPLATES_PATH
}
