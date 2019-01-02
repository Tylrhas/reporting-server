var exports = module.exports = {}
var throttledRequest = require('../../config/throttled_request_promise')
//Models
var db = require("../../models");
const url = process.env.lbs_url;
const auth = "Basic " + new Buffer(process.env.LpUserName + ":" + process.env.LPPassword).toString("base64");

//for the hourly job 
exports.update = function (req, res) {

  if (req) {
    res.status(200)
  }
  get_all_Lbs()
}

async function get_all_Lbs() {
  try {
    let results = await throttledRequest.promise({ method: 'GET', url: url, headers: { "Authorization": auth } })
    let updates = []
    for (i = 0; i < Object.keys(results.rows).length; i++) {
      updates.push(insertlbs(results.rows[i]))
    }
    Promise.all(updates).then(() => {
      updateJobStatus('complete')
    })
  } catch (error) {
    updateJobStatus('error')
  }
}

function insertlbs(lbs) {
  return db.lp_lbs.upsert({ id: lbs['key'], task_name: lbs['name'], in_tags: lbs['inherited_tags'], website_type: lbs['pick_list_custom_field:133069'], design_type: lbs['pick_list_custom_field:133070'], project_id: lbs['project_id'], ns_id: lbs['text_custom_field:135152'], billing_type: lbs['pick_list_custom_field:102670'], billing_lost_reason: lbs['pick_list_custom_field:109756'] })
}

function updateJobStatus(status) {
  var date = new Date();
  db.job.upsert({ id: 2, lastrun: date, lastrunstatus: status })
}