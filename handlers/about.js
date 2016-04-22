// About handler

var swig    = require("swig");
var async   = require("async");
var session = require("../session");

function handleAbout(request, response, globals) {
    var session_ = session.getSession(request, response);

    var templateOptions = {
        session: session_,
        templates: {}
    }

    templateOptions.templates.page_header = swig.renderFile('private_html/page_header.html', templateOptions);
    templateOptions.templates.page_footer = swig.renderFile('private_html/page_footer.html', templateOptions);
    templateOptions.templates.index = swig.renderFile('private_html/about.html', templateOptions);
    
    response.writeHead(200, {
        "Content-type": "text/html"
    })
    response.write(templateOptions.templates.index);
    response.end();
}

exports.handlers = {
    "/about": handleAbout
}