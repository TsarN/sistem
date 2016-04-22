#!/usr/bin/env node
var server    = require("./server");
var route     = require("./router").route;
var handlers  = require("./handler").handlers;
var Datastore = require("nedb");

/* Remove this for speed increase */
var swig      = require("swig");
swig.setDefaults({ cache: false });


var globals = {};

globals.users = new Datastore({
    filename: __dirname + '/data/users',
    autoload: true
});

globals.contests = new Datastore({
    filename: __dirname + '/data/contests',
    autoload: true
})

server.startHTTPServer(route, handlers, 8888, globals);