var User = require('../models/user.js');

var befriend = function (firstuser, seconduser, incScore, callback) {
    console.log(firstuser);
    console.log(seconduser);

    var first = {$addToSet: {friends: seconduser}};
    var firstInc = {$addToSet: {friends: seconduser}, $mul: {points: 1.10}};

    User.update({username: firstuser}, (incScore) ? firstInc : first, function (err, user) {
        if (user) {
            var second = {$addToSet: {friends: firstuser}};
            var secondInc = {$addToSet: {friends: firstuser}, $mul: {points: 1.10}};
            console.log(incScore);
            User.update({username: seconduser}, (incScore) ? secondInc : second, function (err, user) {
                if (user) {
                    callback({message: 'Friends forever', response: true});
                }
            });
        } else {
            callback({message: 'Error updating first user', response: false});
        }
    });
};

module.exports.befriend = befriend;