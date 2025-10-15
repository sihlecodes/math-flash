const express = require('express');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');
const open = require('open');

function launch(port, watchPath, indexFile, shouldOpenBrowser) {
   const app = express();

   const liveReloadServer = livereload.createServer();
   liveReloadServer.watch(watchPath);

   app.use(connectLivereload());
   app.use(express.static(watchPath));

   app.get('/', (_request, response) =>
      response.sendFile(indexFile));

   const url = `http://localhost:${port}`;

   liveReloadServer.server.once('connection', () => {
      setTimeout(() =>
         liveReloadServer.refresh('/'), 100);
   });

   if (shouldOpenBrowser)
      open.default(url);

   app.listen(port, () => console.log(`Server running on '${url}'`));
}

module.exports = {
   launch,
}
