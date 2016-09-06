var crypto = require('crypto');
var User = require('../models/user.js');

var login = function (username, password, callback) {
    User.findOne({username: username}, function (err, user) {
        if (user) {
            var temp = user.salt;
            var hash_db = user.hashed_password;
            var newPass = temp + password;
            var hashed_password = crypto.createHash('sha512').update(newPass).digest("hex");

            if (hash_db == hashed_password) {
                callback({message: 'Successful login', response: true});
            } else {
                callback({message: 'Wrong password', response: false});
            }
        } else {
            callback({message: 'No such user', response: false});
        }
    });
};

module.exports.login = login;