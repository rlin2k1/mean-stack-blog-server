var express = require('express');
var router = express.Router();

function blog_post(eq, res, next) {

    res.render('blog_post', { title: title, body: body })
}

function multiple_posts(eq, res, next) {
    res.render('blog_post', { title: 'username', body: 'no postid' })
}
/* GET home page. */
router.get('/:username/:postid', blog_post);

/* GET home page. */
router.get('/:username', multiple_posts);

module.exports = router;
