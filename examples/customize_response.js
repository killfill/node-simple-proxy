var proxy = require('simple-proxy'),
	http = require('http');

var config = {
	remoteHost: 'yourchildsroad.com',
	customHeaders: {
		'accept-encoding': 'text'
	},
	port: 3000
}

var regex = new RegExp(config.remoteHost, 'ig');

/* Override handleResponse. 
   Naively replace the response text of the remote call from config.remoteHost with localhost:port */
proxy.Proxy.prototype.handleResponse = function(proxyRes, res) {
	res.writeHead(proxyRes.statusCode, proxyRes.headers);

	if (!proxyRes.headers['content-type'] || proxyRes.headers['content-type'].indexOf('text')<0) {
		return proxyRes.pipe(res);
	}

	var text = '';
	proxyRes.setEncoding('utf8');
	proxyRes.on('data', function(chunk) {
		text += chunk;
	})

	proxyRes.on('end', function() {
		res.end(text.replace(regex, "localhost:"+config.port));
	})

}

var server = proxy.createServer(config);
server.listen(config.port);