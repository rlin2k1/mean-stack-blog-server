let client = require('./db');

// Database Name
const dbName = 'BlogServer';
const postsCollection = 'Posts';

module.exports.blog_post = function (username, postid) {
    let collection = client.db(dbName).collection(postsCollection);
    return collection.findOne({username: username, postid: Number(postid)});
}

module.exports.multiple_posts = function (username, postid=0) {
    let collection = client.db(dbName).collection(postsCollection);
    let increase = 1;
    let limit = 5;

    return collection.find({username: username, postid:{$gte: Number(postid)} }).sort({postid: increase}).limit( limit ).toArray();
}

module.exports.counter = function (username, postid) {
    let collection = client.db(dbName).collection(postsCollection);
    return collection.countDocuments({username: username, postid:{$gt: Number(postid)}});
}

const usersCollection = 'Users';
module.exports.check_user = function (username) {
    let collection = client.db(dbName).collection(usersCollection);
    return collection.findOne({username: username});
}
