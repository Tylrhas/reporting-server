var db = require('../models')
var request = require('../config/throttled_request_promise')
var LP_lbs_url = process.env.LP_LBS_UPDATE
var LPauth = "Basic " + new Buffer(process.env.LpUserName + ":" + process.env.LPPassword).toString("base64");
module.exports = {
 getAnalyticsReport,
 update
}

function getAnalyticsReport () {
 return request.promise({ url: LP_lbs_url, method: 'GET', headers: { "Authorization": LPauth } })
}
function update (where, update) {
db.lbs.update(
 update,
 {
 where: where
})
}