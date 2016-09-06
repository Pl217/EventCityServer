var crypto = require('crypto');
var rand = require('csprng');
var User = require('../models/user.js');

var register = function (username, password, name, phone, image, callback) {
    var temp = rand(160, 36);
    var newPass = temp + password;
    var hPass = crypto.createHash('sha512').update(newPass).digest("hex");

    var newUser = new User({
        username: username,
        hashed_password: hPass,
        name_lastname: name,
        phone: phone,
        salt: temp,
        friends: new Array(),
        events: new Array(),
        image: image,
        points: 0,
        lastLatitude: 43.3315734,
        lastLongitude: 21.892546713
    });

    User.find({username: username}, function (err, found) {
        var length = found.length;

        if (length == 0) {
            newUser.save(function (err) {
                callback({message: 'User successfully registered', response: true});
            });
        } else {
            callback({message: 'Username taken', response: false});
        }
    });
};

module.exports.register = register;
