var Event = require('../models/event.js');

var addEvent = function (name, about, category, latitude, longitude, deadline, callback) {

    var newEvent = new Event({
        latitude: latitude,
        longitude: longitude,
        name: name,
        about: about,
        category: category,
        uid: (new Date()).getTime(),
        deadline: deadline
    });

    newEvent.save(function (err) {
        callback({message: 'New event successfully added', response: true});
    });
};

module.exports.addEvent = addEvent;
