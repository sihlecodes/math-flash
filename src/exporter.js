const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const YAML = require('js-yaml');

const utils = require('./utilities');

const DEFAULT_TEMPLATES_PATH = path.join(__dirname, '..', 'templates');
const TEMPLATE = path.join(DEFAULT_TEMPLATES_PATH, 'index.ejs');

async function _parseFlashCardsFile(flashCardsContent, partitionSize, template) {
   let data = YAML.loadAll(flashCardsContent);
   const heading = data.shift();

   data = data.map(function(e) { return {
      list: [], listStyle: 'roman',
      footer: '', name: '', page: 0,
      heading: '', description: '',
      ...e, ...heading
   }});

   let pages = utils.partitionArray(data, partitionSize);
   return await ejs.renderFile(template, { pages });
}

async function exportToHTML(sourceFlashPath, outputHTMLPath, options) {
   const outputDirectory = path.dirname(outputHTMLPath);

   if (!fs.existsSync(outputDirectory))
      fs.mkdirSync(path.join(outputDirectory, 'shared'),
         { recursive: true });

   const files = fs.globSync(path.join(DEFAULT_TEMPLATES_PATH, 'shared', '*'));

   for (const file of files) {
      let contents = await ejs.renderFile(file, options);
      fs.writeFileSync(path.join(outputDirectory, 'shared', path.basename(file)), contents);
   }

   const partitionSize = options.columns * options.rows;
   contents = fs.readFileSync(sourceFlashPath, 'utf8');

   _parseFlashCardsFile(contents, partitionSize, TEMPLATE)
      .then((document) => {
         fs.writeFileSync(outputHTMLPath, document);
      }).catch(err => console.log(err));
}

async function exportToPDF(sourceHTMLPath, outputPDFPath, options) {
   const browser = await puppeteer.launch();
   const page = await browser.newPage();

   await page.goto(`file:${sourceHTMLPath}`,
      { waitUntil: 'networkidle0', });

   await page.pdf({
      path: outputPDFPath,
      format: options.format,
      margin: options.margins,
      landscape: options.landscape,
      printBackground: true,
   });

   await browser.close();
}

module.exports = {
   exportToPDF,
   exportToHTML,
   DEFAULT_TEMPLATES_PATH
}
