'use strict';

var util = require('util');
var OAuth2Strategy = require('passport-oauth2').Strategy;
var InternalOAuthError = require('passport-oauth2').InternalOAuthError;

function Strategy(options, verify) {
    options = options || {};
    OAuth2Strategy.call(this, options, verify);
    this.name = 'example';
    this.userInfoURL = options.userInfoURL;
}

util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = function (accessToken, done) {
    if (!this.userInfoURL) return done(null, {});

    this._oauth2.get(this.userInfoURL, accessToken, function (err, body) {
        if (err) return done(new InternalOAuthError('Failed to fetch user profile', err));
        var profile = {};
        try {
            var json = JSON.parse(body);
            profile.id = json.sub;
            profile.displayName = json.name;
            profile.name = {
                familyName: json.family_name,
                givenName: json.given_name,
                middleName: json.middle_name
            };
        } catch (ex) {
            return done(new Error('Failed to parse user profile'));
        }

        done(null, profile);
    });
};

module.exports = Strategy;
