var util = require("util");
var fs   = require("fs");

var walk = function(dir) {
    var results = []
    var list = fs.readdirSync(dir)
    list.forEach(function(file) {
        file = dir + '/' + file
        var stat = fs.statSync(file)
        if (stat && stat.isDirectory())
            results = results.concat(walk(file))
        else
            results.push(file)
    })
    return results
}

var handlers = {};
walk("handlers").forEach(function(pathname) {
    var handler = require("./" + pathname);

    for (var p in handler.handlers) {
        handlers[p] = handler.handlers[p];
    }
})

exports.handlers = handlers;