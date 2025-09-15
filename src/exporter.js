const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const parser = require('./parser');

const DEFAULT_TEMPLATES_PATH = path.join(__dirname, '..', 'templates');

async function exportToHTML(sourceFlashPath, outputHTMLPath, options) {
   const template = path.join(DEFAULT_TEMPLATES_PATH, options.template);
   const outputDirectory = path.dirname(outputHTMLPath);
   const sharedDirectory = path.join(outputDirectory, 'shared');

   if (!fs.existsSync(sharedDirectory))
      fs.mkdirSync(sharedDirectory, { recursive: true });

   const files = fs.globSync(path.join(DEFAULT_TEMPLATES_PATH, 'shared', '*'));

   for (const file of files) {
      let contents = await ejs.renderFile(file, options);
      fs.writeFileSync(path.join(sharedDirectory, path.basename(file)), contents);
   }

   const partitionSize = options.columns * options.rows;
   contents = fs.readFileSync(sourceFlashPath, 'utf8');

   parser.parseFlashCardsFile(contents, partitionSize, template)
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
