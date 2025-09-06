#!/usr/bin/env node

const argparse = require('argparse');
const path = require('path');
const fs = require('fs');

const { exportToPDF, exportToHTML } = require('../src/exporter');
const utils = require('../src/utilities');
const server = require('../src/server');

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

const live_group = parser.add_argument_group({ title: 'live preview options' });
live_group.add_argument('-v', '--view', { action: 'store_true' });
live_group.add_argument('-p', '--port', { default: 3000 });

parser.add_argument('flash_file', { metavar: 'FLASH_FILE', help: 'YAML file containing flash card definitions' });

const args = parser.parse_args();

if (!fs.existsSync(args.flash_file)) {
   console.error(`file not found '${args.flash_file}'`);
   process.exit(1);
}

if (!utils.isSupportedPageFormat(args.format)) {
   console.error(`unknown export format '${args.format}'`);
   process.exit(1);
}

args.page_size = utils.getPageFormatDimensions(args.format, args.landscape);
args.margins = utils.parseMargins(args.margins);
args.output_directory = path.resolve(args.output_directory);

args.output_name = path.parse((args.output_name === '')
   ? args.flash_file : args.output_name).name;

const outputHTMLName = path.join(args.output_directory, args.output_name + '.html');
const outputPDFName = path.join(args.output_directory, args.output_name + '.pdf');

if (args.view) {
   utils.watch(args.flash_file,
      () => exportToHTML(args.flash_file, outputHTMLName, args));

   server.launch(args.port, args.output_directory, outputHTMLName);
}

exportToHTML(args.flash_file, outputHTMLName, args);

if (args.html_only) {
   process.exit(0);
}

exportToPDF(outputHTMLName, outputPDFName, args).then(() => {
   if (!args.pdf_only)
      return;

   const resourcesPath = path.join(args.output_directory, 'shared');

   if (fs.existsSync(resourcesPath))
      fs.rmSync(resourcesPath, { recursive: true });

   if (fs.existsSync(outputHTMLName))
      fs.rmSync(outputHTMLName);
});
