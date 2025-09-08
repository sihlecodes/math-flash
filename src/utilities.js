const fs = require('fs');
const paperSizes = require('@cityssm/paper-sizes');

const SUPPORTED_PAGE_FORMATS = ['letter', 'legal', 'tabloid', 'ledger', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6'];

function isSupportedPageFormat(format) {
   return SUPPORTED_PAGE_FORMATS.includes(format.toLowerCase());
}

function getPageFormatDimensions(format, isLandscape) {
   let { width, height, unit } = paperSizes.getPaperSize(format);

   if (isLandscape)
      [ width, height ] = [ height, width ];

   return { width: `${width}${unit}`, height: `${height}${unit}` };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function terminate(reason, code) {
   console.error(reason);
   process.exit(code);
}

async function watch(file, callback, interval) {
   let previous = fs.statSync(file).mtime;

   while (true) {
      try {
         const stats = fs.statSync(file);
         const current = stats.mtime;

         if (current > previous) {
            previous = current;
            await callback();
         }
      } catch (err) {
         console.error(err);
      }

      await sleep(interval);
   }
}

function partitionArray(array, size) {
  const result = [];

  for (let i = 0; i < array.length; i += size)
    result.push(array.slice(i, i + size));

  return result;
}

function parseMargins(margins) {
   margins = margins.split(',').map(e => e.trim());

   let right, left, bottom, top;

   (() => {
      top = bottom = left = right = margins.shift();

      if (margins.length === 0) return;

      left = right = margins.shift();

      if (margins.length === 0) return;

      bottom = margins.shift();

      if (margins.length === 0) return;

      left = margins.shift();
   })();

   return { top, right, bottom, left };
}

module.exports = {
   getPageFormatDimensions,
   isSupportedPageFormat,
   parseMargins,
   partitionArray,
   sleep,
   terminate,
   watch,
}
