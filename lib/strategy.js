'use strict';

var util = require('util');
var OAuth2Strategy = require('passport-oauth2').Strategy;
var InternalOAuthError = require('passport-oauth2').InternalOAuthError;

function Strategy(options, verify) {
    options = options || {};
    OAuth2Strategy.call(this, options, verify);
    this.name = 'example';
    this._profileURL = options.profileURL;
}

util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = function (accessToken, done) {
    if (!this._profileURL) return done(null, {});

    this._oauth2.get(this._profileURL, accessToken, function (err, body) {
        var profile;

        if (err) return done(new InternalOAuthError('Failed to fetch user profile', err));

        try {
            profile = JSON.parse(body);
        } catch (ex) {
            return done(new Error('Failed to parse user profile'));
        }

        done(null, profile);
    });
};

module.exports = Strategy;
