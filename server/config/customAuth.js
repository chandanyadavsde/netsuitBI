const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

const createNetsuiteAuthHeaders = (consumerKey, consumerSecret, tokenKey, tokenSecret, url, realm) => {
    const oauth = OAuth({
        consumer: { key: consumerKey, secret: consumerSecret },
        signature_method: 'HMAC-SHA256',
        hash_function(baseString, key) {
            return crypto.createHmac('sha256', key).update(baseString).digest('base64');
        },
    });

    const token = { key: tokenKey, secret: tokenSecret };
    const requestData = { url, method: 'GET' };

    const authHeaders = {
        ...oauth.toHeader(oauth.authorize(requestData, token)),
        Authorization: `${oauth.toHeader(oauth.authorize(requestData, token)).Authorization}, realm=${realm}`,
    };

    return authHeaders;
};

module.exports = createNetsuiteAuthHeaders;
