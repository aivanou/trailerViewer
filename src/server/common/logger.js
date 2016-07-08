'use strict';

var config = require('config');
var winston = require('winston');

var logger = new(winston.Logger)({
    level: config.get('logger.level'),
    transports: [
        new(winston.transports.Console)(),
        new(winston.transports.File)({
            filename: config.get('logger.file')
        })
    ]
});

module.exports = logger;