
var express = require('express');
var app = express();
var path = require('path');
var C = require('./config/secret');
var OAuth = require('oauth').OAuth;
var oauth = new OAuth(
    C.twitter.requestTokenURL,
    C.twitter.accessTokenURL,
    C.twitter.consumerkey,
    C.twitter.consumerSecret,
    "1.0",
    C.twitter.callbackURL,
    "HMAC-SHA1"
);

app.configure(function() {
    app.set('view engine', 'hbs');
    app.set('views', path.join(__dirname, 'views'));

    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ secret: "wofwehfef2" }));
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});


app.get('/login', function (req, res) {
    res.end('failed! Back to login.');
});


app.get('/auth/twitter', function(req, res) {
    oauth.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {
        if (error) {
            console.log(error);
            res.send("Authentication Failed!");
        }
        else {
            req.session.oauth = {
                consumerkey: oauth_token,
                consumerSecret: oauth_token_secret
            };
            res.redirect('https://twitter.com/oauth/authenticate?oauth_token=' + oauth_token);
        }
    });
});


app.get('/auth/twitter/callback', function(req, res) {
    var oauth_data;

    if ( ! req.session.oauth) return res.redirect('/login');
 
    req.session.oauth.verifier = req.query.oauth_verifier;

    oauth_data = req.session.oauth;
 
    oauth.getOAuthAccessToken(
        oauth_data.consumerkey,
        oauth_data.consumerSecret,
        oauth_data.verifier,

        function(err, accessToken, accessTokenSecret, appAccountDetails) {
            if (err) {
                console.log(err);
                res.send("Authentication Failure!");
            }
            else {
                req.session.oauth.accessToken = accessToken;
                req.session.oauth.accessTokenSecret = accessTokenSecret;
                console.log(req.session.oauth);

                res.send("Authentication Successful");
            }
        }
    );
});

app.listen(4000);

      
