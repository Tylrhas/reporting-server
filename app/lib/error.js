var exports = module.exports = {}
throttledRequest = require('../config/throttled_request')

exports.sendError = slackErrorReport

function slackErrorReport (body, e) {
  throttledRequest({
    url: process.env.SLACK_WEBHOOK_URL,
    method: 'POST',
    json: {
      text: "Error: " + e + "\nBody: " + JSON.stringify(body)
    }
  }, (error, response, body) => {
    console.log(body);
  })
}