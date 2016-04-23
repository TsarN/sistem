var http = require("http");
var url  = require("url");
var util = require("util");

function startHTTPServer(route, handle, port, globals, onSuccess) {
    port = port || 8888;
    globals = globals || {};
    function onRequest(request, response) {
        var pathname = url.parse(request.url).pathname;
        route(handle, pathname, request, response, globals);
    }

    var server = http.createServer(onRequest);
    server.listen(port);
    util.log("Started HTTP Server on port " + port);
    if (onSuccess)
        onSuccess(server);
}

exports.startHTTPServer = startHTTPServer;
