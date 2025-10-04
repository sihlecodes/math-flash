const ejs = require('ejs');
const YAML = require('js-yaml');

const utils = require('./utilities');

/** Parses a flash card field, converting markdown-like syntax to HTML.
 * @param {string} contents - The contents of the flash card field to parse.
 * @returns {string} The parsed contents with HTML formatting.
 *
 * Supported syntax:
 * - Bold text: *bold* -> <b>bold</b>
 * - Italic text: _italic_ -> <i>italic</i>
 * - Inline math: $math$ -> ${math}$ (kept together)
 * - Inline math: $!math$ -> $math$ (not kept together)
 * - Non-breaking space: \~ -> &nbsp;
 * - Double line break: \\ -> <br><br>
 * - En space: \  -> &ensp;
 *
 * Note: Text inside math blocks is not further processed for bold/italic.
 */
function parseFlashCardField(contents) {
   if (!contents || typeof contents !== 'string')
      return '';

   const pattern = / ?\$\$?(?:[^\$])*?\$\$? ?|[^\$]+?(?= ?\$\$?|$)/g;
   const matches = contents.matchAll(pattern);

   let segments = [];

   for (const match of matches) {
      let segment = match[0];

      // text inside math blocks
      if (segment.includes('$')) {
         // console.log('before:', segment);
         segment = segment
            .replace(/(?<=\$\$)&(.+)(?=\$\$)/, '\\begin{align*}$1\\end{align*}')
            .replace(/(?<=^ ?\$)([^\$]{2,})(?=\$)/, m => {
               if (m.startsWith('!'))
                  return m.slice(1);

               // keeps the text of inline equations together
               return `{${m}}`
            })
            .replace(/(?<=\$\$) $/, '')
            .replace(/(^ | $)/g, '&ensp;')
            .replace(/<(?=[a-zA-Z])/g, '< ');
         // console.log('after:', segment, '\n');
      }
      else {
         segment = segment
            .replace(/\*([^*]*?)\*/g, '<b>$1</b>')
            .replace(/_([^*]*?)_/g, '<i>$1</i>')
            .replace(/\\ /g, '&ensp;')
            .replace(/\\~/g, '&nbsp;')
            .replace(/\\\\/g, '<br><br>');
      }

      segments.push(segment);
   }

   // console.log('before:', `'${contents}'`);
   // console.log('after:', `'${segments.join('')}'\n`);

   return segments.join('');
}

/** Recursively parses flash card fields, handling nested arrays.
 * @param {string|Array} value - The flash card field value to parse.
 * @returns {string|Array} The parsed value, maintaining the original structure.
 */
function recursiveParseFlashCardField(value) {
   if (typeof value === 'string')
      return parseFlashCardField(value);

   if (!Array.isArray(value))
      return value;

   const parsedList = [];

   for (const nestedValue of value)
      parsedList.push(recursiveParseFlashCardField(nestedValue));

   return parsedList;
}

/** Parses a flash cards file content and renders it using a template.
 * @param {string} flashCardsContent - The content of the flash cards file in YAML format.
 * @param {number} partitionSize - The number of flash cards per page.
 * @param {string} template - The path to the EJS template file for rendering.
 * @returns {Promise<string>} A promise that resolves to the rendered HTML content.
 */
function parseFlashCardsFile(flashCardsContent, partitionSize, template) {
   let data = YAML.loadAll(flashCardsContent);
   const globals = data.shift();

   let preProcessedData = [];

   for (const item of data) {
      const defaults = {
         ...globals
      }

      // set defaults
      for (const field in defaults)
      item[field] ??= defaults[field];

      for (const field in item) {
         const value = item[field];

         item[field] = recursiveParseFlashCardField(value);
      }


      preProcessedData.push({ props: item });
   }

   let pages = utils.partitionArray(preProcessedData, partitionSize);
   return ejs.renderFile(template, { pages, perPage: partitionSize });
}

module.exports = {
   parseFlashCardsFile
}
