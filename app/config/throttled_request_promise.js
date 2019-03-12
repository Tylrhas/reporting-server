var objectConstructor = {}.constructor
const request = require("request"),
  throttledRequest = require('throttled-request')(request);


//This will throttle the requests so no more than 12 are made every 15 seconds 
throttledRequest.configure({
  requests: 5,
  milliseconds: 15000
})

function promise(args) {
  return new Promise(function (resolve, reject) {
    throttledRequest(args, function (error, response, body) {
      if (error) {
        error = {
          error, response
        }
        reject(error)
      }
      else {
        if (body.constructor === objectConstructor) {
          resolve(body)
        } else {
          try {
            body = JSON.parse(body)
            resolve(body)
          } catch (error) {
            if (error.__proto__.name === 'SyntaxError') {
              resolve(body)
            } else {
              console.error(error)
            }
          }
        }
      }
    })
  })
}

module.exports = {
  promise
}