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

exports.updateProblem = updateProblem;