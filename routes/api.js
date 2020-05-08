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
            console.log(token);
            if(token) {
                console.log("REACHED")
                let decoded = jwt.verify(token, key.tokenKey);
                console.log(decoded);
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
    console.log("REACHED")
    collection.findOne({username: username, postid: Number(postid)})
    .then( (result) => {
        if (! result) {
            throw new Error("Username / PostID not in database.")
        }
        try {
            let token = req.cookies.jwt;
            console.log(token);
            if(token) {
                let decoded = jwt.verify(token, key.tokenKey);
                console.log(decoded);
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

router.get('/:username/:postid', get_one_post);

/* GET home page. */
router.get('/:username', get_all_posts);

module.exports = router;
