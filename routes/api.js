var express = require('express');
var router = express.Router();

var key = require('./key');

const jwt = require('jsonwebtoken');
let api = require('../models/api');

function get_all(req, res) {
    let username = req.params.username;

    api.get_all(username)
    .then( (result) => {
        try {
            let token = req.cookies.jwt;
            if(token) {
                let decoded = jwt.verify(token, key.tokenKey);
                if (decoded.usr == username) {
                    res.json(result);
                } else {
                    throw new Error("Unauthorized Username");
                }
            }
        } catch (err) {
            throw new Error("Unauthorized Cookie");
        }
    })
    .catch((err) => {
        // set locals, only providing error in development
        res.locals.message = "Unauthorized"
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 401);
        res.render('error');
    });
}

function get_one(req, res) {
    let username = req.params.username;
    let postid = req.params.postid;
    
    api.get_one(username, postid)
    .then( (result) => {
        if (! result) {
            throw new Error("Username / PostID not in database.")
        }
        try {
            let token = req.cookies.jwt;
            if(token) {
                let decoded = jwt.verify(token, key.tokenKey);
                if (decoded.usr == username) {
                    res.json(result);
                } else {
                    throw new Error("Unauthorized Username");
                }
            }
        } catch (err) {
            throw new Error("Unauthorized Cookie");
        }
    })
    .catch((err) => {
        // set locals, only providing error in development
        res.locals.message = "Unauthorized"
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 404);
        res.render('error');
    });
}

function insert_post(req, res) {
    let username = req.params.username;
    let postid = req.params.postid;

    let title = req.body.title;
    let body = req.body.body;
    let current_time_ms = Date.now();

    try {
        let token = req.cookies.jwt;

        if(token) {
            let decoded = jwt.verify(token, key.tokenKey);

            if (decoded.usr != username){
                throw new Error("Unauthorized Username");
            }
        }
    } catch (err) {
        throw new Error("Unauthorized Cookie");
    }
    if (!title || ! body) {
       // render the error page
       res.status(400);
       res.send('Title and body needed');
       return
    }

    api.insert(username, postid, current_time_ms, title, body)
    .then( (result) => {
        if (!result.result.upserted) {
            throw new Error("Could not update")
        }
        res.status(201);
        res.send("Insert Successful.")
    })
    .catch((err) => {
        // set locals, only providing error in development
        res.locals.message = "Unauthorized"
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 400);
        res.render('error');
    });
}

function update_post(req, res) {
    let username = req.params.username;
    let postid = req.params.postid;

    let title = req.body.title;
    let body = req.body.body;
    let current_time_ms = Date.now();

    try {
        let token = req.cookies.jwt;

        if(token) {
            let decoded = jwt.verify(token, key.tokenKey);

            if (decoded.usr != username){
                throw new Error("Unauthorized Username");
            }
        }
    } catch (err) {
        throw new Error("Unauthorized Cookie");
    }
    if (!title || ! body) {
       // render the error page
       res.status(400);
       res.send('Title and body needed');
       return
    }

    api.update(username, postid, current_time_ms, title, body)
    .then( (result) => {
        console.log(result);
        if (result.result.nModified != 1) {
            throw new Error("Could not update")
        }
        res.status(201);
        res.send("Update Successful.")
    })
    .catch((err) => {
        // set locals, only providing error in development
        res.locals.message = "Unauthorized"
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 400);
        res.render('error');
    });
}

function delete_post(req, res) {
    let username = req.params.username;
    let postid = req.params.postid;

    try {
        let token = req.cookies.jwt;

        if(token) {
            let decoded = jwt.verify(token, key.tokenKey);

            if (decoded.usr != username){
                throw new Error("Unauthorized Username");
            }
        }
    } catch (err) {
        throw new Error("Unauthorized Cookie");
    }

    api.delete(username, postid)
    .then( (result) => {
        console.log(result);
        if (result.deletedCount != 1) {
            throw new Error("Could not delete")
        }
        res.status(204);
        res.send("Deletion Successful.");
    })
    .catch((err) => {
        // set locals, only providing error in development
        res.locals.message = "Unauthorized"
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 400);
        res.render('error');
    });
}

router.get('/:username/:postid', get_one);

/* GET home page. */
router.get('/:username', get_all);

router.post('/:username/:postid', insert_post);

router.put('/:username/:postid', update_post);

router.delete('/:username/:postid', delete_post);

module.exports = router;
