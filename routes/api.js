let express = require('express');
let router = express.Router();

const jwt = require('jsonwebtoken');
let key = require('./key');

let api = require('../models/api');

router.get('/:username/:postid', get_one);
router.get('/:username', get_all);
router.post('/:username/:postid', insert_post);
router.put('/:username/:postid', update_post);
router.delete('/:username/:postid', delete_post);

function verify(token, username) {
    if (token) {
        let decoded = jwt.verify(token, key.tokenKey); // Also checks for expiration date
        if (decoded.usr != username) {
            throw new Error("Invalid username or password");
        }
    } else {
        throw new Error("JWT cookie does not exist.");
    }
}

function get_all(req, res) {
    const {username} = req.params;
    const {jwt: token} = req.cookies;

    try { verify(token, username); } catch (err) { res.status(401); res.send("Unauthorized JWT Cookie"); return; }

    api.get_all(username)
    .then( (result) => {
        res.json(result);
    })
    .catch((err) => {
        res.locals.message = "Username does not exist.";
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        res.status(err.status || 401);
        res.render('error');
    });
}

function get_one(req, res) {
    const {username, postid} = req.params;
    const {jwt: token} = req.cookies;

    try { verify(token, username); } catch (err) { res.status(401); res.send("Unauthorized JWT Cookie"); return; }
    
    api.get_one(username, postid)
    .then( (result) => {
        if (!result) {
            throw new Error("Username / postid combination does not exist.")
        }
        res.json(result);
    })
    .catch((err) => {
        res.locals.message = "Username / postid combination does not exist.";
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        res.status(err.status || 404);
        res.render('error');
    });
}

function insert_post(req, res) {
    const {username, postid} = req.params;
    const {jwt: token} = req.cookies;

    try { verify(token, username); } catch (err) { res.status(401); res.send("Unauthorized JWT Cookie"); return; }

    const {title, body} = req.body;
    let current_time_ms = Date.now();
    
    if (title === undefined || body === undefined) {
       res.status(400);
       res.send('Both title and body needed in request.');
       return
    }

    api.insert(username, postid, current_time_ms, title, body)
    .then( (result) => {
        if (!result.result.upserted) {
            throw new Error("Username / postid combination already exists.");
        }
        res.status(201);
        res.send("Posts insertion successful");
    })
    .catch((err) => {
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        res.status(err.status || 400);
        res.render('error');
    });
}

function update_post(req, res) {
    const {username, postid} = req.params;
    const {jwt: token} = req.cookies;

    try { verify(token, username); } catch (err) { res.status(401); res.send("Unauthorized JWT Cookie"); return; }

    const {title, body} = req.body;
    let current_time_ms = Date.now();

    if (title === undefined || body === undefined) {
        res.status(400);
        res.send('Both title and body needed in request.');
        return
     }

    api.update(username, postid, current_time_ms, title, body)
    .then( (result) => {
        if (result.result.nModified != 1) {
            throw new Error("Username / postid combination does not exist.");
        }
        res.status(200);
        res.send("Post update successful");
    })
    .catch((err) => {
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        res.status(err.status || 400);
        res.render('error');
    });
}

function delete_post(req, res) {
    const {username, postid} = req.params;
    const {jwt: token} = req.cookies;

    try { verify(token, username); } catch (err) { res.status(401); res.send("Unauthorized JWT Cookie"); return; }

    api.delete(username, postid)
    .then( (result) => {
        if (result.deletedCount != 1) {
            throw new Error("Username / postid combination does not exist.");
        }
        res.status(204);
        res.send("Post deletion Successful.");
    })
    .catch((err) => {
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        res.status(err.status || 400);
        res.render('error');
    });
}

module.exports = router;
