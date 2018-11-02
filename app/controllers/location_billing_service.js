var db = require('../models')
var request = require('../config/throttled_request_promise')
var LP_lbs_url = process.env.LP_LBS_UPDATE
var LPauth = "Basic " + new Buffer(process.env.LpUserName + ":" + process.env.LPPassword).toString("base64");
module.exports = {
 getAnalyticsReport,
 update,
 get,
 getNSUpdate,
 getNSProjectUpdate
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

function getNSProjectUpdate (date) {
 if (date) {
  return db.sequelize.query(`
  SELECT lbs.master_project_id, date.estimated_go_live, date.actual_go_live, date.original_estimated_go_live, date.start_date, date.website_launch_date, lbs.stage, COUNT(lbs.stage) AS stage_count
  FROM lbs AS lbs
  JOIN (
   SELECT master_project_id, MAX(estimated_go_live) AS estimated_go_live, MAX(actual_go_live) AS actual_go_live, MAX(original_estimated_go_live) AS original_estimated_go_live, MAX(start_date) AS start_date, MAX(website_launch_date) AS website_launch_date
   FROM lbs  
   GROUP BY master_project_id
  ) date ON date.master_project_id = lbs.master_project_id
  WHERE lbs."updatedAt" >= :date AND lbs.master_project_id = 2359350
  GROUP BY lbs.master_project_id, date.estimated_go_live,date.actual_go_live, date.original_estimated_go_live, date.start_date, date.website_launch_date, lbs.stage`,
  {
   replacements: {date: date}, 
  type: db.sequelize.QueryTypes.SELECT
 }
 )
 } else {
  return db.lbs.findAll({
   attributes: [['master_project_id','Internal ID'], ['estimated_go_live', 'Current Estimated Go-Live Date'], ['actual_go_live', 'Actual Go-Live Date'], ['original_estimated_go_live','Original Estimated Go-live'], ['website_launch_date', 'Website Launch Date'], ['start_date', 'Start Date'], ['project_lost_date', 'Project Lost date'], ['stage', 'Stage']],
   order: ['master_project_id']
  })
 }
}