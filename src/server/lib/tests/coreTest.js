'use strict';

var fetcher = require('../core'),
    should = require('should'),
    app = require('../../server'),
    request = require('supertest'),
    config = require('config');

describe("Internal Fetcher tests", function() {
    it('should return data for showing trailer', function(done) {
        var opts = {
            viaUrl: config.get('via.url'),
            traileAddictUrl: config.get('trailerAddict.url'),
            token: config.get('trailerAddict.token')
        };
        var param = 'titanic-1997';
        var result = fetcher.fetch(param, opts);
        result.then(function(data) {
            data.should.have.property('imdb');
            data.should.have.property('metadata');
            data.should.have.property('trailerFrame');
            done();
        }, function(error) {
            assert.fail(error);
            done();
        });
    });
    it('should return data for showing trailer without trailer frame', function(done) {
        var opts = {
            viaUrl: config.get('via.url'),
            traileAddictUrl: config.get('trailerAddict.url'),
            token: config.get('trailerAddict.token')
        };
        var param = 'evening-2007';
        var result = fetcher.fetch(param, opts);
        result.then(function(data) {
            data.should.have.property('imdb');
            data.should.have.property('metadata');
            data.should.have.property('trailerFrame');
            done();
        }, function(error) {
            assert.fail(error);
            done();
        });
    });
});