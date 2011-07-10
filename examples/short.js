require.paths.push('../lib');

var http = require('http')
  , proxy = require('proxy');

/* Redirect all request to 9099 to host remoteHost */
var httpProxyServer = proxy.createServer({remoteHost: 'google.cl'});

httpProxyServer.listen(9099);
