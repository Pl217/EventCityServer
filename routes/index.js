var express = require('express');
var router = express.Router();
var Register = require('./register.js');
var Login = require('./login.js');
var Bluetooth = require('./bluetooth.js');
var User = require('../models/user.js');
var Image = require('./image.js');
var geolib = require('geolib');
var newEvent = require('./newevent.js');
var Event = require('../models/event.js');
var _ = require('underscore');

router.post('/register', function (req, res) {
    var name = req.body.name;
    var username = req.body.username;
    var password = req.body.password;
    var phone = req.body.phone;
    var image = new Buffer(req.body.image, 'base64');

    Register.register(username, password, name, phone, image, function (found) {
        console.log(found);
        res.json(found);
    });
});

router.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    Login.login(username, password, function (found) {
        console.log(found);
        res.json(found);
    });
});

router.post('/event', function (req, res) {
    newEvent.addEvent(req.body.name, req.body.about, req.body.category,
        req.body.latitude, req.body.longitude, req.body.deadline, function (added) {
            console.log(added);
            res.json(added);
        });
});

router.get('/event/:uid/:latitude/:longitude', function (req, res) {
    Event.findOne({uid: req.params.uid}, '-_id -uid', function (err, event) {
        if (event) {
            var temp = {};
            temp.latitude = event.latitude;
            temp.longitude = event.longitude;

            var object = {};
            object.name = event.name;
            object.category = event.category;
            object.about = event.about;
            object.deadline = event.deadline;
            object.distance = geolib.getDistance(temp, {
                latitude: req.params.latitude,
                longitude: req.params.longitude
            });
            res.json(object);
        }
    });
});

router.get('/events/:category', function (req, res) {
    Event.find({category: req.params.category}, 'uid latitude longitude -_id', function (err, events) {
        if (events) {
            res.json(events);
        }
    });
});

router.post('/eventsinradius', function (req, res) {
    Event.find({}, 'latitude longitude uid  category -_id', function (err, found) {
        if (found) {
            var array = new Array();
            for (var i = 0; i < found.length; i++) {
                var temp = new Object();
                temp.latitude = found[i].latitude;
                temp.longitude = found[i].longitude;
                temp.category = found[i].category;
                /*temp.name = found[i].name;
                 temp.about = found[i].about;*/
                temp.uid = found[i].uid;
                array.push(temp);
            }

            var arr = geolib.orderByDistance({latitude: req.body.latitude, longitude: req.body.longitude}, array);
            var index = _.indexOf(arr, _.find(arr, function (doc) {
                return doc.distance > req.body.radius;
            }));

            if (index != -1) {
                res.json(arr.slice(0, index));
            }
            else {
                res.json(arr);
            }
        }
    });
});

router.get('/user/:username', function (req, res) {
    User.findOne({username: req.params.username}, 'username name_lastname phone points -_id', function (err, user) {
        if (user) {
            res.json(user);
        } else {
            res.sendStatus(404);
        }
    });
});

router.get('/image/:username', function (req, res) {
    Image.myImage(req.params.username, function (found) {
        res.send(found);
    });
});

router.get('/rankings', function (req, res) {
    User.find({}).limit(10).sort({points: -1}).select({
        username: 1,
        name_lastname: 1,
        points: 1,
        image: 1,
        _id: 0
    }).exec(function (err, users) {
        var json = new Object();
        json.images = users;
        res.json(json);
    });
});

router.get('/friends/:username', function (req, res) {
    User.findOne({username: req.params.username}, function (err, user) {
        if (user) {
            res.json(user.friends);
        } else {
            res.sendStatus(404);
        }
    });
});

router.get('/position/:username', function (req, res) {
    User.findOne({username: req.params.username}, 'lastLatitude lastLongitude -_id', function (err, user) {
        if (user) {
            res.json(user);
        } else {
            res.sendStatus(404);
        }
    });
});

router.post('/bluetooth', function (req, res) {
    Bluetooth.befriend(req.body.firstUser, req.body.secondUser, req.body.incScore, function (result) {
        console.log(result);
        res.json(result);
    });
});

router.put('/location', function (req, res) {

    User.update({username: req.body.username},
        {$set: {lastLatitude: req.body.latitude, lastLongitude: req.body.longitude}}, function (err, user) {
            if (user) {
                console.log({message: 'User location successfully updated', response: true});

                Event.find({}, 'latitude longitude uid  category -_id', function (err, found) {
                    if (found) {
                        var array = new Array();
                        for (var i = 0; i < found.length; i++) {
                            var temp = new Object();
                            temp.latitude = found[i].latitude;
                            temp.longitude = found[i].longitude;
                            temp.category = found[i].category;
                            /*temp.name = found[i].name;
                             temp.about = found[i].about;*/
                            temp.uid = found[i].uid;
                            array.push(temp);
                        }

                        var arr = geolib.orderByDistance({
                            latitude: req.body.latitude,
                            longitude: req.body.longitude
                        }, array);

                        if (arr[0] && arr[0].distance < 200) {
                            res.json(arr[0]);
                        }
                    }
                });
            } else {
                console.log({message: 'No such user', response: false});
                res.json({message: 'No such user', response: false});
            }
        });
});

router.put('/checkin', function (req, res) {
    User.update({username: req.body.username}, {$addToSet: {events: req.body.uid}}, function (err, response) {
        if (response.nModified > 0) {
            getPoints(req.body.username, req.body.uid);
        }
        res.json(response);
        console.log(response);
    });
});

var getPoints = function (username, uid) {
    Event.findOne({uid: uid}, function (err, event) {
        if (event) {
            User.findOne({username: username}, function (err, user) {
                if (user) {
                    var points = 0;
                    switch (event.category) {
                        case "Sport":
                            points = 20;
                            break;
                        case "Festival":
                            points = 40;
                            break;
                        case "Music":
                            points = 60;
                            break;
                        case "Film":
                            points = 15;
                            break;
                        case "Shopping":
                            points = 10;
                            break;
                        case "Gallery":
                            points = 65;
                            break;
                        case "Theater":
                            points = 55;
                            break;
                        case "Fair":
                            points = 45;
                            break;
                        default:
                            break;
                    }
                    User.update({username: username}, {$inc: {points: points}}, function (err, user) {
                    });
                }
            });
        }
    });
};

module.exports = router;
