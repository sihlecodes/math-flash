const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs')

const YAML = require('js-yaml');

const rows = 4;
const outputPath = path.join(__dirname, 'output.pdf');
const resourcesPath = path.join(__dirname, 'public');
const templatesPath = path.join(resourcesPath, 'templates');

const templates = {
   main: path.join(templatesPath, 'main.ejs'),
   card: {
      front: path.join(templatesPath, 'card-front.ejs'),
      back: path.join(templatesPath, 'card-back.ejs'),
   },
   container: {
      front: path.join(templatesPath, 'container-front.ejs'),
      back: path.join(templatesPath, 'container-back.ejs'),
   }
}

function chunkArray(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

async function parseFlashCardsFile(file, rows, templates) {
   let data = YAML.loadAll(file);
   const heading = data.shift();

   data = data.map(function(e) { return { ...e, heading }});
   let pages = chunkArray(data, rows);

   let document = await ejs.renderFile(templates.main, { title: 'Flash Cards', pages }, { escape: false });

   return document;
}

const file = fs.readFileSync('./chapter1.flash', 'utf8');

parseFlashCardsFile(file, rows, templates)
   .then((document) => {
      console.log(document);
      fs.writeFileSync(path.join(resourcesPath, 'test.html'), document);
   });

(async () => {
   const browser = await puppeteer.launch();
   const page = await browser.newPage();

   const index = path.join(resourcesPath, 'test.html')
   await page.goto(`file:${index}`, { waitUntil: 'networkidle0', });

   await page.pdf({
      path: outputPath,
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

