var db = require('../models')
var request = require('../config/throttled_request_promise')
var LP_lbs_url = process.env.LP_LBS_UPDATE
var LPauth = "Basic " + new Buffer(process.env.LpUserName + ":" + process.env.LPPassword).toString("base64");
module.exports = {
 getAnalyticsReport,
 update,
 get,
 getNSUpdate
}

function getAnalyticsReport (startDate) {
 if (startDate) {
  return request.promise({ url: LP_lbs_url, method: 'GET', headers: { "Authorization": LPauth } })
 } else {
  return request.promise({ url: LP_lbs_url, method: 'GET', headers: { "Authorization": LPauth } })
 }
}
function update (where, update) {
return db.lbs.update(
 update,
 {
 where: where
})
}

function get(where) {
 if (where) {
  return db.lbs.findAll({
   where: where
  })
 } else {
  return db.lbs.findAll()
 }
}

function getNSUpdate (where) {
 if (where) {
  return db.lbs.findAll({
   attributes: [['id','Internal ID'], ['estimated_go_live', 'Current Estimated Go-Live Date'], ['actual_go_live', 'Actual Go-Live Date'], ['original_estimated_go_live','Original Estimated Go-live'], ['website_launch_date', 'Website Launch Date'], ['start_date', 'Start Date'], ['project_lost_date', 'Project Lost date'], ['stage', 'Stage']],
   where: where
  })
 } else {
  return db.lbs.findAll({
   attributes: [['id','Internal ID'], ['estimated_go_live', 'Current Estimated Go-Live Date'], ['actual_go_live', 'Actual Go-Live Date'], ['original_estimated_go_live','Original Estimated Go-live'], ['website_launch_date', 'Website Launch Date'], ['start_date', 'Start Date'], ['project_lost_date', 'Project Lost date'], ['stage', 'Stage']],
  })
 }
}