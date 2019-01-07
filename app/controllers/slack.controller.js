const throttledRequest = require('../config/throttled_request_promise')

module.exports = {
  sendError,
  slackErrorReport
}


async function sendError(error) {
  try {
    await throttledRequest.promise({
      url: process.env.SLACK_WEBHOOK_URL,
      method: 'POST',
      json: {
        text: error
      }
    })

  } catch (error) {
    console.error(error)
  }
}

async function slackErrorReport(body, e) {
  try {
    await throttledRequest.promise({
      url: process.env.SLACK_WEBHOOK_URL,
      method: 'POST',
      json: {
        text: "Error: " + e + "\nBody: " + JSON.stringify(body)
      }
    })
  } catch (error) {
    console.error(error)
  }
}