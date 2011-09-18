# Simple Proxy

 This is a simple http proxy that may be usefull for you. 
 You can use it on your own http server, express app, or with the stand alone script.
 For examples see the examples dir.

 ## Instalation

    $ npm install simple-proxy


## Script usage

```
page: proxy [options]

  Options:

    -h, --help             output usage information
    -v, --version          output the version number
    -L, --listen <port>    listen to port [3000]
    -M, --mount <mount>    proxy request starting with this pathname
    -H, --host <hostname>        to this hostname
    -P, --port <port>            to this port
```

## Example

  proxy -M api -H remote-api.com /var/www/the_site
