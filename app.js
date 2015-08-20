'use strict';

var express = require('express');
var session = require('express-session');
var morgan = require('morgan');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var login = require('connect-ensure-login');
var Strategy = require('./lib/strategy');


var app = express();
app.set('view engine', 'ejs');
app.use(morgan('combined'));
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


var strategy = new Strategy({
    authorizationURL: 'http://localhost:3000/oauth2/auth',
    tokenURL: 'http://localhost:3000/oauth2/token',
    clientID: 'oauth-consumer-example',
    clientSecret: 'secret2',
    callbackURL: 'http://localhost:3002/auth/example/callback',
    profileURL: 'http://localhost:3000/me'
}, function (accessToken, refreshToken, profile, done) {
    var user = profile || {};
    user._accessToken = accessToken;
    user._refreshToken = refreshToken;
    done(null, user);
});

passport.use('example', strategy);


app.get('/', function (req, res) {
    res.render('index', {user: req.user});
});

app.use('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/auth/example', passport.authenticate('example'));

app.get('/auth/example/callback', passport.authenticate('example', {
    failWithError: true, successReturnToOrRedirect: '/'}));

app.get('/time', login.ensureLoggedIn('/auth/example'), function (req, res, next) {
    strategy._oauth2.get('http://localhost:3000/time', req.user._accessToken, function (err, body) {
        if (err) {
            if (err instanceof Error) return next(err);
            if (typeof err !== 'object') return next(new Error(err));
            return next(new Error(err.data));
        }
        res.send(body);
    });
});

app.use(function (err, req, res, next) {
    res.render('error', {err: err});
});


app.listen(3002);
