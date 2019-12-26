/**
 * Modules from the community: package.json
 */
var request = require('request-promise');

var ROUTE_API = 'https://route.api.here.com';
var GEO_API = 'https://geocoder.api.here.com';
var OPTIMIZE_API = 'https://wse.api.here.com'; // v2 findsequence
var MATRIX_API = 'https://matrix.route.api.here.com';

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
                if (response && response.results) return response.results;

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
        },
        Optimize: function (start, end, waypoints, departureTime, disableTraffic)
        {
            return self.Util.validateArgumentProm(start, 'start').then(function ()
            {
                return self.Util.validateArgumentProm(end, 'end');
            }).then(function ()
            {
                return self.Util.validateArrayProm(waypoints, 'waypoints',
                {
                    min: 1
                });
            }).then(function ()
            {
                if (!departureTime || departureTime === undefined) departureTime = new Date();
                else if (!self.Util.isDate(departureTime)) throw new Error('Departure must be a date');

                var departure = departureTime.toISOString();

                var query = 'mode=fastest;car;traffic:' + (disableTraffic ? 'disabled' : 'enabled');
                query += '&departure=' + departure.substring(0, departure.length - 5) + 'Z';

                var label = start.key ? start.key : idx;
                var coordinates = self.Util.coordinatesString(start);
                query += '&start=' + label + ';' + coordinates;

                waypoints.forEach(function (stop, idx)
                {
                    var label = stop.key ? stop.key : idx;
                    var coordinates = self.Util.coordinatesString(stop);

                    query += '&destination' + String(idx + 1) + '=' + label + ';' + coordinates;
                });

                label = end.key ? end.key : idx;
                coordinates = self.Util.coordinatesString(end);
                query += '&end=' + label + ';' + coordinates;

                return self.Request.CreateRequest('GET', OPTIMIZE_API, null, 2, 'findsequence', query);
            }).then(function (response)
            {
                var route = response[0];
                return {
                    time: route.time,
                    distance: route.distance,
                    startTime: departureTime.getTime() / 1000,
                    waypoints: route.waypoints.map(function (w)
                    {
                        return {
                            key: w.id,
                            latitude: w.lat,
                            longitude: w.lng,
                            sequence: w.sequence,
                            estimatedDeparture: w.estimatedDeparture
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

    self.Points = {
        CalculateTravelTimes: function (origins, destinations, departureTime, disableTraffic)
        {
            var originsByIndex = {};
            var destinationsByIndex = {};

            return self.Util.validateArrayProm(origins, 'origins').then(function ()
            {
                return self.Util.validateArrayProm(destinations, 'destinations');
            }).then(function ()
            {
                if (!departureTime || departureTime === undefined) departureTime = new Date();
                else if (!self.Util.isDate(departureTime)) throw new Error('Departure must be a date');


                var query = 'mode=fastest;car;traffic:' + (disableTraffic ? 'disabled' : 'enabled');
                query += '&summaryAttributes=traveltime,distance&matrixAttributes=summary';
                query += '&departure=' + departureTime.toISOString();

                origins.forEach(function (waypoint, idx)
                {
                    var label = waypoint.key ? waypoint.key : idx;
                    var coordinates = self.Util.coordinatesString(waypoint);
                    query += '&start' + String(idx) + '=geo!' + coordinates;
                    originsByIndex[idx] = label;
                });
                destinations.forEach(function (waypoint, idx)
                {
                    var label = waypoint.key ? waypoint.key : idx;
                    var coordinates = self.Util.coordinatesString(waypoint);
                    query += '&destination' + String(idx) + '=geo!' + coordinates;
                    destinationsByIndex[idx] = label;
                });

                return self.Request.CreateRequest('GET', MATRIX_API, 'routing', 7.2, 'calculatematrix', query);
            }).then(function (response)
            {
                return response.matrixEntry.map(function (l)
                {
                    l.startLabel = originsByIndex[l.startIndex];
                    l.destinationLabel = destinationsByIndex[l.destinationIndex];

                    return {
                        start: l.startLabel,
                        end: l.destinationLabel,
                        travelTime: l.summary.travelTime,
                        distance: l.summary.distance
                    };
                });
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
            if (options && options.min && arg.length < options.min)
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

            this.validateArgument(coordinates.lat || coordinates.latitude, 'Coordinates is missing lat attribute');
            this.validateArgument(coordinates.lng || coordinates.longitude, 'Coordinates is missing lng attribute');

            return (coordinates.lat || coordinates.latitude) + ',' + (coordinates.lng || coordinates.longitude);
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