/**
 * Modules from the community: package.json
 */
var request = require('request-promise');

var ROUTE_API = 'https://route.cit.api.here.com';
var GEO_API = 'https://geocoder.api.here.com';

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
                if (!response || !response.Response) throw new Error('No response');
                return response.Response;
            });
        }
    };

    self.Route = {
        Calculate: function (origin, destination, mode, departure, waypoints)
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

            if (waypoints && waypoints.length)
            {
                waypoints.forEach(function (waypoint, idx)
                {
                    query['waypoint' + String(idx + 1)] = self.Util.coordinatesString(waypoint);
                });
                query['waypoint' + String(waypoints.length + 1)] = self.Util.coordinatesString(destination);
            }

            return self.Request.CreateRequest('GET', ROUTE_API, 'routing', 7.2, 'calculateroute', query).then(function (response)
            {
                return response.route[0];
            });
        },
    };

    self.Address = {
        Geocode: function (address)
        {
            self.Util.validateArgument(address, 'address');
            self.Util.validateArgument(address.street, 'street');
            self.Util.validateArgument(address.city, 'city');
            self.Util.validateArgument(address.zip, 'zip');

            var addressArray = [];
            addressArray.push(address.street.split(' ').join('+'));
            addressArray.push(address.city.split(' ').join('+'));
            if (address.state) addressArray.push(address.state.split(' ').join('+'));
            addressArray.push(address.zip.split(' ').join('+'));

            var addressString = addressArray.join('+');

            return self.Request.CreateRequest('GET', GEO_API, null, 6.2, 'geocode', 'searchtext=' + addressString).then(function (response)
            {
                var locationData, addressData;
                try
                {
                    locationData = response.View[0].Result[0].Location.DisplayPosition;
                }
                catch (e)
                {
                    throw new Error('Address could not be geocoded');
                }
                try
                {
                    addressData = response.View[0].Result[0].Location.Address;
                }
                catch (e)
                {
                    throw new Error('Address could not be found for geocoding');
                }

                if (!locationData) throw new Error('Address could not be geocoded');
                if (!addressData) throw new Error('Address could not be found for geocoding');

                return {
                    location:
                    {
                        lat: locationData.Latitude,
                        lng: locationData.Longitude
                    },
                    address:
                    {
                        street: addressData.Street,
                        city: addressData.City,
                        state: addressData.State,
                        zip: addressData.PostalCode,
                        country: addressData.Country
                    }
                };
            });
        }
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
            var url = '';
            if (resource) url = url + '/' + resource;
            if (version) url = url + '/' + version;
            if (method) url = url + '/' + method + '.json';

            url = url + '?app_id=' + self.CONFIG.AppId;
            url = url + '&app_code=' + self.CONFIG.AppCode;

            if (query) url = url + '&' + query;

            return url;
        }
    };

    self.Util.validateArgument(config.AppId, 'AppId');
    self.Util.validateArgument(config.AppCode, 'AppCode');

    self.CONFIG = JSON.parse(JSON.stringify(config));

    return self;
};

module.exports = HERE;