'use strict';

var logger = require('../common/logger'),
    url = require('url'),
    request = require('request'),
    $q = require('q'),
    xml2js = require('xml2js');

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

function sendHTTPRequest(url, reqOpts, method) {
    var deferred = $q.defer();
    if (!reqOpts) {
        reqOpts = {
            TIMEOUT: 500
        };
    }

    reqOpts.url = url;
    reqOpts.method = method;
    wrapRequest(deferred, reqOpts);
    return deferred.promise;
}

function Fetcher(reqOpts) {
    this.reqOpts = reqOpts || {};
    if (!this.reqOpts.TIMEOUT) {
        this.reqOpts.TIMEOUT = 100;
    }
}

function fetchTrailer(params) {
    var imdbId = params.imdb.id;
    var trailerAddictUrl = params.opts.traileAddictUrl;
    var token = params.opts.token;
    var url = buildURL(trailerAddictUrl, imdbId, token);
    var deferred = $q.defer();
    get(url, params.reqOpts)
        .then(function(taResp) {
            logger.debug('Processing Trailer Addict Frame response');
            parser.parseString(taResp.body, function(err, result) {
                var frameSource = 'http://v.traileraddict.com/';
                var trailerId = getTrailerId(result);
                if (trailerId === undefined) {
                    frameSource = undefined;
                } else {
                    frameSource += trailerId;
                }
                deferred.resolve({
                    imdb: params.imdb,
                    metadata: params.metadata,
                    trailerUrl: frameSource
                });

            });
        })
        .fail(function(fail) {
            logger.error('Error: ' + fail);
            deferred.reject(fail);
        });
    return deferred.promise;
}

Fetcher.prototype = {
    fetch: function(filmId, opts) {
        var viaUrl = opts.viaUrl + filmId;
        var reqOpts = this.reqOpts;
        return get(viaUrl, reqOpts)
            .then(function(viaPlayResponse) {
                logger.debug('Processing VIA Content response');
                var data = JSON.parse(viaPlayResponse.body);
                var result = retrieveFilmMetadata(data);
                result.opts = opts;
                result.reqOpts = reqOpts;
                return result;
            })
            .then(fetchTrailer);
    }
};

function getTrailerId(data) {
    var trailers = data.trailers;
    if (trailers === undefined || trailers.trailer === undefined || trailers.trailer.length === 0) {
        return undefined;
    }
    return trailers.trailer[0].trailer_id;
}

function buildURL(str, imdb, token) {
    var obj = url.parse(str);
    if (obj.query === null) {
        obj.query = {};
    }
    str += '&imdb=' + imdb;
    str += '&k=' + token;
    return str;
}

function retrieveFilmMetadata(data) {
    var content = data._embedded['viaplay:blocks'][0]._embedded['viaplay:product'].content;
    var imdb = content.imdb;
    var title = content.title;
    var synopsis = content.synopsis;
    imdb.id = imdb.id.substring(2);
    return {
        imdb: imdb,
        metadata: {
            title: title,
            description: synopsis
        }
    };
}

function buildUrl(protocol, host, url) {
    return protocol + '://' + host + url;
}

module.exports = new Fetcher({
    TIMEOUT: 500
});