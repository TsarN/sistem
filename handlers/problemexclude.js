// Problem exclude from contest

var swig    = require("swig");
var session = require("../session");
var problem = require("../problem");
var util    = require("util");
var url     = require("url");

function handleProblemexclude(request, response, globals, problemId) {
    var session_ = session.getSession(request, response);
    var getArgs = url.parse(request.url, true).query || {};

    problem.excludeProblem(request, response, globals, problemId, getArgs.contestId, function() {
        if (!getArgs.ref) {
            response.writeHead(200, {
                "Content-type": "text/html"
            });
            response.end('<script type="text/javascript">window.location.replace(document.referrer)</script>');
        } else {
            response.writeHead(302, {
                "Location": getArgs.ref
            });
            response.end();
        }
    }, function(err) {
        var templateOptions = {
            templates: {},
            err: err
        };

        try {
            templateOptions.templates.page_header = swig.renderFile(globals.privateHTMLPath + '/page_header.html', templateOptions);
            templateOptions.templates.page_footer = swig.renderFile(globals.privateHTMLPath + '/page_footer.html', templateOptions);
            templateOptions.templates.index = swig.renderFile(globals.privateHTMLPath + '/generic_error.html', templateOptions);
        } catch (err) {
            response.writeHead(500, {
                "Content-type": "text/html"
            });
            response.end("<h1>500 Internal server error</h1>");
            util.log("Internal server error. " + err.name + ": " + err.message);
            console.log("Stack trace: \n" + err.stack);
            return ;
        }

        response.writeHead(200, {
            "Content-type": "text/html"
        })
        response.write(templateOptions.templates.index);
        response.end();
    });
}

exports.handlers = {
    "/problemexclude/": handleProblemexclude
}