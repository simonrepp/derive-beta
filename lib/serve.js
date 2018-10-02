const express = require('express');
const http = require('http');

module.exports = data => {
  const app = express();
  const server = http.createServer(app).listen();

  app.set('port', server.address().port);
  app.use(express.static(data.buildDir));
  app.use('/_root_media/', express.static(data.root));

  data.serverUrl = `http://localhost:${server.address().port}`;
  data.server = server;

  console.log('Serving at ' + data.serverUrl);
};
