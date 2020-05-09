let client = require('./db');

// Database Name
const dbName = 'BlogServer';
const usersCollection = 'Users'

module.exports.authenticate = function (username) {
    let collection = client.db(dbName).collection(usersCollection);
    return collection.findOne({username: username});
}
