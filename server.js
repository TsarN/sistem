var http = require("http");
var url  = require("url");
var util = require("util");

function startHTTPServer(route, handle, port, globals) {
    port = port || 8888;
    globals = globals || {};
    function onRequest(request, response) {
        var pathname = url.parse(request.url).pathname;
        route(handle, pathname, request, response, globals);
    }

    http.createServer(onRequest).listen(port);
    util.log("Started HTTP Server on port " + port);
}

exports.startHTTPServer = startHTTPServer;
