var http = require('http')
  , proxy = require('proxy');

var httpProxy = proxy.createProxy();

var server = http.createServer(function(req, res) {

  var state = {
    startTime: new Date().getTime()
  }

  httpProxy.handleRequest(req, res, state);

}).listen(9099);

console.log('@9099...');

//response was received from the remote party
httpProxy.on('response', function(data, state) {

  data.proxyRes.on('end', function() {
    console.log(data.req.connection.remoteAddress, data.proxyRes.statusCode, data.req.url, new Date().getTime() - state.startTime+ '[ms]');
  });

});

