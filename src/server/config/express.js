'use strict';

var bodyParser = require('body-parser'),
    path = require('path'),
    express = require('express');

module.exports = function(app) {
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'ejs');
    app.set('views', './src/public/views');
    app.use(express.static('./src/public'));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
};