var User = require('../models/user.js');

var myImage = function (username, callback) {
    User.findOne({username: username}, 'image -_id', function (err, user) {
        if (user) {
            callback(user.image);
        }
    });
};

var friendsImages = function (username, callback) {
    //TODO: Placeholder for the future
};

module.exports.myImage = myImage;
module.exports.friendsImages = friendsImages;