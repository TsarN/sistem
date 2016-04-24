// User profile handler

var swig    = require("swig");
var session = require("../session");
var url     = require("url");
var qs      = require("querystring");
var util    = require("util");


function postProfileUpdate(request, response, globals, user) {
    var rawPostData = "";

    request.on("data", function(data) {
        rawPostData += data;
        if (rawPostData.length > 1e6) {
            request.connection.destroy();
        }
    })

    request.on("end", function() {
        var postData = qs.parse(rawPostData);

        if (postData.updateInfo) {
            var firstName = postData.firstName;
            var lastName = postData.lastName;
            var isAdmin = postData.isAdmin;

            session.updateInfo(request, response, globals, user, firstName, lastName, isAdmin, function() {
                response.writeHead(302, {
                    "Location": "/profile/" + user
                });
                response.end();
            }, function(err) {
                handleProfile(request, response, globals, user, err);
            })
        }

        if (postData.updatePassword) {
            var newPassword = postData.newPassword;
            var newPasswordConfirm = postData.newPasswordConfirm;

            session.updatePassword(request, response, globals, user, newPassword, newPasswordConfirm, function() {
                response.writeHead(302, {
                    "Location": "/profile/" + user
                });
                response.end();
            }, function(err) {
                handleProfile(request, response, globals, user, err);
            })
        }
    })
}

function handleProfile(request, response, globals, user, ee) {
    if (!ee && (request.method == "POST")) {
        postProfileUpdate(request, response, globals, user);
        return ;
    }
    var currentSession = session.getSession(request, response);
    user = user || currentSession.username;
    user = user || "";

    var userInfo = {};

    globals.users.find({
        usernameLower: user.toLowerCase()
    }, function(err, data) {
        if (err)
            throw err;
        if (!(currentSession.isAdmin || (currentSession.usernameLower == user.toLowerCase())))
            ee = "Permission denied";
        else if (data.length > 0) {
            for (var k in data[0]) {
                userInfo[k] = data[0][k]
            }
            userInfo.isAdmin = (userInfo.permissions == "admin");
        }


        if (!userInfo.username)
            ee = ee || "No such user";

        var templateOptions = {
            session: currentSession,
            userInfo: userInfo,
            templates: {},
            err: ee
        }

        try {
            templateOptions.templates.page_header = swig.renderFile(globals.privateHTMLPath + '/page_header.html', templateOptions);
            templateOptions.templates.page_footer = swig.renderFile(globals.privateHTMLPath + '/page_footer.html', templateOptions);
            templateOptions.templates.index = swig.renderFile(globals.privateHTMLPath + '/profile.html', templateOptions);
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
    "/profile": handleProfile,
    "/profile/": handleProfile
}