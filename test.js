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

describe('Matrix Integration', function ()
{
    var origin1 = {
        lat: 41.2800,
        lng: -96.0042,
        key: 'business'
    };
    var origin2 = {
        lat: 41.2800,
        lng: -96.0050,
        key: 'business'
    };
    var destination1 = {
        lat: 41.2939,
        lng: -96.0206,
        key: 'my home'
    };
    var destination2 = {
        lat: 41.2799,
        lng: -96.0164,
        key: 'my friend'
    };

    it('should get the closest destiation to points', function (done)
    {
        here.Points.CalculateTravelTimes([origin1, origin2], [destination1, destination2]).then(function (res)
        {
            expect(res).to.be.an('array');
            expect(res.length).to.equal(4);
            res.forEach(function (r, idx)
            {
                expect(res[idx]).to.be.an('object');
                expect(res[idx].start).to.be.an('string');
                expect(res[idx].end).to.be.an('string');
                expect(res[idx].travelTime).to.be.an('number');
                expect(res[idx].distance).to.be.an('number');
            });

            done();
        }).catch(done);
    });
});

describe('Geocoding Integration', function ()
{
    var address = {
        "street": "4629 N Broadway St",
        "city": "Chicago",
        "state": "IL",
        "zip": "60640",
        "country": "USA"
    };

    var addressWithOtherFormt = {
        "street": "4629 North Broadway Str",
        "city": "Chicago",
        "state": "Illiois",
        "zip": "60640",
        "country": "US"
    };

    var location = {
        latitude: 41.96628,
        longitude: -87.6577
    };

    it('should throw error when missing street', function (done)
    {
        var addressMinimal = JSON.parse(JSON.stringify(address));
        delete addressMinimal.street;

        here.Address.Geocode(addressMinimal).then(function (res)
        {
            done(new Error('No error thrown'));
        }).catch(function (err)
        {
            expect(err).to.be.an('error');
            expect(err.message).to.equal('Required argument missing: street');

            done();
        });
    });


    it('should throw error when missing zip', function (done)
    {
        var addressMinimal = JSON.parse(JSON.stringify(address));
        delete addressMinimal.zip;

        here.Address.Geocode(addressMinimal).then(function (res)
        {
            done(new Error('No error thrown'));
        }).catch(function (err)
        {
            expect(err).to.be.an('error');
            expect(err.message).to.equal('Required argument missing: zip');

            done();
        });
    });

    it('should geocode address', function (done)
    {
        here.Address.Geocode(address).then(function (res)
        {
            expect(res).to.be.an('object');
            expect(res.address).to.be.an('object');
            expect(res.location.latitude).to.equal(location.latitude);
            expect(res.location.longitude).to.equal(location.longitude);

            expect(res.address.street).to.equal(address.street);
            expect(res.address.city).to.equal(address.city);
            expect(res.address.state).to.equal(address.state);
            expect(res.address.zip).to.equal(address.zip);
            expect(res.address.country).to.equal(address.country);

            done();
        }).catch(done);
    });

    it('should geocode address with unit', function (done)
    {
        address.unit = '1W';
        here.Address.Geocode(address).then(function (res)
        {
            expect(res).to.be.an('object');
            expect(res.address).to.be.an('object');
            expect(res.location.latitude).to.equal(location.latitude);
            expect(res.location.longitude).to.equal(location.longitude);

            expect(res.address.street).to.equal(address.street);
            expect(res.address.city).to.equal(address.city);
            expect(res.address.state).to.equal(address.state);
            expect(res.address.zip).to.equal(address.zip);
            expect(res.address.country).to.equal(address.country);
            expect(res.address.unit).to.equal(address.unit);

            done();
        }).catch(done);
    });

    it('should geocode address with different street format', function (done)
    {
        here.Address.Geocode(addressWithOtherFormt).then(function (res)
        {
            expect(res).to.be.an('object');
            expect(res.address).to.be.an('object');
            expect(res.location.latitude).to.equal(location.latitude);
            expect(res.location.longitude).to.equal(location.longitude);

            expect(res.address.street).to.equal(address.street);
            expect(res.address.city).to.equal(address.city);
            expect(res.address.state).to.equal(address.state);
            expect(res.address.zip).to.equal(address.zip);
            expect(res.address.country).to.equal(address.country);

            done();
        }).catch(done);
    });


    it('should geocode address with different street format', function (done)
    {
        var addressMinimal = JSON.parse(JSON.stringify(address));
        delete addressMinimal.city;
        delete addressMinimal.state;
        delete addressMinimal.country;

        here.Address.Geocode(addressMinimal).then(function (res)
        {

            expect(res).to.be.an('object');
            expect(res.address).to.be.an('object');
            expect(res.location.latitude).to.equal(location.latitude);
            expect(res.location.longitude).to.equal(location.longitude);

            expect(res.address.street).to.equal(address.street);
            expect(res.address.city).to.equal(address.city);
            expect(res.address.state).to.equal(address.state);
            expect(res.address.zip).to.equal(address.zip);
            expect(res.address.country).to.equal(address.country);

            done();
        }).catch(done);
    });
});