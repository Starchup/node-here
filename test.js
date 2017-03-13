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

describe('Customer Methods', function ()
{
    var origin = {
        lat: 40.7480,
        lng: -73.9862
    };
    var destination = {
        lat: 40.7558,
        lng: -73.9869
    };
    var mode = 'fastest;car;traffic:enabled';
    var departure = null;

    it('should get a car route from A to B', function (done)
    {
        here.Route.Calculate(origin, destination, mode, departure).then(function (res)
        {
            expect(res).to.be.an('object');

            done();
        }).catch(done);
    });

    var waypoint1 = {
        lat: 40.7500,
        lng: -73.9933
    };

    it('should get a car route from A to B via C', function (done)
    {
        here.Route.Calculate(origin, destination, mode, departure, [waypoint1]).then(function (res)
        {
            expect(res).to.be.an('object');

            done();
        }).catch(done);
    });
});
