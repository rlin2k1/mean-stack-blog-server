let express = require('express');
let router = express.Router();

let bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const key = require('./key');

let login = require('../models/login');

router.get('/', get_login);
router.post('/', post_login);

function get_login(req, res) { // GET login
    const {redirect} = req.query;
    let username = "";
    let password = "";

    res.render('login', {redirect: redirect, username: username, password: password});
}

function post_login(req, res) { // POST login
    const {username, password, redirect} = req.body;

    login.authenticate(username)
    .then( (result) => {
        let password_hash = result.password;
        
        if(bcrypt.compareSync(password, password_hash)) { // Provided username and password match our record
            // Set an authentication session cookie in JWT
            let two_hours_sec = (60 * 60) * 2;
            let current_time_sec = Date.now() / 1000;
            let token = jwt.sign({ "exp": current_time_sec + two_hours_sec, "usr":username }, key.tokenKey, { algorithm: 'HS256'});

            res.cookie('jwt',token);
            if (redirect) { // Redirect if it was provided in the request
                res.redirect(redirect);
            } else {
                res.send('Authentication was successful.'); // Return status code "200(OK)" with the body saying that the authentication was successful
            }
        } else { // Provided username and password did not match our record
            throw new Error("Incorrect username or password.");
        }
    })
    .catch((err) => { // Database error
        res.status(401);
        res.render('login', {redirect: redirect, username: username, password: password});
    });
}

module.exports = router;
