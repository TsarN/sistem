// Contest remove

var swig    = require("swig");
var session = require("../session");
var contest = require("../contest");
var qs      = require("querystring");

function handleContestdel(request, response, globals, contestId) {
    var session_ = session.getSession(request, response);

    contest.deleteContest(request, response, globals, contestId, function() {
        response.writeHead(302, {
            "Location": "/"
        });
        response.end();
    }, function(err) {
        var templateOptions = {
            templates: {},
            err: err
        };
        templateOptions.templates.page_header = swig.renderFile(globals.privateHTMLPath + '/page_header.html', templateOptions);
        templateOptions.templates.page_footer = swig.renderFile(globals.privateHTMLPath + '/page_footer.html', templateOptions);
        templateOptions.templates.index = swig.renderFile(globals.privateHTMLPath + '/generic_error.html', templateOptions);
        
        response.writeHead(200, {
            "Content-type": "text/html"
        })
        response.write(templateOptions.templates.index);
        response.end();
    });
}

exports.handlers = {
    "/contestdel/": handleContestdel
}