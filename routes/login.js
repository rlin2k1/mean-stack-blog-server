var express = require('express');
var router = express.Router();

let login = require('../models/login');
var key = require('./key');

var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/* GET home page. */
router.get('/', function(req, res) { // /login
    redirect = req.query.redirect
    res.render('login', {redirect: redirect});
  });

/* GET home page. */
router.post('/', function(req, res) { // /login
    let username = req.body.username;
    let redirect = req.body.redirect;

    login.authenticate(username)
    .then( (result) => {
        let password_hash = result.password;
        
        if(bcrypt.compareSync(req.body.password, password_hash)) { // Provided username and password match our record
            // Set an authentication session cookie in JWT
            let two_hours_sec = (60 * 60) * 2;
            let current_time_sec = Date.now() / 1000;
            let token = jwt.sign({ "exp": current_time_sec + two_hours_sec, "usr":username }, key.tokenKey, { algorithm: 'HS256'});
            res.cookie('jwt',token, { httpOnly: true });
            if (redirect) { // redirect if it was provided in the request
                res.send('Redirection successful.');
            } else {
                res.send('Authentication was successful.'); // Return status code "200(OK)" with the body saying that the authentication was successful
            }
        } else {
            res.status(401);
            res.render('login', {redirect: redirect});
        }
    })
    .catch((err) => {
        res.status(401);
        res.render('login', {redirect: redirect});
    });
  });

module.exports = router;
