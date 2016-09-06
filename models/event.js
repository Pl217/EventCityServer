var mongoose = require('mongoose');

var eventSchema = mongoose.Schema({
    latitude: Number,
    longitude: Number,
    name: String,
    about: String,
    category: String,
    uid: Number,
    deadline: Date
});

module.exports = mongoose.model('events', eventSchema);