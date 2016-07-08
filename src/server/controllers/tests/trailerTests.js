'use strict';

var should = require('should'),
    app = require('../../server'),
    request = require('supertest');

describe('GET /filmId', function() {
    it('should respond with OK status', function(done) {
        request(app)
            .get('/pc-se/film/titanic-1997')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.be.instanceof(Object);
                done();
            });
    });
});