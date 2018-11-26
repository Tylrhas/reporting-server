var db = require('../models')
var request = require('../config/throttled_request_promise')
var LP_lbs_url = process.env.LP_LBS_UPDATE
var LPauth = "Basic " + new Buffer(process.env.LpUserName + ":" + process.env.LPPassword).toString("base64");
var workspaceId = process.env.LPWorkspaceId
const auth = "Basic " + new Buffer(process.env.LpUserName + ":" + process.env.LPPassword).toString("base64");
var slack = require('../lib/error')
module.exports = {
 getAnalyticsReport,
 update,
 get,
 getNSUpdate,
 getNSProjectUpdate,
 backfill
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

async function backfill(json) {
 for(let i = 0; i < json.length; i++ ) {
  let lbs = json[i]
  // get the task ID for the LBS
  var taskId = await db.lbs.findOne({
   where: {
    id: lbs['Internal ID']
   },
   attributes: ['task_id']
  })
  let updateObject = {
   task: {}
  }
  updateObject.task.custom_field_values = {
   'Original Estimated Launch Date' :lbs['Original Estimated Go-Live Date 2'],
   'Location Stage': lbs['OpenAir: Project Stage'],
   'Estimated Go-Live': lbs['Estimated Go-Live Date (Day)'],
  }
  if(lbs.hasOwnProperty('Go-Live Date (Day)')) {
   updateObject.task.custom_field_values['Services Activated Date'] = lbs['Go-Live Date (Day)']
   updateObject.task.custom_field_values['Website Launch Date'] = lbs['Website Launch Date']
  }
  let updateURL = `https://app.liquidplanner.com/api/v1/workspaces/${workspaceId}/tasks/${taskId.task_id}`
   // post the updates to LP
  var updateTask = await request.promise({
   url: updateURL,
   method: 'PUT',
   headers: { "Authorization": auth }, 
   json: updateObject
  })
  if (updateTask.type === 'Error') {
   // post to slack
   slack.sendError(updateObject, updateTask.message)
  }
 }
}