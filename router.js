var fs   = require("fs");
var mime = require("mime");
var path = require("path");
var util = require("util");

function route(handle, pathname, request, response, globals) {
    if (typeof handle[pathname] === 'function') {
        handle[pathname](request, response, globals);
    } else if (typeof handle[path.dirname(pathname) + "/"] === 'function') {
        handle[path.dirname(pathname) + "/"](request, response, globals, path.basename(pathname))
    } else {
        var serverpath   = __dirname + "/public_html" + path.normalize(pathname);    
        var notfoundpath = __dirname + "/public_html/404.html";
        fs.stat(serverpath, function(err, stats) {
            var exists = !err;
            if (exists && stats.isDirectory())
                serverpath += "/index.html";
            fs.stat(serverpath, function(err, stats) {
                exists = exists && !err;
                if (exists) {
                    var lastModReq = request.headers["if-modified-since"];
                    if (lastModReq)
                        lastModReq = new Date(lastModReq).getTime();
                    if (Math.floor(stats.mtime.getTime() / 1000) == 
                        Math.floor(lastModReq) / 1000) {
                        response.writeHead(304, {
                            "Last-modified": stats.mtime.toUTCString()
                        });
                        response.end();
                        return;
                    } else {
                        response.writeHead(200, {
                            "Content-type": mime.lookup(serverpath)
                        })
                        fs.readFile(serverpath, "utf8", function(err, data) {
                            if (err)
                                throw err;
                            response.write(data);
                            response.end();
                        })
                    }
                } else {
                    response.writeHead(404, {
                        "Content-type": mime.lookup(notfoundpath)
                    })
                    fs.readFile(notfoundpath, "utf8", function(err, data) {
                        if (err)
                            throw err;
                        response.write(data);
                        response.end();
                    })
                }
            })
        })
    }
}

exports.route = route;