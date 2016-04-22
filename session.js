var Cookies = require("cookies");

var openSessions = {}; /* username -> {SSID, permissions} */
var usedSSID = {};

var SSIDChars = "0123456789_-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

var crypto = require("crypto");

function newSSID() {
    var ssid = "";
    do {
        for (var i = 0; i < 32; ++i) {
            ssid += SSIDChars[Math.floor(Math.random() * SSIDChars.length)];
        }
    } while (usedSSID[ssid]);
    usedSSID[ssid] = true;
    return ssid;
}

function newSession(user) {
    var ssid = newSSID();
    openSessions[user.usernameLower] = {
        ssid: ssid
    }

    for (var k in user) {
        if (k != "password")
            openSessions[user.usernameLower][k] = user[k]
    }
    return ssid;
}

function login(request, response, globals, username, password, redirectTo) {
    redirectTo = redirectTo || "/";
    var passwordHash = crypto.createHash('sha1');
    passwordHash.update(password);
    passwordHash = passwordHash.digest('hex');
    globals.users.find({
        usernameLower: username.toLowerCase(),
        password: passwordHash
    }, function(err, data) {
        if (err)
            throw err;
        if (data.length > 0) {
            var ssid = newSession(data[0]);
            var cookies = new Cookies(request, response);

            cookies.set('sistem_username', data[0].usernameLower);
            cookies.set('sistem_ssid', ssid);

            response.writeHead(302, {
                "Location": redirectTo
            });
            response.end();
        } else {
            require(__dirname + "/handlers/auth.js").handleLogin(
                request, response, globals, "Wrong username or password"
            );
        }
    })
}

function signup(request, response, globals,
    username, password, passwordConfirm, redirectTo) {
    redirectTo = redirectTo || "/";

    var passwordHash = crypto.createHash('sha1');
    passwordHash.update(password);
    passwordHash = passwordHash.digest('hex');

    globals.users.find({
        usernameLower: username.toLowerCase()
    }, function(err, data) {
        if (err)
            throw err;
        if (data.length == 0) {
        if ((username.length >= 3) && (username.length <= 20)) {
        if (/^[a-zA-Z0-9_-]+$/.test(username)) {
        if (password == passwordConfirm) {
        if (password.length >= 5) {
            globals.users.insert({
                username: username,
                usernameLower: username.toLowerCase(),
                password: passwordHash,
                permissions: "user",
                wallet: 0,
                group: null,
                firstName: null,
                lastName: null,
                patronymic: null
            }, function(err) {
                if (err)
                    throw err;
                login(request, response, globals,
                    username, password, redirectTo);
            })
        } else {
            require(__dirname + "/handlers/signup.js").handleSignup(
                request, response, globals, "Password is too short"
            );
        }} else {
            require(__dirname + "/handlers/signup.js").handleSignup(
                request, response, globals, "Passwords do not match"
            );
        }} else {
            require(__dirname + "/handlers/signup.js").handleSignup(
                request, response, globals, "Username must contain alphanumeric characters only"
            );
        }} else {
            require(__dirname + "/handlers/signup.js").handleSignup(
                request, response, globals, "Username must be at least 3 and at most 20 characters"
            );
        }} else {
            require(__dirname + "/handlers/signup.js").handleSignup(
                request, response, globals, "Username is taken"
            );
        }
    })
}

function getSession(request, response) {
    var cookies = new Cookies(request, response);
    var username = cookies.get('sistem_username');
    var ssid = cookies.get('sistem_ssid');

    if (openSessions[username] && 
        (openSessions[username].ssid == ssid)) {
        var res = openSessions[username];
        res.isAdmin = (openSessions[username].permissions == "admin");
        return res;
    } else {
        return {};
    }
}

function logout(request, response) {
    var cookies = new Cookies(request, response);
    delete usedSSID[cookies.get('sistem_ssid')];
    delete openSessions[cookies.get('sistem_username')];
    cookies.set('sistem_ssid');
    cookies.set('sistem_username');
}

function updateInfo(request, response, globals, user, firstName,
    lastName, isAdmin, redirectTo) {
    redirectTo = redirectTo || "/";

    var userLower = user.toLowerCase();
    var session = getSession(request, response);

    if ((session.isAdmin && (isAdmin || userLower != session.usernameLower)) ||
        ((userLower == session.usernameLower) && !isAdmin)) {
        globals.users.update({
            usernameLower: userLower
        }, { $set: {
            firstName: firstName,
            lastName: lastName,
            permissions: (isAdmin) ? ("admin") : ("user")
        }}, {multi: true}, function(err) {
            if (err)
                throw err;
            response.writeHead(302, {
                "Location": redirectTo
            });
            response.end();
        })
    } else {
        require(__dirname + "/handlers/profile.js").handleProfile(
            request, response, globals, user, "Permission denied");
    }
}

function updatePassword(request, response, globals, user,
    newPassword, newPasswordConfirm, redirectTo) {
    redirectTo = redirectTo || "/";
    var userLower = user.toLowerCase();
    var session = getSession(request, response);

    if (session.isAdmin || (session.usernameLower == userLower)) {
    if (newPassword == newPasswordConfirm) {
    if (newPassword.length >= 5) {
        globals.users.update({
            usernameLower: userLower
        }, { $set: {
            password: newPassword
        }}, {multi: true}, function(err) {
            if (err)
                throw err;
            response.writeHead(302, {
                "Location": redirectTo
            })
            response.end();
        })
    } else {
        require(__dirname + "/handlers/profile.js").handleProfile(
            request, response, globals, user, "Password is too short");
    }} else {
        require(__dirname + "/handlers/profile.js").handleProfile(
            request, response, globals, user, "Passwords don't match");
    }} else {
        require(__dirname + "/handlers/profile.js").handleProfile(
            request, response, globals, user, "Permission denied");
    }
}

exports.login = login;
exports.signup = signup;
exports.getSession = getSession;
exports.logout = logout;
exports.updateInfo = updateInfo;
exports.updatePassword = updatePassword;