// Contest handler

var swig    = require("swig");
var session = require("../session");
var contest = require("../contest");

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

        templateOptions.templates.page_header = swig.renderFile(globals.privateHTMLPath + '/page_header.html', templateOptions);
        templateOptions.templates.page_footer = swig.renderFile(globals.privateHTMLPath + '/page_footer.html', templateOptions);
        templateOptions.templates.index = swig.renderFile(globals.privateHTMLPath + '/contest.html', templateOptions);
        
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