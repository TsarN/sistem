#!/usr/bin/env node
var server    = require("./server");
var route     = require("./router").route;
var handlers  = require("./handler").handlers;
var Datastore = require("nedb");
var util      = require("util");
var readline  = require("readline");
var child_process = require("child_process");
var fs        = require("fs");


/* Remove this for speed increase */
var swig      = require("swig");
swig.setDefaults({ cache: false });

/* Loading configuration */

var cfg = {}; 
try {
    cfg = JSON.parse(fs.readFileSync('config', 'utf8'));
} catch (err) {};

cfg.currentTheme = cfg.currentTheme || "default";
cfg.port = cfg.port || 8888;

process.on('exit', function() {
    console.log("");
    console.log("Saving configuration...");
    fs.writeFileSync("config", JSON.stringify(cfg, null, 4));
})

var globals = {
    privateHTMLPath: "themes/" + cfg.currentTheme + "/private_html",
    publicHTMLPath: "themes/" + cfg.currentTheme + "/public_html",
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

server.startHTTPServer(route, handlers, cfg.port, globals, function(srv) {
    var rl = readline.createInterface(process.stdin, process.stdout);
    rl.setPrompt('sistem> ');
    rl.prompt();

    rl.on('line', function(line) {

        line = line.trim();

        lineWords = line.split(" ");

        if (line == "help") {
            console.log("Available commands:");
            console.log("  scan - Detect compilers installed on system");
            console.log("  exit - Terminate server")
            console.log("  help - Show this help");
            console.log("  lstheme - List available themes");
            console.log("  chtheme <theme> - Set default theme");
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

        else if (line == "lstheme") {
            fs.readdir("themes", function(err, themes) {
                if (err)
                    throw err;
                for (var i in themes) {
                    console.log(((cfg.currentTheme == themes[i])?" * ":"   ") + themes[i]);
                };
                rl.prompt();
            })
        }

        else if (lineWords[0] == "chtheme") {
            if (lineWords.length < 2) {
                console.log("Required parameter missing: theme");
                rl.prompt();
            } else {
                fs.stat("themes/" + lineWords[1], function(err, stats) {
                    if (stats && stats.isDirectory()) {
                        cfg.currentTheme = lineWords[1];
                        console.log("Current theme is " + cfg.currentTheme); 
                        console.log("Restart server to apply changes");                     
                    } else {
                        console.log("No theme named '" + lineWords[1] + "'");
                    }
                    rl.prompt();
                })
            }
        }

        else {
            if (line.length > 0)
                console.log("No such command. Type 'help' for list of commands");
            rl.prompt();
        }
    });

    rl.on('close', function() {
        process.exit(0);
    });
});
