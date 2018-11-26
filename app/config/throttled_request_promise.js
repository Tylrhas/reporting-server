var throttledRequest = require('./throttled_request')
var objectConstructor = {}.constructor
module.exports = {
 promise
}
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
     resolve(JSON.parse(body))
    }
   }
  })
 })
}