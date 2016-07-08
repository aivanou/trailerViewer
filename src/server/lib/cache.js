'use strict';

var config = require('config');
var logger = require('../common/logger');

var $q = require('q');
var Dict = require("collections/dict");

function Cache(opts) {
    this.opts = opts;
}

Cache.prototype = {

    cache: new Dict({}, function(key) {
        return undefined;
    }),

    insert: function(key, data) {
        logger.debug('CACHE: inserting into cache: ' + key + '  ' + data);
        var deferred = $q.defer();
        this.cache.add({
            data: data,
            timestamp: Date.now()
        }, key);
        deferred.resolve({
            status: 'success',
            code: 200
        });
        return deferred.promise;
    },

    retrieve: function(key) {
        var deferred = $q.defer();
        var result = this.cache.get(key);
        if (result === undefined) {
            deferred.reject({
                status: 'cache is full',
                code: 500
            });
            return deferred.promise;
        } else if (this.opts.timeout) {
            var pastTime = (Date.now() - result.timestamp) / 1000 | 0;
            logger.debug('CACHE: checking: ' + key + ', time in cache: ' + pastTime + '  ' + this.opts.timeout);
            if (this.opts.timeout > pastTime || this.cache.length >= this.opts.size) {
                this.cache.delete(key);
                deferred.reject({
                    status: 'time expired, or cache too big',
                    code: 500
                });
                return deferred.promise;
            }
        }
        result.timestamp = Date.now();
        this.cache.add(result, key);
        deferred.resolve({
            status: 'success',
            code: 200,
            data: result
        });
        return deferred.promise;
    }
};

module.exports = new Cache({
    timeout: config.get('cache.timeout'),
    size: config.get('cache.size')
});