// Index handler

var swig    = require("swig");
var session = require("../session");

function handleContests(request, response, globals) {
    var session_ = session.getSession(request, response);

    globals.contests.find({}, function(err, data) {
        if (err)
            throw err;

        var templateOptions = {
            session: session_,
            templates: {},
            contests: data
        }

        templateOptions.templates.page_header = swig.renderFile(globals.privateHTMLPath + '/page_header.html', templateOptions);
        templateOptions.templates.page_footer = swig.renderFile(globals.privateHTMLPath + '/page_footer.html', templateOptions);
        templateOptions.templates.index = swig.renderFile(globals.privateHTMLPath + '/contests.html', templateOptions);
        
        response.writeHead(200, {
            "Content-type": "text/html"
        })
        response.write(templateOptions.templates.index);
        response.end();
    })
}

exports.handlers = {
    "/": handleContests,
    "/contests": handleContests
}