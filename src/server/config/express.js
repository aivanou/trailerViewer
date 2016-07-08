'use strict';

var bodyParser = require('body-parser');

module.exports = function(app) {
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'ejs');
    app.set('views', './src/public/views');

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
};