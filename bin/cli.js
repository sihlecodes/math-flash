#!/usr/bin/env node

const argparse = require('argparse');
const path = require('path');
const fs = require('fs');
const os = require('os');

const { DEFAULT_TEMPLATES_PATH, exportToPDF, exportToHTML } = require('../src/exporter');

const utils = require('../src/utilities');
const server = require('../src/server');

const parser = new argparse.ArgumentParser();

parser.add_argument('-V', '--version', { action: 'version', version: require('../package.json').version });
parser.description = 'A tool for generating printable math flash cards from a yaml definition file.';

const xorGroup = parser.add_mutually_exclusive_group();
xorGroup.add_argument('-H', '--html-only', { action: 'store_true' });
xorGroup.add_argument('-P', '--pdf-only', { action: 'store_true' });

const group = parser.add_argument_group({ title: 'export options' });
group.add_argument('-f', '--format', { default: 'A4', help: 'pdf output format; defaults to A4. (note: ignored if --html-only is used along with this option.)' });
group.add_argument('-l', '--landscape', { action: 'store_true' });
group.add_argument('-m', '--margins', { default: '7mm', help: 'specify margins in a similar fashion to css margins but dimensions should be comma separated. (i.e. 10px,5mm corresponds to 10px top & bottom margins, 5mm left & right margins). Alternatively you can specify all 4 margins, comma separated of course :D.' });
group.add_argument('-c', '--columns', { default: 2 });
group.add_argument('-r', '--rows', { default: 4 });

parser.add_argument('-o', '--output-directory', { default: path.join('.', 'output') });
parser.add_argument('-n', '--output-name', { default: '', help: 'name of the resulting pdf and html files' });
parser.add_argument('-F', '--font-size', { default: '8pt', help: 'specified in css units' });

const liveGroup = parser.add_argument_group({ title: 'live preview options' });
liveGroup.add_argument('-v', '--view', { action: 'store_true', help: 'launch a live preview in the browser' });
liveGroup.add_argument('-p', '--port', { default: 3000 });
liveGroup.add_argument('-I', '--check-interval', { default: 100, help: 'interval for checking flash file changes (in milliseconds)' });
liveGroup.add_argument('-N', '--no-open', { action: 'store_true', help: 'start the preview server without opening the browser.' });

parser.add_argument('-t', '--template', { default: 'print' })
parser.add_argument('-g', '--generate', { action: 'store_true', help: 'create a new flash card file using the default template.yaml' })
parser.add_argument('flash_card_files', { nargs: '+', metavar: 'FLASH_CARD_FILE', help: 'YAML file containing flash card definitions' });

const args = parser.parse_args();

if (args.output_name === '')
   args.output_name = (args.flash_card_files.length > 1) ?
      'combined' : args.flash_card_files[0];

args.output_name = path.parse(args.output_name).name;

if (args.generate) {
   const template = path.join(DEFAULT_TEMPLATES_PATH, 'template.yaml');

   for (const file of args.flash_card_files) {
      if (fs.existsSync(file)) {
         console.error(`flash card file '${file}' already exists`);
         continue;
      }

      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, fs.readFileSync(template, 'utf8'));
   }

   process.exit(0);
}

for (const file of args.flash_card_files) {
   if (!fs.existsSync(file))
      utils.terminate(`flash card file '${file}' does not exist`, 1);
}

if (!utils.isSupportedPageFormat(args.format))
   utils.terminate(`unknown export format '${args.format}'`, 1);

args.page_size = utils.getPageFormatDimensions(args.format, args.landscape);
args.margins = utils.parseMargins(args.margins);
args.output_directory = path.resolve(args.output_directory);
args.intermediate_output_directory = args.output_directory;
args.cards_per_page = args.rows * args.columns;

if (fs.existsSync(args.output_directory))
   fs.mkdirSync(args.output_directory, { recursive: true });

if (args.pdf_only) {
   const prefix = path.join(os.tmpdir(), 'math-flash-');
   const folder = fs.mkdtempSync(prefix);
   args.intermediate_output_directory = folder;
}

(async function main() {
   function wrapped() {
      return exportToHTML(
         args.flash_card_files,
         args.intermediate_output_directory,
         args.output_name,
         args.cards_per_page, args);
   }

   if (args.view) {
      const outputHTMLPath = await wrapped();

      server.launch(
         args.port, path.dirname(outputHTMLPath),
         outputHTMLPath, !args.no_open);

      utils.watch(args.flash_card_files, wrapped, args.check_interval);
   }
   else {
      const outputHTMLPath = await wrapped();

      if (args.html_only)
         return;

      await exportToPDF(outputHTMLPath, args.output_directory, args.output_name, args)

      if (!args.pdf_only)
         return;

      if (fs.existsSync(args.intermediate_output_directory))
         fs.rmSync(args.intermediate_output_directory, { recursive: true });
   }
})();
