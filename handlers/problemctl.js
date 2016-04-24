// Problem control

var swig    = require("swig");
var session = require("../session");
//var problem = require("../problem");
var qs      = require("querystring");

function handleProblemctl(request, response, globals, problemId, error) {
    problemId = problemId || null;
    var session_ = session.getSession(request, response);

    error = error || "";

    function display(err, problems) {
        if (err)
            throw err;

        if (problems.length == 0)
            error = "No such problem";
        if (!session.isAdmin)
            error = "Permission denied";

        var templateOptions = {
            session: session_,
            templates: {},
            problemId: problemId,
            problem: (problems.length) ? problems[0] : {},
            err: error
        };

        templateOptions.templates.page_header = swig.renderFile(globals.privateHTMLPath + '/page_header.html', templateOptions);
        templateOptions.templates.page_footer = swig.renderFile(globals.privateHTMLPath + '/page_footer.html', templateOptions);
        templateOptions.templates.index = swig.renderFile(globals.privateHTMLPath + '/problemctl.html', templateOptions);
        
        response.writeHead(200, {
            "Content-type": "text/html"
        })
        response.write(templateOptions.templates.index);
        response.end();
    }

    if (problemId) {
        globals.problems.find({
            _id: problemId
        }, display);
    } else {
        display(null, [{}]);
    }
}

exports.handlers = {
    "/problemctl": handleProblemctl,
    "/problemctl/": handleProblemctl
}