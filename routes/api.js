var express = require('express');
var router = express.Router();

var db = require('./db');
var key = require('./key');

const jwt = require('jsonwebtoken');

function get_all_posts(req, res, next) {
    let collection = db.get().collection('Posts');
    let username = req.params.username;

    collection.find({username: username}).toArray()
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

function get_one_post(req, res, next) {
    let collection = db.get().collection('Posts');
    let username = req.params.username;
    let postid = req.params.postid;
    collection.findOne({username: username, postid: Number(postid)})
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
        res.status(err.status || 401);
        res.render('error');
    });
}

function insert_post(req, res, next) {
    let collection = db.get().collection('Posts');
    let username = req.params.username;
    let postid = req.params.postid;

    let title = req.body.title;
    let body = req.body.body;
    let current_time_ms = Date.now();

    try {
        let token = req.cookies.jwt;

        if(token) {
            let decoded = jwt.verify(token, key.tokenKey);

            if (decoded.usr != username)
                throw new Error("Unauthorized Username");
            }
        }
    } catch (err) {
        throw new Error("Unauthorized Cookie");
    }
    console.log(req.body)
    console.log(body);
    console.log(title);
    if (!title || ! body) {
        throw new Error("Needs title and body params in body json");
    }

    collection.update({username: username, postid: Number(postid)}, { $setOnInsert: {username: username, postid: Number(postid), title: title, body: body, created: current_time_ms, modified: current_time_ms} }, { upsert: true })
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

router.get('/:username/:postid', get_one_post);

/* GET home page. */
router.get('/:username', get_all_posts);

router.post('/:username/:postid', insert_post);

module.exports = router;
