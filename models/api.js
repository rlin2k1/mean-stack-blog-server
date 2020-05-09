let client = require('./db');

// Database Name
const dbName = 'BlogServer';
const usersCollection = 'Posts'

module.exports.get_all = function (username) {
    let collection = client.db(dbName).collection(usersCollection);
    return collection.find({username: username}).toArray()
}

module.exports.get_one = function (username, postid) {
    let collection = client.db(dbName).collection(usersCollection);
    return collection.findOne({username: username, postid: Number(postid)})
}

module.exports.insert = function (username, postid, current_time_ms, title, body) {
    let collection = client.db(dbName).collection(usersCollection);
    return collection.updateOne({username: username, postid: Number(postid)}, { $setOnInsert: {postid: Number(postid), username: username, created: current_time_ms, modified: current_time_ms, title: title, body: body} }, { upsert: true })
}

module.exports.update = function (username, postid, current_time_ms, title, body) {
    let collection = client.db(dbName).collection(usersCollection);
    return collection.updateOne({username: username, postid: Number(postid)}, {$set: {postid: Number(postid), username: username, modified: current_time_ms, title: title, body: body}})
}

module.exports.delete = function (username, postid) {
    let collection = client.db(dbName).collection(usersCollection);
    return collection.deleteOne({username: username, postid: Number(postid)})
}
