#!/usr/bin/env node

const paperSizes = require('@cityssm/paper-sizes');
const path = require('path');
const fs = require('fs');

const argparse = require('argparse');
const flashCards = require('../index.js');

const SUPPORTED_FORMATS = ['letter', 'legal', 'tabloid', 'ledger', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6'];

const parser = new argparse.ArgumentParser();

const xor_group = parser.add_mutually_exclusive_group();
xor_group.add_argument('--html-only', { action: 'store_true' });
xor_group.add_argument('--pdf-only', { action: 'store_true' });

const group = parser.add_argument_group({ title: 'export options' });
group.add_argument('-f', '--format', { default: 'A4', help: 'pdf output format; defaults to A4. (note: ignored if --html-only is used along with this option.)' });
group.add_argument('-l', '--landscape', { action: 'store_true' });
group.add_argument('-m', '--margins', { default: '5mm', help: 'specify margins in a similar fashion to css margins but dimensions should be comma separated. (i.e. 10px,5mm corresponds to 10px top & bottom margins, 5mm left & right margins). Alternatively you can specify all 4 margins, comma separated of course :D.' });
group.add_argument('-c', '--columns', { default: 2 });
group.add_argument('-r', '--rows', { default: 4 });

parser.add_argument('-o', '--output-directory', { default: path.join('.', 'output') });
parser.add_argument('-n', '--output-name', { default: '', help: 'name of the resulting pdf and html files' });
parser.add_argument('--font-size', { default: '9pt', help: 'specified in css units' });

parser.add_argument('flash_file', { metavar: 'FLASH_FILE', help: 'YAML file containing flash card definitions' });

const args = parser.parse_args();

if (!SUPPORTED_FORMATS.includes(args.format)) {
   console.error(`unknown export format '${args.format}'`);
   process.exit(1);
}

let { width, height, unit } = paperSizes.getPaperSize(args.format);

if (args.landscape)
   [ width, height ] = [ height, width ];

args.page_width = `${width}${unit}`;
args.page_height = `${height}${unit}`;

args.margins = flashCards.parseMargins(args.margins);
args.output_directory = path.resolve(args.output_directory);

args.output_name = path.parse((args.output_name === '')
   ? args.flash_file : args.output_name).name;

const outputHTMLName = path.join(args.output_directory, args.output_name + '.html');
const outputPDFName = path.join(args.output_directory, args.output_name + '.pdf');

if (!fs.existsSync(args.flash_file)) {
   console.error(`file not found '${args.flash_file}'`);
   process.exit(1); 
}

flashCards.exportToHTML(args.flash_file, outputHTMLName, args);

if (!args.html_only) {
   flashCards.exportToPDF(outputHTMLName, outputPDFName, args).then(() => {
      if (!args.pdf_only)
         return;

      const resourcesPath = path.join(args.output_directory, 'shared');

      if (fs.existsSync(resourcesPath))
         fs.rmSync(resourcesPath, { recursive: true });

      if (fs.existsSync(outputHTMLName))
         fs.rmSync(outputHTMLName);
   });
}
else if (fs.existsSync(outputPDFName))
   fs.rmSync(outputPDFName);
