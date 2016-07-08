'use strict';

var logger = require('../common/logger');
var url = require('url');
var request = require('request');
var $q = require('q');
var xml2js = require('xml2js');

var parser = new xml2js.Parser();

function wrapRequest(deferred, opts) {
    var before = Date.now(),
        info = ' ' + opts.method + ' ' + opts.url;
    request(opts, function(error, response, body) {
        if (error || (response.statusCode < 200 || response.statusCode >= 400)) {
            logger.error(info + ' FAILED (' + (Date.now() - before) + 'ms)');
            deferred.reject({
                error: error,
                response: response,
                body: body
            });
        } else {
            logger.info(info + ' ' + response.statusCode + '(' + (Date.now() - before) + 'ms)');
            deferred.resolve({
                response: response,
                body: body
            });
        }
    });
}

function get(url, opts) {
    logger.debug('Fetcher: GET: ' + url);
    return sendHTTPRequest(url, opts, 'GET');
}

function post(url, opts) {
    return sendHTTPRequest(url, opts, 'POST');
}

function sendHTTPRequest(url, opts, method) {
    var deferred = $q.defer();
    if (!opts) {
        opts = {
            TIMEOUT: 100
        };
    }

    opts.url = url;
    opts.method = method;
    wrapRequest(deferred, opts);
    return deferred.promise;
}

function Fetcher(opts) {
    this.opts = opts || {};
    if (!this.opts.MAX_RETRIES) {
        this.opts.MAX_RETRIES = 3;
    }
    if (!this.opts.TIMEOUT) {
        this.opts.TIMEOUT = 100;
    }
}

function fetchTrailer(params) {
    var imdbId = params.imdb.id.substring(2);
    var trailerAddictUrl = params.opts.traileAddictUrl;
    var token = params.opts.token;
    var url = buildURL(trailerAddictUrl, imdbId, token);
    var deferred = $q.defer();
    get(url)
        .then(function(taResp) {
            logger.debug('Processing Trailer Addict Frame response');
            parser.parseString(taResp.body, function(err, result) {
                var frame = result.trailers.trailer[0].embed[0];
                deferred.resolve({
                    imdb: params.imdb,
                    metadata: params.metadata,
                    trailerFrame: frame
                });

            });
        })
        .fail(function(fail) {
            deferred.reject(fail);
        });
    return deferred.promise;
}

Fetcher.prototype = {
    fetch: function(filmId, opts) {
        var viaUrl = opts.viaUrl + filmId;
        return get(viaUrl)
            .then(function(viaPlayResponse) {
                logger.debug('Processing VIA Content response');
                var data = JSON.parse(viaPlayResponse.body);
                var imdb = retrieveIMDB(data);
                return {
                    imdb: imdb,
                    metadata: {
                        title: data.title,
                        description: data.description,
                    },
                    opts: opts
                };
            })
            .then(fetchTrailer);
    }
};

function buildURL(str, imdb, token) {
    var obj = url.parse(str);
    if (obj.query === null) {
        obj.query = {};
    }
    str += '&imdb=' + imdb;
    str += '&k=' + token;
    return str;
}

function retrieveIMDB(data) {
    var imdbId = data._embedded['viaplay:blocks'][0]._embedded['viaplay:product'].content.imdb;
    return imdbId;
}

function buildUrl(protocol, host, url) {
    return protocol + '://' + host + url;
}

function processServerResponse(serverResp) {
    var body = JSON.parse(serverResp.body);
    delete body.secret;
    return JSON.stringify(body);
}

module.exports = new Fetcher({
    TIMEOUT: 100
});