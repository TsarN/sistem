// Problem control

var swig    = require("swig");
var session = require("../session");
var problem = require("../problem");
var qs      = require("querystring");
var util    = require("util");
var url     = require("url");

function postProblemctl(request, response, globals, problemId) {
    var rawPostData = "";

    request.on("data", function(data) {
        rawPostData += data;
        if (rawPostData.length > 1e6) {
            request.connection.destroy();
        }
    })

    request.on("end", function() {
        var postData = qs.parse(rawPostData);
        var name = postData.name;
        var timeLimit = postData.timeLimit;
        var memoryLimit = postData.memoryLimit;
        var contestId = postData.contestId;
        var statement = postData.statement;

        problem.updateProblem(request, response, globals, problemId,
            name, timeLimit, memoryLimit, contestId, statement, function() {
                response.writeHead(302, {
                    "Location": "/"
                });
                response.end();
            }, function(err) {
                handleProblemctl(request, response, globals, problemId, err);
            })
    })
}

function handleProblemctl(request, response, globals, problemId, error) {
    problemId = problemId || null;
    if (!error && (request.method == "POST")) {
        postProblemctl(request, response, globals, problemId);
        return ;
    };

    var defaultValues = url.parse(request.url, true).query || {};

    var session_ = session.getSession(request, response);

    error = error || "";

    function display(err, problems) {
        if (err)
            throw err;

        if (problems.length == 0)
            error = "No such problem";
        if (!session_.isAdmin)
            error = "Permission denied";

        globals.contests.find({}, function(err, contests) {
            if (err)
                throw err;

            var templateOptions = {
                session: session_,
                templates: {},
                problemId: problemId,
                problem: (problems.length) ? problems[0] : {},
                err: error,
                jQuery: true,
                CKEditor: true,
                contests: contests
            };

            try {
                templateOptions.templates.page_header = swig.renderFile(globals.privateHTMLPath + '/page_header.html', templateOptions);
                templateOptions.templates.page_footer = swig.renderFile(globals.privateHTMLPath + '/page_footer.html', templateOptions);
                templateOptions.templates.index = swig.renderFile(globals.privateHTMLPath + '/problemctl.html', templateOptions);
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
    }

    if (problemId) {
        globals.problems.find({
            _id: problemId
        }, display);
    } else {
        display(null, [defaultValues]);
    }
}

exports.handlers = {
    "/problemctl": handleProblemctl,
    "/problemctl/": handleProblemctl
}