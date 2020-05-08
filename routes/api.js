var express = require('express');
var router = express.Router();

var db = require('./db');
var key = require('./key');

const jwt = require('jsonwebtoken');

function all_blog_posts(req, res, next) {
    let collection = db.get().collection('Posts');
    let username = req.params.username;

    collection.find({username: username}).toArray()
    .then( (result) => {
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

/* GET home page. */
router.get('/:username', all_blog_posts);

module.exports = router;
