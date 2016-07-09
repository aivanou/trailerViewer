'use strict';

var config = require('config');
var logger = require('../common/logger');
var api = require('express').Router();
var trailerCache = require('../lib/cache');
var trailerFetcher = require('../lib/core');

api.get('/:filmId', function(req, res) {
    logger.debug('Processing request with parameter: ' + req.params.filmId);
    var opts = {
        viaUrl: config.get('via.url'),
        traileAddictUrl: config.get('trailerAddict.url'),
        token: config.get('trailerAddict.token')
    };
    trailerCache.retrieve(req.params.filmId)
        .then(function(result) {
            logger.debug('Got data from cache for id: ' + req.params.filmId);
            res.render('pages/trailer.ejs', result.data);
        })
        .fail(function(result) {
            logger.debug('Cache miss, fetching data for : ' + req.params.filmId);
            trailerFetcher.fetch(req.params.filmId, opts)
                .then(function(data) {
                    logger.debug('Got response for rendering page for: ' + req.params.filmId);
                    res.render('pages/trailer.ejs', {
                        data: data
                    });
                    return data;
                })
                .then(function(data) {
                    trailerCache.insert(req.params.filmId, data);
                })
                .fail(function(fail) {
                    logger.error('Error: ' + fail);
                    res.status(500).send('No such movie');
                });
        });
});

module.exports = {
    router: api,
    endpoint: '/pc-se/film'
};