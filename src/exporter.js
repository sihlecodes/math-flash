const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const parser = require('./parser');
const utils = require('./utilities');

const DEFAULT_TEMPLATES_PATH = path.join(__dirname, '..', 'templates');

function $shared(template) {
   return path.join(DEFAULT_TEMPLATES_PATH, '_shared', template);
}

function $encode(filename) {
   const contents = fs.readFileSync(filename, 'utf8');

   const minified = contents
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/[\n\r\t]+/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/\s*=\s*/g, '=')
    .trim();

   return 'data:image/svg+xml;utf8,' + encodeURIComponent(minified);
}

function $dump(filename) {
   if (!path.extname(filename))
      filename += '.ejs';

   return fs.readFileSync(filename, 'utf8');
}

function $partition(defaultSize) {
   return function(array, size = defaultSize) {
      return utils.partitionArray(array, size);
   }
}

async function exportToHTML(sourcePaths, outputDirectory, outputName, cardsPerPage, args) {
   const templateDirectory = path.join(DEFAULT_TEMPLATES_PATH, args.template);

   if (!fs.existsSync(templateDirectory))
      throw new Error(`template '${args.template}' does not exist`);

   const templatePaths = fs.globSync(path.join(templateDirectory, '**'));
   const exportableFilePattern = /\.(?!ejs)/;
   const exportableFiles = templatePaths.filter(p => p.match(exportableFilePattern));
   const isMultiFile = exportableFiles.length > 1;

   if (isMultiFile) {
      outputDirectory = path.join(outputDirectory, args.output_name);
      outputName = 'index';
   }

   if (!fs.existsSync(outputDirectory))
      fs.mkdirSync(outputDirectory, { recursive: true });

   const parsedData = parser.parseFlashCardsFile(sourcePaths[0]);
   parsedData.headers = [parsedData.globals];

   for (const sourceFlashPath of sourcePaths.slice(1)) {
      const data = parser.parseFlashCardsFile(sourceFlashPath);
      parsedData.headers.push(data.globals);
      parsedData.cards.push(...data.cards);
   }

   const outputHTMLPath = path.join(outputDirectory, outputName + '.html');

   for (const templatePath of templatePaths) {
      const suffix = templatePath.replace(templateDirectory, '');
      const outputPath = path.join(outputDirectory, suffix);

      if (isMultiFile && fs.lstatSync(templatePath).isDirectory())
         fs.mkdirSync(outputPath, { recursive: true });

      else if (templatePath.match(exportableFilePattern)) {
         const outputPath = path.join(outputDirectory, suffix);

         await ejs.renderFile(templatePath, {
               $dump, $encode, $shared, args,
               $partition: $partition(cardsPerPage),
               data: parsedData,
            }).then(content => {
               fs.writeFileSync(suffix.match('index.html') ? outputHTMLPath : outputPath, content);
            }).catch(err => console.log(err));
      }
   }

   return outputHTMLPath;
}

async function exportToPDF(sourceHTMLPath, outputDirectory, outputName, options) {
   const browser = await puppeteer.launch();
   const page = await browser.newPage();

   await page.goto(`file:${sourceHTMLPath}`,
      { waitUntil: 'networkidle0', });

   await page.pdf({
      path: path.join(outputDirectory, outputName + '.pdf'),
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
