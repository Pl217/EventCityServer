var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var morgan = require('morgan');

var routes = require('./routes/index');

var app = express();

var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'})

app.use(morgan('combined', {stream: accessLogStream}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/', routes);

app.listen(8080, "0.0.0.0");
console.log('Magic happens on port ' + 8080);
