// Signup handler

var swig    = require("swig");
var qs      = require("querystring");
var session = require("../session");

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
            username, password, passwordConfirm);
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

    templateOptions.templates.page_header = swig.renderFile('private_html/page_header.html', templateOptions);
    templateOptions.templates.page_footer = swig.renderFile('private_html/page_footer.html', templateOptions);
    templateOptions.templates.index = swig.renderFile('private_html/signup.html', templateOptions);
    
    response.writeHead(200, {
        "Content-type": "text/html"
    })
    response.write(templateOptions.templates.index);
    response.end();
}

exports.handlers = {
    "/signup": handleSignup
}

exports.handleSignup = handleSignup;