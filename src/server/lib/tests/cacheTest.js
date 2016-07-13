'use strict';

var cache = require('../cache'),
    should = require('should'),
    logger = require('../../common/logger');

describe("Internal Cache testing", function() {
    it('should insert value in a cache', function(done) {
        var key = 'key';
        var value = 'value';
        var result = cache.insert(key, value);
        result.then(function(data) {
            data.code.should.be.eql(200);
            done();
        }, function(error) {
            assert.fail(error);
            done();
        });
    });
    it('should fail if the value is not in cache', function(done) {
        var key = 'key1';
        var value = 'value1';
        var result = cache.retrieve(key, value);
        result
            .then(function(data) {
                logger.info(data);
                assert.fail(data);
                done();
            })
            .fail(function(fail) {
                fail.code.should.be.eql(500);
                done();
            });
    });
});