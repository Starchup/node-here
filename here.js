/**
 * Modules from the community: package.json
 */
var request = require('request-promise');

var ROUTE_API = 'https://route.api.here.com';
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

                if (response && response.response) return response.response;
                if (response && response.Response) return response.Response;

                throw new Error('No response');
            });
        }
    };

    self.Route = {
        CalculateTravelTimes: function (routeStops, departureTime, disableTraffic)
        {
            return self.Util.validateArrayProm(routeStops, 'routeStops',
            {
                min: 2
            }).then(function ()
            {
                if (!departureTime || departureTime === undefined) departureTime = new Date();
                else if (!self.Util.isDate(departureTime)) throw new Error('Departure must be a date');

                var query = 'mode=fastest;car;traffic:' + (disableTraffic ? 'disabled' : 'enabled');
                query += '&routeAttributes=summary,legs&legAttributes=length,travelTime,summary';
                query += '&departure=' + departureTime.toISOString();

                routeStops.forEach(function (stop, idx)
                {
                    var label = stop.key ? stop.key : idx;
                    var coordinates = self.Util.coordinatesString(stop);

                    query += '&waypoint' + String(idx) + '=geo!' + coordinates + ';;' + label;
                });

                return self.Request.CreateRequest('GET', ROUTE_API, 'routing', 7.2, 'calculateroute', query);
            }).then(function (response)
            {
                var route = response.route[0];

                return {
                    travelTime: route.summary.travelTime,
                    distance: route.summary.distance,
                    startTime: departureTime.getTime() / 1000,
                    legs: route.leg.map(function (l)
                    {
                        return {
                            start:
                            {
                                key: l.start.userLabel,
                                latitude: l.start.mappedPosition.latitude,
                                longitude: l.start.mappedPosition.longitude
                            },
                            end:
                            {
                                key: l.end.userLabel,
                                latitude: l.end.mappedPosition.latitude,
                                longitude: l.end.mappedPosition.longitude
                            },
                            travelTime: l.travelTime,
                            distance: l.length
                        };
                    })
                };
            });
        }
    };

    self.Address = {
        Geocode: function (address)
        {
            return self.Util.validateArgumentProm(address, 'address').then(function ()
            {
                return self.Util.validateArgumentProm(address.street, 'street');

            }).then(function ()
            {
                return self.Util.validateArgumentProm(address.zip, 'zip');
            }).then(function ()
            {
                var addressArray = [];
                addressArray.push(address.street.split(' ').join('+'));
                if (address.unit) addressArray.push('Unit+' + address.unit.split(' ').join('+'));
                if (address.city) addressArray.push(address.city.split(' ').join('+'));
                if (address.state) addressArray.push(address.state.split(' ').join('+'));
                addressArray.push(address.zip.split(' ').join('+'));

                var query = 'searchtext=' + addressArray.join('+') + '&additionaldata=PreserveUnitDesignators,true;';

                return self.Request.CreateRequest('GET', GEO_API, null, 6.2, 'geocode', query);
            }).then(function (response)
            {

                var data;
                try
                {
                    data = locationData = response.View[0].Result[0].Location;
                }
                catch (e)
                {
                    throw new Error('Address could not be geocoded');
                }

                if (!data) throw new Error('Address could not be geocoded');

                var unit = data.Address.AdditionalData.find(function (d)
                {
                    return d.key === 'Unit';
                });

                return {
                    location:
                    {
                        latitude: data.DisplayPosition.Latitude,
                        longitude: data.DisplayPosition.Longitude
                    },
                    address:
                    {
                        street: data.Address.HouseNumber + ' ' + data.Address.Street,
                        unit: unit ? unit.value : null,
                        city: data.Address.City,
                        state: data.Address.State,
                        zip: data.Address.PostalCode,
                        country: data.Address.Country
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

        validateArray: function (arg, name, options)
        {
            self.Util.validateArgument(arg, name);

            if (arg.length < 1)
            {
                throw new Error('Required argument missing data: ' + name);
            }
            if (options.min && arg.length < options.min)
            {
                throw new Error('Argument missing data (' + options.min + ' required, ' + arg.length + ' passed): ' + name);
            }
        },

        validateArgumentProm: function (arg, name)
        {
            return Promise.resolve().then(function ()
            {
                self.Util.validateArgument(arg, name);
            });
        },

        validateArrayProm: function (arg, name, options)
        {
            return Promise.resolve().then(function ()
            {
                self.Util.validateArray(arg, name, options);
            });
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