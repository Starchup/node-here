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
        lat: 52.5160,
        lng: 13.3779
    };
    var destination = {
        lat: 52.5206,
        lng: 13.3862
    };
    var mode = 'fastest;car;traffic:enabled';
    var departure = null;

    it('should get a car route from A to B', function (done)
    {
        here.Route.Calculate(origin, destination, mode, departure).then(function (res)
        {
            expect(res).to.be.an('array');

            done();
        }).catch(done);
    });
});
