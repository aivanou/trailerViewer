'use strict';

var config = require('config');
var logger = require('./common/logger');
var http = require('http');
var path = require('path');

var express = require('express');
var app = express();

require('./config/express')(app);
require('./routes')(app);

app.get('/index', function(req, res) {
    res.render('pages/index.ejs', {
        data: 'test'
    });
});

var server = http.createServer(app).listen(process.env.PORT, function() {
    logger.info('The trailer viewer is running on port ' + process.env.PORT);
});