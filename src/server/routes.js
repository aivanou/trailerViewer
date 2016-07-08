'use strict';

module.exports = function(app) {
    var trController = require('./controllers/trailerController');
    app.use(trController.endpoint, trController.router);
};