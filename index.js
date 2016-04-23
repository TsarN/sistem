#!/usr/bin/env node
var server    = require("./server");
var route     = require("./router").route;
var handlers  = require("./handler").handlers;
var Datastore = require("nedb");
var util      = require("util");
var readline  = require("readline");
var child_process = require("child_process");


/* Remove this for speed increase */
var swig      = require("swig");
swig.setDefaults({ cache: false });

var globals = {
    privateHTMLPath: "private_html",
    publicHTMLPath: "public_html",
    salt: "lKVtXxx(_fK_#-F@"
};

var databases = ['users', 'contests', 'problems', 'compilers'];

for (i in databases) {
    util.log("Loading database " + databases[i]);
    globals[databases[i]] = new Datastore({
        filename: __dirname + '/data/' + databases[i],
        autoload: true
    });
};

server.startHTTPServer(route, handlers, 8888, globals, function(srv) {
    var rl = readline.createInterface(process.stdin, process.stdout);
    rl.setPrompt('sistem> ');
    rl.prompt();

    rl.on('line', function(line) {
        if (line == "help") {
            console.log("Available commands:");
            console.log("  scan - Detect compilers installed on system");
            console.log("  exit - Terminate server")
            console.log("  help - Show this help");
            rl.prompt();
        }

        else if (line == "exit") {
            process.exit(0);
        }

        else if (line == "scan") {
            console.log("Processing your request, please wait...");
            child_process.exec("scripts/detectcompilers.sh", function(err, stdout, stderr) {
                if (err) {
                    console.log("Error occurred while processing your request: " + err);
                } else {
                    try {
                        var compilers = JSON.parse(stdout);
                        for (var k in compilers) {
                            if (compilers[k]) {
                                console.log(compilers[k].name + " [" + compilers[k].type + "] at " + compilers[k].path);
                            }
                        }
                    } catch (err) {
                        console.log("Error occurred while processing your request: " + err.message);
                    }
                }
                rl.prompt();
            })
        }


        else {
            if (line.trim().length > 0)
                console.log("No such command. Type 'help' for list of commands");
            rl.prompt();
        }
    });

    rl.on('close', function() {
        process.exit(0);
    });
});
