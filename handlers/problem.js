// Problem handler

var swig    = require("swig");
var session = require("../session");
var util    = require("util");

function handleProblem(request, response, globals, problemId) {
    var session_ = session.getSession(request, response);

    globals.problems.find({
        _id: problemId
    }, function(err, problems) {
        if (err)
            throw err;

        var problem = (problems.length > 0) ? problems[0] : {};

        globals.contests.find({
            _id: problem.contestId
        }, function(err, contests) {
            if (err)
                throw err;

            var contest = (contests.length > 0) ? contests[0] : {};
            var error = null;
            if (problems.length == 0)
                error = "No such problem";

            var templateOptions = {
                session: session_,
                templates: {},
                problem: problem,
                contest: contest,
                err: error
            };

            try {
                templateOptions.templates.page_header = swig.renderFile(globals.privateHTMLPath + '/page_header.html', templateOptions);
                templateOptions.templates.page_footer = swig.renderFile(globals.privateHTMLPath + '/page_footer.html', templateOptions);
                templateOptions.templates.index = swig.renderFile(globals.privateHTMLPath + '/problem.html', templateOptions);
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
        })
    })
}

exports.handlers = {
    "/problem/": handleProblem
}