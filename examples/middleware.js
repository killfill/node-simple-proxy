require.paths.push('../lib');

var express = require('express')
  , proxy = require('proxy')
  , mime = require('mime');

var app = express.createServer();

app.configure(function() {
  app.use(proxy.middleware());
  app.use(express.static(__dirname));
});


app.listen(9099);

