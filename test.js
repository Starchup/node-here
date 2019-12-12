/**
 * Modules from the community: package.json
 */
var HERE = require('./here');
var expect = require('chai').expect;

var conf = {
    AppId: "DemoAppId01082013GAL",
    AppCode: "AJKnXv84fjrb0KIHawS0Tg"
};
var here = new HERE(conf);

describe('CalculateTravelTimes', function ()
{
    var origin = {
        lat: 41.2800,
        lng: -96.0042,
        key: 'business'
    };
    var destination = {
        lat: 41.2939,
        lng: -96.0206,
        key: 'my home'
    };
    var departure = new Date();

    it('should throw error if no waypoints passed', function (done)
    {
        here.Route.CalculateTravelTimes([]).then(function (res)
        {
            done(new Error('No error thrown'));
        }).catch(function (err)
        {
            expect(err).to.be.an('error');
            expect(err.message).to.equal('Required argument missing data: routeStops');

            done();
        });
    });

    it('should throw error if only 1 waypoint passed', function (done)
    {
        here.Route.CalculateTravelTimes([origin]).then(function (res)
        {
            done(new Error('No error thrown'));
        }).catch(function (err)
        {
            expect(err).to.be.an('error');
            expect(err.message).to.equal('Argument missing data (2 required, 1 passed): routeStops');

            done();
        });
    });

    it('should get a car route from A to B', function (done)
    {
        here.Route.CalculateTravelTimes([origin, destination]).then(function (res)
        {
            expect(res).to.be.an('object');
            expect(res.travelTime).to.be.greaterThan(0);
            expect(res.distance).to.be.greaterThan(0);
            expect(res.startTime).to.be.greaterThan(0);
            expect(res.legs).to.be.an('array');
            expect(res.legs.length).to.equal(1);
            expect(res.legs[0]).to.be.an('object');
            expect(res.legs[0].distance).to.be.greaterThan(0);
            expect(res.legs[0].travelTime).to.be.greaterThan(0);
            expect(res.legs[0].start).to.be.an('object');
            expect(res.legs[0].end).to.be.an('object');
            expect(res.legs[0].start.key).to.be.an('string');
            expect(res.legs[0].start.latitude).to.be.an('number');
            expect(res.legs[0].start.longitude).to.be.an('number');
            expect(res.legs[0].end.key).to.be.an('string');
            expect(res.legs[0].end.latitude).to.be.an('number');
            expect(res.legs[0].end.longitude).to.be.an('number');

            done();
        }).catch(done);
    });

    it('should get a car route from A to B with start time', function (done)
    {
        here.Route.CalculateTravelTimes([origin, destination], departure).then(function (res)
        {
            expect(res).to.be.an('object');
            expect(res.travelTime).to.be.greaterThan(0);
            expect(res.distance).to.be.greaterThan(0);
            expect(res.startTime).to.equal(departure.getTime() / 1000);
            expect(res.legs).to.be.an('array');
            expect(res.legs.length).to.equal(1);
            expect(res.legs[0]).to.be.an('object');
            expect(res.legs[0].distance).to.be.greaterThan(0);
            expect(res.legs[0].travelTime).to.be.greaterThan(0);
            expect(res.legs[0].start).to.be.an('object');
            expect(res.legs[0].end).to.be.an('object');
            expect(res.legs[0].start.key).to.be.an('string');
            expect(res.legs[0].start.latitude).to.be.an('number');
            expect(res.legs[0].start.longitude).to.be.an('number');
            expect(res.legs[0].end.key).to.be.an('string');
            expect(res.legs[0].end.latitude).to.be.an('number');
            expect(res.legs[0].end.longitude).to.be.an('number');

            done();
        }).catch(done);
    });

    var waypoint1 = {
        lat: 41.2852,
        lng: -96.0110,
        key: 'my friend'
    };

    it('should get a car route from A to B via C', function (done)
    {
        here.Route.CalculateTravelTimes([origin, waypoint1, destination]).then(function (res)
        {
            expect(res).to.be.an('object');
            expect(res.travelTime).to.be.greaterThan(0);
            expect(res.distance).to.be.greaterThan(0);
            expect(res.startTime).to.be.greaterThan(0);
            expect(res.legs).to.be.an('array');
            expect(res.legs.length).to.equal(2);
            expect(res.legs[0]).to.be.an('object');
            expect(res.legs[0].start).to.be.an('object');
            expect(res.legs[0].end).to.be.an('object');
            expect(res.legs[0].distance).to.be.greaterThan(0);
            expect(res.legs[0].travelTime).to.be.greaterThan(0);
            expect(res.legs[0].start.key).to.equal('business');
            expect(res.legs[0].start.latitude).to.be.an('number');
            expect(res.legs[0].start.longitude).to.be.an('number');
            expect(res.legs[0].end.key).to.equal('my friend');
            expect(res.legs[0].end.latitude).to.be.an('number');
            expect(res.legs[0].end.longitude).to.be.an('number');

            expect(res.legs[1]).to.be.an('object');
            expect(res.legs[1].start).to.be.an('object');
            expect(res.legs[1].end).to.be.an('object');
            expect(res.legs[1].distance).to.be.greaterThan(0);
            expect(res.legs[1].travelTime).to.be.greaterThan(0);
            expect(res.legs[1].start.key).to.equal('my friend');
            expect(res.legs[1].start.latitude).to.be.an('number');
            expect(res.legs[1].start.longitude).to.be.an('number');
            expect(res.legs[1].end.key).to.equal('my home');
            expect(res.legs[1].end.latitude).to.be.an('number');
            expect(res.legs[1].end.longitude).to.be.an('number');

            done();
        }).catch(done);
    });

    var tomorrow = new Date(departure);
    tomorrow.setDate(tomorrow.getDate() + 1);

    it('should get a car route from A to B via C in the future', function (done)
    {
        here.Route.CalculateTravelTimes([origin, waypoint1, destination], tomorrow).then(function (res)
        {
            expect(res).to.be.an('object');
            expect(res.travelTime).to.be.greaterThan(0);
            expect(res.distance).to.be.greaterThan(0);
            expect(res.startTime).to.equal(tomorrow.getTime() / 1000);
            expect(res.legs).to.be.an('array');
            expect(res.legs.length).to.equal(2);
            expect(res.legs[0]).to.be.an('object');
            expect(res.legs[0].start).to.be.an('object');
            expect(res.legs[0].end).to.be.an('object');
            expect(res.legs[0].distance).to.be.greaterThan(0);
            expect(res.legs[0].travelTime).to.be.greaterThan(0);
            expect(res.legs[0].start.key).to.equal('business');
            expect(res.legs[0].start.latitude).to.be.an('number');
            expect(res.legs[0].start.longitude).to.be.an('number');
            expect(res.legs[0].end.key).to.equal('my friend');
            expect(res.legs[0].end.latitude).to.be.an('number');
            expect(res.legs[0].end.longitude).to.be.an('number');

            expect(res.legs[1]).to.be.an('object');
            expect(res.legs[1].start).to.be.an('object');
            expect(res.legs[1].end).to.be.an('object');
            expect(res.legs[1].distance).to.be.greaterThan(0);
            expect(res.legs[1].travelTime).to.be.greaterThan(0);
            expect(res.legs[1].start.key).to.equal('my friend');
            expect(res.legs[1].start.latitude).to.be.an('number');
            expect(res.legs[1].start.longitude).to.be.an('number');
            expect(res.legs[1].end.key).to.equal('my home');
            expect(res.legs[1].end.latitude).to.be.an('number');
            expect(res.legs[1].end.longitude).to.be.an('number');

            done();
        }).catch(done);
    });
});

describe('Geocoding Integration', function ()
{
    var address = {
        "street": "4629 North Broadway Street",
        "unit": null,
        "city": "Chicago",
        "state": "IL",
        "zip": "60640",
        "country": "US",
        "timezone": "America/Chicago"
    };

    it('should geocode address', function (done)
    {
        here.Address.Geocode(address).then(function (res)
        {
            expect(res).to.be.an('object');

            done();
        }).catch(done);
    });
});