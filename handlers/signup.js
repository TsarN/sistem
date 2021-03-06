// Signup handler

var swig    = require("swig");
var qs      = require("querystring");
var session = require("../session");
var util    = require("util");


function postSignup(request, response, globals) {
    var rawPostData = "";

    request.on("data", function(data) {
        rawPostData += data;
        if (rawPostData.length > 1e6) {
            request.connection.destroy();
        }
    })

    request.on("end", function() {
        var postData = qs.parse(rawPostData);
        var username = postData.username;
        var password = postData.password;
        var passwordConfirm = postData.passwordConfirm;

        session.signup(request, response, globals,
            username, password, passwordConfirm, function() {
                response.writeHead(302, {
                    "Location": "/"
                });
                response.end();
            }, function(err) {
                handleSignup(request, response, globals, err);
            });
    })
}

function handleSignup(request, response, globals, err) {
    if (!err && (request.method == "POST")) {
        postSignup(request, response, globals);
        return ;
    }

    var session_ = session.getSession(request, response);

    var templateOptions = {
        session: session_,
        templates: {},
        error: err
    };

    try {
        templateOptions.templates.page_header = swig.renderFile(globals.privateHTMLPath + '/page_header.html', templateOptions);
        templateOptions.templates.page_footer = swig.renderFile(globals.privateHTMLPath + '/page_footer.html', templateOptions);
        templateOptions.templates.index = swig.renderFile(globals.privateHTMLPath + '/signup.html', templateOptions);
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
}

exports.handlers = {
    "/signup": handleSignup
}