let express = require('express');
let router = express.Router();

const jwt = require('jsonwebtoken');
let key = require('./key');

router.all('/*', verify_jwt);

function verify_jwt(req, res, next) {
    const {jwt: token} = req.cookies;

    if (token) {
        jwt.verify(token, key.tokenKey, function(err, decoded) {
            if (!err) {
                next();
                return;
            }
        });
    } else {
        res.redirect('/login?redirect=/editor/');
  	    return;
    }
}

module.exports = router;
