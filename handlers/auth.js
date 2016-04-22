// Auth handler

var swig    = require("swig");
var qs      = require("querystring");
var session = require("../session");

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

        session.login(request, response, globals, username, password);
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
    templateOptions.templates.page_header = swig.renderFile('private_html/page_header.html', templateOptions);
    templateOptions.templates.page_footer = swig.renderFile('private_html/page_footer.html', templateOptions);
    templateOptions.templates.index = swig.renderFile('private_html/login.html', templateOptions);
    
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

exports.handleLogin = handleLogin;