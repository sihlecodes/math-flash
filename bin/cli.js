#!/usr/bin/env node

const argparse = require('argparse');
const path = require('path');
const fs = require('fs');

const { DEFAULT_TEMPLATES_PATH, exportToPDF, exportToHTML } = require('../src/exporter');

const utils = require('../src/utilities');
const server = require('../src/server');

const parser = new argparse.ArgumentParser();

const xorGroup = parser.add_mutually_exclusive_group();
xorGroup.add_argument('--html-only', { action: 'store_true' });
xorGroup.add_argument('--pdf-only', { action: 'store_true' });

const group = parser.add_argument_group({ title: 'export options' });
group.add_argument('-f', '--format', { default: 'A4', help: 'pdf output format; defaults to A4. (note: ignored if --html-only is used along with this option.)' });
group.add_argument('-l', '--landscape', { action: 'store_true' });
group.add_argument('-m', '--margins', { default: '5mm', help: 'specify margins in a similar fashion to css margins but dimensions should be comma separated. (i.e. 10px,5mm corresponds to 10px top & bottom margins, 5mm left & right margins). Alternatively you can specify all 4 margins, comma separated of course :D.' });
group.add_argument('-c', '--columns', { default: 2 });
group.add_argument('-r', '--rows', { default: 4 });

parser.add_argument('-o', '--output-directory', { default: path.join('.', 'output') });
parser.add_argument('-n', '--output-name', { default: '', help: 'name of the resulting pdf and html files' });
parser.add_argument('--font-size', { default: '9pt', help: 'specified in css units' });

const liveGroup = parser.add_argument_group({ title: 'live preview options' });
liveGroup.add_argument('-v', '--view', { action: 'store_true', help: 'launch a live preview in the browser' });
liveGroup.add_argument('-p', '--port', { default: 3000 });
liveGroup.add_argument('--check-interval', { default: 100, help: 'interval for checking flash file changes (in milliseconds) (note: also affects the interval that the browser gets refreshed)' });

parser.add_argument('-g', '--generate', { action: 'store_true', help: 'create a new flash card file using the default template' })
parser.add_argument('flash_file', { metavar: 'FLASH_FILE', help: 'YAML file containing flash card definitions' });

const args = parser.parse_args();

if (args.generate && fs.existsSync(args.flash_file))
   utils.terminate(`file '${args.flash_file}' already exists`, 1);

if (args.generate) {
   const template = path.join(DEFAULT_TEMPLATES_PATH, 'template.yaml');
   fs.writeFileSync(args.flash_file, fs.readFileSync(template, 'utf8'));
   process.exit(0);
}

if (!fs.existsSync(args.flash_file))
   utils.terminate(`file not found '${args.flash_file}'`, 1);


if (!utils.isSupportedPageFormat(args.format))
   utils.terminate(`unknown export format '${args.format}'`, 1);

args.page_size = utils.getPageFormatDimensions(args.format, args.landscape);
args.margins = utils.parseMargins(args.margins);
args.output_directory = path.resolve(args.output_directory);

args.output_name = path.parse((args.output_name === '')
   ? args.flash_file : args.output_name).name;

const outputHTMLName = path.join(args.output_directory, args.output_name + '.html');
const outputPDFName = path.join(args.output_directory, args.output_name + '.pdf');

if (args.view) {
   utils.watch(args.flash_file,
      () => exportToHTML(args.flash_file, outputHTMLName, args), args.check_interval);

   server.launch(args.port, args.output_directory, outputHTMLName, args.check_interval);
}

exportToHTML(args.flash_file, outputHTMLName, args);

if (args.html_only)
   process.exit(0);

exportToPDF(outputHTMLName, outputPDFName, args).then(() => {
   if (!args.pdf_only)
      return;

   const resourcesPath = path.join(args.output_directory, 'shared');

   if (fs.existsSync(resourcesPath))
      fs.rmSync(resourcesPath, { recursive: true });

   if (fs.existsSync(outputHTMLName))
      fs.rmSync(outputHTMLName);
});
