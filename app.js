'use strict';

var express = require('express');
var session = require('express-session');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var Strategy = require('./strategy');


var app = express();
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(session({name: 'oauth-consumer.sid', secret: 'keyboard cat2', resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser(function (user, done) {
    done(null, JSON.stringify(user));
});

passport.deserializeUser(function (serialized, done) {
    var user;
    try {
        user = JSON.parse(serialized);
    } catch (e) {
        return done(e);
    }
    done(null, user);
});


passport.use('example', new Strategy({
    authorizationURL: 'http://localhost:3000/authorization',
    tokenURL: 'http://localhost:3000/token',
    clientID: 'oauth-consumer-example',
    clientSecret: 'secret2',
    callbackURL: 'http://localhost:3002/auth/example/callback',
    profileURL: 'http://localhost:3000/me'
}, function (accessToken, refreshToken, profile, done) {
    var user = profile || {};
    user._accessToken = accessToken;
    user._refreshToken = refreshToken;
    done(null, user);
}));


app.get('/', function (req, res) {
    res.render('index', {user: req.user});
});

app.use('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/auth/example', passport.authenticate('example'));

app.get('/auth/example/callback',
    passport.authenticate('example', {failureRedirect: '/'}),
    function(req, res) {
        res.redirect('/');
    }
);


app.listen(3002);
