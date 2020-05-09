let express = require('express');
let router = express.Router();

let commonmark = require('commonmark');
let reader = new commonmark.Parser();
let writer = new commonmark.HtmlRenderer();

let blog = require('../models/blog');

router.get('/:username/:postid', blog_post);
router.get('/:username', multiple_posts);

function clean(posts) {
    posts.forEach(function(post) {
        post.title = writer.render(reader.parse(post.title));
        post.body = writer.render(reader.parse(post.body));
        post.created = new Date(post.created);
        post.modified = new Date(post.modified);
    });
}

function blog_post(req, res) {
    const {username, postid} = req.params;

    blog.blog_post(username, postid)
    .then( (result) => {
        let title = writer.render(reader.parse(result.title));
        let body = writer.render(reader.parse(result.body));
        let created = new Date(result.created);
        let modified = new Date(result.modified);

        res.render('blog_post', { title: title, body: body , created: created, modified: modified});
    })
    .catch((err) => {
        res.locals.message = "Username / postid combination does not exist.";
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        res.status(err.status || 404);
        res.render('error');
    });
}

function multiple_posts(req, res) {
    const {username} = req.params;

    blog.check_user(username)
    .then( (result) => {
        if (!result) {
            throw new "User does not exist in the database.";
        }
    })
    .catch((err) => {
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        res.status(err.status || 404);
        res.render('error');
    });

    let next = 0;
    let maxPosts = 5;
    const {start = 0} = req.query;

    blog.multiple_posts(username, start)
    .then ( (result) => {
        clean(result)

        if (result.length == maxPosts) { // Need pagination! Set to the next id
            let greatestPostid = result[result.length - 1].postid;

            blog.counter(username, greatestPostid)
            .then ( (count) => {
                if (count > 0) {
                    next = greatestPostid + 1;
                }
            })
            .catch((err) => {
                throw new Error ("Database counter error.");
            });
        }
        res.render('multiple_posts', { username: username, posts: result, next: next});
    })
    .catch((err) => {
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        res.status(err.status || 404);
        res.render('error');
    });
}

module.exports = router;
