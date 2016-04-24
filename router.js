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
        var serverpath   = __dirname + "/" + globals.publicHTMLPath + path.normalize(pathname);    
        var notfoundpath = __dirname + "/" + globals.publicHTMLPath + "/404.html";
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
                        var encoding = mime.charsets.lookup(mime.lookup(serverpath), "binary");
                        fs.readFile(serverpath, encoding, function(err, data) {
                            if (err)
                                throw err;
                            if (encoding == "binary")
                                response.writeHead(200);
                            else
                                response.writeHead(200, {
                                    "Content-type": mime.lookup(serverpath)
                                })
                            response.write(data, encoding);
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