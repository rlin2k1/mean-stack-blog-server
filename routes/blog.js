var express = require('express');
var router = express.Router();

var commonmark = require('commonmark');
var reader = new commonmark.Parser();
var writer = new commonmark.HtmlRenderer();

var db = require('./db');

function blog_post(req, res, next) {
    let collection = db.get().collection('Posts')

    collection.findOne({username: req.params.username, postid: Number(req.params.postid)})
    .then( (result) => {
        let title = writer.render(reader.parse(result.title));
        let body = writer.render(reader.parse(result.body));
        var created = new Date(result.created);
        var modified = new Date(result.modified);
        res.render('blog_post', { title: title, body: body , created: created, modified: modified});
    })
    .catch((err) => {
        // set locals, only providing error in development
        res.locals.message = "Username/PostID does not exist in the database"
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 404);
        res.render('error');
    });
}

function clean(result) {
    result.forEach(function(post) {
        post.title = writer.render(reader.parse(post.title));
        post.body = writer.render(reader.parse(post.body));
        post.created = new Date(post.created);
        post.modified = new Date(post.modified);
    });
}

function multiple_posts(req, res, next) {
    let collection = db.get().collection('Posts')

    if (!req.query.start) {
        // The first five blog posts!
        collection.find({username: req.params.username, postid:{$gte: 1} }).sort({postid: 1}).limit( 5 ).toArray()
        .then ( (result) => {
            // No posts could be available -> we are passing in an empty Array
            if (result.length == 0) {
                throw new Error('Username does not exist in the database.');
            }
            clean(result)

            let next = 0;
            if (result.length == 5) { // Need pagination! to set next to the next id.
                let greatest_postid = result[result.length - 1].postid;

                collection.count({username: req.params.username, postid:{$gt: greatest_postid}})
                .then ( (count) => {
                    if (count > 0) {
                        next = greatest_postid + 1;
                    }
                    res.render('multiple_posts', { username: req.params.username, posts: result, next: next});
                })
                .catch((err) => {
                    // set locals, only providing error in development
                    res.locals.message = 'Username does not exist in the database.'
                    res.locals.error = req.app.get('env') === 'development' ? err : {};
            
                    // render the error page
                    res.status(err.status || 404);
                    res.render('error');
                });
            } else {
                res.render('multiple_posts', { username: req.params.username, posts: result, next: next});
            }
        })
        .catch((err) => {
            // set locals, only providing error in development
            res.locals.message = err.message;
            res.locals.error = req.app.get('env') === 'development' ? err : {};
    
            // render the error page
            res.status(err.status || 404);
            res.render('error');
        });
    }
    else {
        // First five blog posts buy the start param
        // The first five blog posts!
        collection.find({username: req.params.username, postid:{$gte: Number(req.query.start)} }).sort({postid: 1}).limit( 5 ).toArray()
        .then ( (result) => {
            // No posts could be available -> we are passing in an empty Array
            clean(result)

            let next = 0;
            if (result.length == 5) { // Need pagination! to set next to the next id.
                let greatest_postid = result[result.length - 1].postid;

                collection.count({username: req.params.username, postid:{$gt: greatest_postid}})
                .then ( (count) => {
                    if (count > 0) {
                        next = greatest_postid + 1;
                    }
                    res.render('multiple_posts', { username: req.params.username, posts: result, next: next});
                })
                .catch((err) => {
                    // set locals, only providing error in development
                    res.locals.message = "Username does not exist in the database."
                    res.locals.error = req.app.get('env') === 'development' ? err : {};
            
                    // render the error page
                    res.status(err.status || 404);
                    res.render('error');
                });
            } else {
                res.render('multiple_posts', { username: req.params.username, posts: result, next: next});
            }
        })
        .catch((err) => {
            // set locals, only providing error in development
            res.locals.message = "Username does not exist in the database."
            res.locals.error = req.app.get('env') === 'development' ? err : {};
    
            // render the error page
            res.status(err.status || 404);
            res.render('error');
        });
    }
}
/* GET home page. */
router.get('/:username/:postid', blog_post);

/* GET home page. */
router.get('/:username', multiple_posts);

module.exports = router;
