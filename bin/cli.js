#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

const argparse = require('argparse');
const flashCards = require('../index.js');

const parser = new argparse.ArgumentParser();
const xor_group = parser.add_mutually_exclusive_group();
xor_group.add_argument('--html-only', { action: 'store_true' });

const pdf_group = xor_group.add_argument_group();
pdf_group.add_argument('--format', { default: 'A4', help: 'pdf output format; defaults to A4.' });

pdf_group.add_argument('--pdf-only', { action: 'store_true' });

parser.add_argument('-c', '--columns', { default: 2 });
parser.add_argument('-r', '--rows', { default: 4 });
parser.add_argument('-m', '--margins', { default: '5mm', help: 'specify margins in a similar fashion to css margins but dimensions should be comma separated. (i.e. 10mm,5mm corresponds to 10mm top & bottom margins, 5mm left & right margins). Alternatively you can specify all 4 margins, comma separated of course :D.' });

parser.add_argument('-o', '--output-directory', { default: path.join('.', 'output') });
parser.add_argument('-n', '--output-name', { default: '', help: 'name of the resulting pdf and html files' });
parser.add_argument('-d', '--debug', { action: 'store_true', help: 'print resulting html code' });

parser.add_argument('flash_file', { metavar: 'FLASH_FILE', help: 'YAML file containing flash card definitions' });

const args = parser.parse_args();

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
