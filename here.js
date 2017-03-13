/**
 * Modules from the community: package.json
 */
var request = require('request-promise');

var API_ROUTE = 'https://route.cit.api.here.com';

/**
 * Constructor
 */
var HERE = function (config)
{
    var self = this;

    self.Request = {

        CreateRequest: function (httpMethod, baseUrl, resource, version, method, query)
        {
            self.Util.validateArgument(httpMethod, 'httpMethod');
            self.Util.validateArgument(baseUrl, 'baseUrl');
            self.Util.validateArgument(resource, 'resource');
            self.Util.validateArgument(method, 'method');
            self.Util.validateArgument(query, 'query');

            if (version === undefined) version = null;

            var url = self.Util.buildUrl(resource, version, method, query);
            var options = {
                uri: baseUrl + url,
                method: httpMethod
            };

            return request(options).then(function (res)
            {
                var response = JSON.parse(res);
                if (!response || !response.response) throw new Error('No response');
                return response.response.route;
            });
        }
    };

    self.Route = {
        Calculate: function (origin, destination, mode, departure)
        {
            self.Util.validateArgument(origin, 'origin');
            self.Util.validateArgument(destination, 'destination');
            self.Util.validateArgument(mode, 'mode');

            if (!departure || departure === undefined) departure = new Date();
            else if (!self.Util.isDate(departure)) throw new Error('Departure must be a date');

            var query = {
                mode: mode,
                departure: departure.toISOString(),
                waypoint0: self.Util.coordinatesString(origin),
                waypoint1: self.Util.coordinatesString(destination)
            };

            return self.Request.CreateRequest('GET', API_ROUTE, 'routing', 7.2, 'calculateroute', query);
        },
    };

    self.Util = {
        validateArgument: function (arg, name)
        {
            if (arg === null || arg === undefined)
            {
                throw new Error('Required argument missing: ' + name);
            }
        },

        isObject: function (prop)
        {
            return Object.prototype.toString.call(prop) === '[object Object]';
        },

        isDate: function (prop)
        {
            return Object.prototype.toString.call(prop) === '[object Date]';
        },

        coordinatesString: function (coordinates)
        {
            if (!this.isObject(coordinates)) throw new Error('Coordinates passed are not valid');

            this.validateArgument(coordinates.lat, 'Coordinates is missing lat attribute');
            this.validateArgument(coordinates.lng, 'Coordinates is missing lng attribute');

            return coordinates.lat + ',' + coordinates.lng;
        },

        buildUrl: function (resource, version, method, query)
        {
            var url = '/' + resource;
            if (version) url = url + '/' + version;
            if (method) url = url + '/' + method + '.json';
            if (query && this.isObject(query) && Object.keys(query).length > 0)
            {
                var queryArray = Object.keys(query).map(function (key, index)
                {
                    return key + '=' + query[key];
                });
                url = url + '?' + queryArray.join('&');
            }
            url = url + '&app_id=' + self.CONFIG.AppId;
            url = url + '&app_code=' + self.CONFIG.AppCode;

            return url;
        }
    };

    self.Util.validateArgument(config.AppId, 'AppId');
    self.Util.validateArgument(config.AppCode, 'AppCode');

    self.CONFIG = JSON.parse(JSON.stringify(config));

    return self;
};

module.exports = HERE;
