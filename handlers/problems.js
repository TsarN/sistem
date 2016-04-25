// Problem list handler

var swig    = require("swig");
var session = require("../session");
var util    = require("util");
var url     = require("url");

function handleProblems(request, response, globals) {
    var session_ = session.getSession(request, response);

    var getArgs = url.parse(request.url, true).query || {};
    var filters = {};
    if (getArgs.contestId)
        filters.contestId = getArgs.contestId;
    if (getArgs.contestId == "null")
        filters.contestId = null;

    var extraButtons = [];
    var showNewProblemButton = true;
    if (getArgs.addToContestId) {
        extraButtons.push({
            name: "Add to contest",
            href_before: "/problemexclude/",
            href_after: "?contestId=" + getArgs.addToContestId
        });
        showNewProblemButton = false;
    }

    globals.problems.find(filters, function(err, data) {
        if (err)
            throw err;

        var templateOptions = {
            session: session_,
            templates: {},
            problems: data,
            tzOffset: globals.tzOffset,
            pathname: url.parse(request.url).pathname,
            extraButtons: extraButtons,
            showNewProblemButton: showNewProblemButton,
            ref: getArgs.ref
        }

        try {
            templateOptions.templates.page_header = swig.renderFile(globals.privateHTMLPath + '/page_header.html', templateOptions);
            templateOptions.templates.page_footer = swig.renderFile(globals.privateHTMLPath + '/page_footer.html', templateOptions);
            templateOptions.templates.index = swig.renderFile(globals.privateHTMLPath + '/problems.html', templateOptions);
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

exports.handlers = {
    "/problems": handleProblems
}