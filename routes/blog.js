var express = require('express');
var router = express.Router();

var db = require('./db');

function blog_post(req, res, next) {
    var collection = db.get().collection('Posts')

    collection.find({postid: 1}).toArray(function(err, docs) {
        res.render('blog_post', { title: docs[0]['title'], body: docs[0]['body'] });
      });
}

function multiple_posts(req, res, next) {
    res.render('blog_post', { title: 'username', body: 'no postid' });
}
/* GET home page. */
router.get('/:username/:postid', blog_post);

/* GET home page. */
router.get('/:username', multiple_posts);

module.exports = router;
