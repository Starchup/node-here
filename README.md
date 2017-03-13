# node-here
Here API wrapper for Node.js, fully promisified

#### Initialization

```
var HERE = require('node-here');
var conf = {
    AppId: "your_api_code",
    AppCode: "your_app_code"
};
var here = new HERE(conf);
```


#### Basic use

See tests for up to date parameters & format

```
here.Route.Calculate(origin, destination, waypoints, mode, departure);
```


#### Tests

`npm test` will run a linter and the tests in `test.js`  
The tests will not pass unless you edit the configuration there and set it to your Fabricare Instance.  
Feel free to use those tests as reference for your implementation.  