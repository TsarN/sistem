var session = require("./session");

function updateProblem(request, response, globals, problemId,
    name, timeLimit, memoryLimit, contestId, statement, onSuccess, onFail) {

    var session_ = session.getSession(request, response);
    if (contestId == "null")
        contestId = null;
    if (session_.isAdmin) {
        if (problemId) {
            globals.problems.update({
                _id: problemId
            }, { $set: {
                name: name,
                timeLimit: timeLimit,
                memoryLimit: memoryLimit,
                contestId: contestId,
                statement: statement
            }}, {}, function(err) {
                if (err)
                    throw err;
                onSuccess();
            })
        } else {
            globals.problems.insert({
                name: name,
                timeLimit: timeLimit,
                memoryLimit: memoryLimit,
                contestId: contestId,
                statement: statement
            }, function(err) {
                if (err)
                    throw err;
                onSuccess();
            })
        }
    } else {
        onFail("Permission denied");
    }
}

function deleteProblem(request, response, globals, problemId, onSuccess, onFail) {
    var session_ = session.getSession(request, response);
    if (session_.isAdmin) {
        globals.problems.remove({
            _id: problemId
        }, {}, function(err, numRemoved) {
            if (err)
                throw err;
            if (numRemoved > 0)
                onSuccess();
            else 
                onFail("No such problem");
        })
    } else {
        onFail("Permission denied");
    }
}

function excludeProblem(request, response, globals, problemId, contestId, onSuccess, onFail) {
    var session_ = session.getSession(request, response);
    if (session_.isAdmin) {
        globals.problems.update({
            _id: problemId
        }, { $set: {
            contestId: contestId || null
        }}, {}, function(err, numUpdated) {
            if (err)
                throw err;
            if (numUpdated > 0)
                onSuccess();
            else 
                onFail("No such problem");
        })
    } else {
        onFail("Permission denied");
    }
}

exports.updateProblem = updateProblem;
exports.deleteProblem = deleteProblem;
exports.excludeProblem = excludeProblem;