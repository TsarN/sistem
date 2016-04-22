var session = require("./session");

function updateContest(request, response, globals, contestId, 
    name, startTime, endTime, rules, onSuccess, onFail) {

    var session_ = session.getSession(request, response);
    if (session_.isAdmin) {
        if (contestId) {
            globals.contests.update({
                _id: contestId
            }, { $set: {
                name: name,
                startTime: Date(startTime),
                endTime: Date(endTime),
                rules: rules
            }}, {multi: true}, function(err) {
                if (err)
                    throw err;
                onSuccess();
            })
        } else {
            globals.contests.insert({
                name: name,
                startTime: Date(startTime),
                endTime: Date(endTime),
                rules: rules,
                problems: []
            }, function(err) {
                if (err)
                    throw err;
                onSuccess();
            });
        }
    } else {
        onFail("Permission denied");
    }

}

exports.updateContest = updateContest;