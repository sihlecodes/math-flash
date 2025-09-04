const express = require('express');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');

const app = express();

// 🔁 Create LiveReload server
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(__dirname + "/public");

// 🔌 Inject LiveReload script into HTML
app.use(connectLivereload());

// 📁 Serve static files
app.use(express.static("public"));

// 🔄 Refresh browser on changes
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));

