const fs = require('fs');
const YAML = require('js-yaml');

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
 * @param {string} filename - The filename of the flash cards file.
 * @returns {Array} Pre-processed flash card file data @see @{@link parseFlashCardField}.
 */
function parseFlashCardsFile(filename) {
   let data = YAML.loadAll(fs.readFileSync(filename, 'utf8'));
   const globals = data.shift();

   let preProcessedData = [];

   for (const item of data) {
      const defaults = {
         ...globals
      }

      for (const field in defaults)
         item[field] ??= defaults[field];

      for (const field in item)
         item[field] = recursiveParseFlashCardField(item[field]);

      preProcessedData.push({ props: item });
   }

   return { globals, flashCards: preProcessedData };
}

module.exports = {
   parseFlashCardsFile
}
