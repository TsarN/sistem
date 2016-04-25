// Contest handler

var swig    = require("swig");
var session = require("../session");
var contest = require("../contest");
var util    = require("util");

function timeFormat(ms) {
    if (ms < 0)
        return "<i>The contest is finished</i>";
    var seconds = Math.floor(ms / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    seconds = seconds % 60;
    minutes = minutes % 60;

    hours = (hours < 10) ? ("0" + hours) : hours;
    minutes = (minutes < 10) ? ("0" + minutes) : minutes;
    seconds = (seconds < 10) ? ("0" + seconds) : seconds;
    return hours + ":" + minutes + ":" + seconds;
}

function handleContest(request, response, globals, contestId) {
    var session_ = session.getSession(request, response);

    globals.contests.find({
        _id: contestId
    }, function(err, contests) {
        if (err)
            throw err;

        globals.problems.find({
            contestId: contestId
        }, function(err, problems) {
            if (err)
                throw err;

            var templateOptions = {
                session: session_,
                templates: {},
                contest: ((contests.length > 0) ? contests[0] : {}),
                err: ((contests.length > 0) ? "" : "No such contest"),
                contestId: contestId,
                problems: problems,
                tzOffset: globals.tzOffset,
                jQuery: true
            };

            if (contests.length)
                templateOptions.timeRemaining = timeFormat(
                    Date.parse(contests[0].endTime) - Date.now());

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
    })
}

exports.handlers = {
    "/contest/": handleContest
}