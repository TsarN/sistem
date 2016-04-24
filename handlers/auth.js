// Auth handler

var swig    = require("swig");
var qs      = require("querystring");
var session = require("../session");
var util    = require("util");

function postLogin(request, response, globals) {
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

        session.login(request, response, globals, username, password, function() {
            response.writeHead(302, {
                "Location": "/"
            });
            response.end();
        }, function(err) {
            handleLogin(request, response, globals, err);
        });
    })
}

function handleLogin(request, response, globals, err) {
    if (!err && (request.method == "POST")) {
        postLogin(request, response, globals);
        return;
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
        templateOptions.templates.index = swig.renderFile(globals.privateHTMLPath + '/login.html', templateOptions);
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

function handleLogout(request, response, globals) {
    session.logout(request, response);
    response.writeHead(302, {
        "Location": "/"
    });
    response.end();
}

exports.handlers = {
    "/login"  : handleLogin,
    "/logout" : handleLogout
}