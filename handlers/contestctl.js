// Contest control

var swig    = require("swig");
var async   = require("async");
var session = require("../session");
var contest = require("../contest");
var qs      = require("querystring");

function postContestctl(request, response, globals, contestId) {
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
        var rules = postData.rules;
        var startTime = new Date(postData.startDate + " " + postData.startTime).toString();
        var endTime = new Date(postData.endDate + " " + postData.endTime).toString();

        contest.updateContest(request, response, globals, contestId,
        name, startTime, endTime, rules, function() {
            response.writeHead(302, {
                "Location": "/"
            });
            response.end();
        }, function(err) {
            handleContestctl(request, response, globals, contestId, err);
        });
    })
}

function handleContestctl(request, response, globals, contestId, ee) {
    if (!ee && (request.method == "POST")) {
        postContestctl(request, response, globals, contestId);
        return ;
    }
    ee = ee || "";
    contestId = contestId || null;
    var session_ = session.getSession(request, response);

    function display(err, contests) {
        if (err)
            throw err;

        if (contests.length == 0)
            ee = "No such contest";
        if (!session_.isAdmin)
            ee = "Permission denied";

        var templateOptions = {
            session: session_,
            templates: {},
            contestId: contestId,
            contest: (contests.length)?contests[0]:{},
            err: ee,
            jQuery: true
        }

        templateOptions.templates.page_header = swig.renderFile(globals.privateHTMLPath + '/page_header.html', templateOptions);
        templateOptions.templates.page_footer = swig.renderFile(globals.privateHTMLPath + '/page_footer.html', templateOptions);
        templateOptions.templates.index = swig.renderFile(globals.privateHTMLPath + '/contestctl.html', templateOptions);
        
        response.writeHead(200, {
            "Content-type": "text/html"
        })
        response.write(templateOptions.templates.index);
        response.end();
    }

    if (contestId) {
        globals.contests.find({
            _id: contestId
        }, display)
    } else {
        display(null, [{}]);
    }
}

exports.handlers = {
    "/contestctl": handleContestctl,
    "/contestctl/": handleContestctl
}

exports.handleContestctl = handleContestctl;