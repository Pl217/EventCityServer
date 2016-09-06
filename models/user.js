var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/mosis');

var db = mongoose.connection;
db.on('error', function (err) {
    console.log('Connection error: ' + err);
});
db.once('open', function () {
    console.log('Successfully connected to MongoDB server!');
});

var userSchema = mongoose.Schema({
    username: String,
    hashed_password: String,
    name_lastname: String,
    phone: String,
    image: Buffer,
    points: Number,
    salt: String,
    friends: [String],
    events: [Number],
    lastLatitude: Number,
    lastLongitude: Number
});

module.exports = mongoose.model('users', userSchema);