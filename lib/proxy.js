var http = require('http')
  , events = require('events')
  , url = require('url');

function Proxy(opts) {
  events.EventEmitter.call(this);
  this.config = opts || {};
  this.customHeaders = opts.customHeaders || {}
  this.isHttps = opts.https && opts.https === true
  this.httpClient = this.isHttps? require('https'): http
};

Proxy.prototype = new events.EventEmitter;

Proxy.prototype._requestOpts = function(req) {

  var parsedUrl = url.parse(req.url);
  var opts = { 
      host: this.config.remoteHost || parsedUrl.hostname
    , port: this.config.remotePort || parsedUrl.port || this.isHttps? 443: 80
    , path: this.config.remotePath || req.url
    , method: req.method
    , headers: req.headers
  }
  opts.headers.host = opts.host;
  opts.headers['x-forwarded-for'] = req.connection.remoteAddress;

  for (var k in this.config.customHeaders)
    opts.headers[k] = this.customHeaders[k];

  return opts;
}

// Wrapped in a function, so ie can enable preprocess te data before sending it back to the client.
// By default, pipe it.. :P
Proxy.prototype.handleResponse = function(proxyRes, res) {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
};

Proxy.prototype.handleRequest = function(req, res, state, errorCb) {

  var self = this;

  if (typeof state == 'function') {
    cb = state;
    state = {};
  }

  //In the state hash, you can put info about the state of the proxy operation.
  //Its present in all events
  state = state || {};

  var requestOpts  = this._requestOpts(req);
  var proxyReq = this.httpClient.request(requestOpts);

  this.emit('start', { 
      req: req
    , res: res
    , proxyReq: proxyReq
    , requestOpts: requestOpts
    }, state);

  req.on('end', function() {
    self.emit('request', {
        req: req
      , res: res
      , proxyReq: proxyReq
      , requestOpts: requestOpts
    }, state);
  });

  proxyReq.on('response', function(proxyRes) {

    //Pipe the response of the server to the client.
    //Wrapped in a function for customization
    self.handleResponse(proxyRes, res);

    self.emit('response', {
        req: req
      , res: res
      , proxyReq: proxyReq
      , proxyRes: proxyRes
      }, state);

  });

  proxyReq.on('error', function(err) {

    res.writeHeader(503);
    res.end();

    /*
    self.emit('error', {
        req: req
      , res: res
      , proxyReq: proxyReq
      , error: err
      , returnedError: {
            code: 503
          , desc: http.STATUS_CODES[503]
	}
      }, state);
      */
      errorCb && errorCb(err);
  });

  //Pump data from the client to the server
  req.pipe(proxyReq);
}

exports.createProxy = function(opts) {
  return new Proxy(opts);
}

exports.createServer = function(opts) {
  var proxy = exports.createProxy(opts);
  return http.createServer(function(req, res) {
    proxy.handleRequest(req, res);
  });
}

exports.middleware = function(proxy) {
  proxy = proxy || exports.createProxy();

  return function(req, res, next) {

    if (req.url.match(/^\/http:\/\//)) {

      //Who put this / in the req.url?..
      if (req.url[0]=='/') req.url = req.url.slice(1);

      proxy.handleRequest(req, res, function(err) {
        return next(new Error(err));
      });
      
    }
    else
      return next();
  }

}

exports.Proxy = Proxy;
