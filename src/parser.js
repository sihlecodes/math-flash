const ejs = require('ejs');
const YAML = require('js-yaml');

const utils = require('./utilities');

/**
  * @param {string} contents
  * @returns {string}
  */
function parseFlashCardField(contents) {
   if (!contents)
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
            .replace(/(^ | $)/g, '&ensp;');
         // console.log('after:', segment, '\n');
      }
      else {
         segment = segment
            .replace(/\*([^*]*?)\*/g, '<b>$1</b>')
            .replace(/_([^*]*?)_/g, '<i>$1</i>')
            .replace(/\\ /g, '&ensp;')
            .replace(/\\~/g, '&nbsp;');
      }

      segments.push(segment);
   }

   // console.log('before:', `'${contents}'`);
   // console.log('after:', `'${segments.join('')}'\n`);

   return segments.join('');
}

function parseFlashCardsFile(flashCardsContent, partitionSize, template) {
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
            item[field] = parseFlashCardField(value);
      }

      const newList = [];

      for (const line of item.list)
         newList.push(parseFlashCardField(line));

      item.list = newList;
      preProcessedData.push(item);
   }

   let pages = utils.partitionArray(preProcessedData, partitionSize);
   return ejs.renderFile(template, { pages });
}

module.exports = {
   parseFlashCardsFile
}
