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
                startTime: startTime,
                endTime: endTime,
                rules: rules
            }}, {multi: true}, function(err) {
                if (err)
                    throw err;
                onSuccess();
            })
        } else {
            globals.contests.insert({
                name: name,
                startTime: startTime,
                endTime: endTime,
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

function deleteContest(request, response, globals, contestId, onSuccess, onFail) {
    var session_ = session.getSession(request, response);
    if (session_.isAdmin) {
        globals.contests.remove({
            _id: contestId
        }, {}, function(err, numRemoved) {
            if (err)
                throw err;
            if (numRemoved > 0)
                onSuccess();
            else
                onFail("No such contest");
        })
    } else {
        onFail("Permission denied");
    }
}

exports.updateContest = updateContest;
exports.deleteContest = deleteContest;