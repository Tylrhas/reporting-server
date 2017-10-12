var pg = require('pg');

exports.findUser = function(id, callback) {
    var user = {};
    var queryText = "SELECT  FROM users WHERE id = $1";
    var queryValues = [id];
    pg.connect(secrets.DATABASE_URL, function(err, client, done) {
        client.query(queryText, queryValues, function(err, result) {
            user = result.rows;
            done(); // Releases the connection back to the connection pool
            callback(err, user);
        });
    });
    return user;
};