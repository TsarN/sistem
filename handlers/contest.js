// Contest handler

var swig    = require("swig");
var session = require("../session");
var contest = require("../contest");
var util    = require("util");

function handleContest(request, response, globals, contestId) {
    var session_ = session.getSession(request, response);

    globals.contests.find({
        _id: contestId
    }, function(err, data) {
        if (err)
            throw err;
        var templateOptions = {
            session: session_,
            templates: {},
            contest: ((data.length > 0) ? data[0] : {}),
            err: ((data.length > 0) ? "" : "No such contest"),
            contestId: contestId
        }

        try {
            templateOptions.templates.page_header = swig.renderFile(globals.privateHTMLPath + '/page_header.html', templateOptions);
            templateOptions.templates.page_footer = swig.renderFile(globals.privateHTMLPath + '/page_footer.html', templateOptions);
            templateOptions.templates.index = swig.renderFile(globals.privateHTMLPath + '/contest.html', templateOptions);
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
    "/contest/": handleContest
}