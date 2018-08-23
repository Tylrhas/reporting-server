const request = require("request"),
    throttledRequest = require('throttled-request')(request);
//This will throttle the requests so no more than 15 are made every 15 seconds 
throttledRequest.configure({
    requests: 12,
    milliseconds: 15000
})

module.exports = throttledRequest