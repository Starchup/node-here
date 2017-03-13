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
        lat: 41.2800,
        lng: -96.0042
    };
    var destination = {
        lat: 41.2939,
        lng: -96.0206
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
        lat: 41.2852,
        lng: -96.0110
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
