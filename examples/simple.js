require.paths.push('../lib');

var http = require('http')
  , proxy = require('proxy');


var httpProxy = proxy.createProxy();

var server = http.createServer(function(req, res) {
  httpProxy.handleRequest(req, res)
});

server.listen(9099);
