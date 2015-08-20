'use strict';

var OAuth2 = require('oauth').OAuth2;

var options = {
    clientId: 'client1',
    clientSecret: 'secret1',
    baseSite: 'http://localhost:3000/',
    authorizeUrl: 'oauth2/auth',
    tokenUrl: 'oauth2/token'
};

var oauth2 = new OAuth2(options.clientId, options.clientSecret,
    options.baseSite, options.authorizeUrl, options.tokenUrl);

oauth2.getOAuthAccessToken('', {'grant_type': 'client_credentials'}, function (err, accessToken) {
    if (err instanceof Error) throw err;
    if (err) throw new Error(err.data);

    oauth2.get(options.baseSite + 'time', accessToken, function (err2, res) {
        if (err2) throw err2;
        console.log(res);
    });
});
