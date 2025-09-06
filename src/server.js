const express = require('express');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');
const open = require('open');

function launch(port, watchPath, indexHtml) {
   const app = express();

   const liveReloadServer = livereload.createServer();
   liveReloadServer.watch(watchPath);

   app.use(connectLivereload());
   app.use(express.static(watchPath));

   app.get('/', (_request, response) => {
      response.sendFile(indexHtml);
   });

   liveReloadServer.server.once("connection", () => {
      setTimeout(() => {
         liveReloadServer.refresh("/");
      }, 100);
   });

   open.default(`http://localhost:${port}`);
   app.listen(port, () => console.log("Server running on http://localhost:3000"));
}

module.exports = {
   launch,
}
