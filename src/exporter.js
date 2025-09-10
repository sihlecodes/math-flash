const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const YAML = require('js-yaml');

const utils = require('./utilities');

const DEFAULT_TEMPLATES_PATH = path.join(__dirname, '..', 'templates');
const TEMPLATE = path.join(DEFAULT_TEMPLATES_PATH, 'index.ejs');

function _preProcessFieldContents(contents) {
   if (!contents)
      return '';

   let output = '';
   let isInlineMath = false;
   let isDisplayMath = false;
   let isBold = false;
   let isItalic = false;

   for (let i = 0; i < contents.length; i++) {
      const char = contents[i];
      const prev = contents[i - 1];
      const next = contents[i + 1];

      if (char === '$') {
         isInlineMath = !isInlineMath;

         if (prev === '$') {
            if (isDisplayMath && next === ' ')
               i++;

            isDisplayMath = !isDisplayMath;
         }

         output += '$';
         continue
      }

      if (isInlineMath || isDisplayMath) {
         output += char;
         continue;
      }

      switch(char) {
         case '*':
            isBold = !isBold;
            output += isBold ? '<b>' : '</b>';
            break;

         case '_':
            isItalic = !isItalic;
            output += isItalic ? '<i>' : '</i>';
            break;

         case '\\':
            if (next === ' ') {
               output += '&ensp;';
               i++;
               break;
            }

         case ' ':
            if (next === '$' || prev === '$') {
               output += '&ensp;';
               break;
            }

         default:
            output += char;
      }
   }

   return output;
}

async function _parseFlashCardsFile(flashCardsContent, partitionSize, template) {
   let data = YAML.loadAll(flashCardsContent);
   const heading = data.shift();

   let preProcessedData = [];

   for (const item of data) {
      const defaults = {
         list: [], listStyle: 'roman bracket',
         footer: '', alias: '', page: '',
         heading: heading.heading ?? '',
         description: '', term: ''
      }

      // handles empty fields passed inside yaml
      for (const field in defaults)
         item[field] ??= defaults[field];

      for (const field in defaults) {
         const value = item[field];

         if (typeof value === 'string')
            item[field] = _preProcessFieldContents(value);
      }

      const newList = [];

      for (const line of item.list)
         newList.push(_preProcessFieldContents(line));

      item.list = newList;
      preProcessedData.push(item);
   }

   let pages = utils.partitionArray(preProcessedData, partitionSize);
   return await ejs.renderFile(template, { pages });
}

async function exportToHTML(sourceFlashPath, outputHTMLPath, options) {
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
