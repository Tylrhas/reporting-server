const throttledRequest = require('../config/throttled_request_promise')
const LPauth = "Basic " + new Buffer(process.env.LpUserName + ":" + process.env.LPPassword).toString("base64")
const db = require('../models')

module.exports = {
  update
}

async function update (req, res) {
  if (req) {
   res.sendStatus(201)
  }
  var locations
  start_date = null
  if (req && req.body.start_date) {
   // check if there is a start date
   start_date = req.body.start_date
  }
  locations = await lbs.getAnalyticsReport(start_date)
  locations = locations.rows
  for (let i = 0; i < locations.length; i++) {
   // update each lbs with the new info
   console.log(locations[i])
   // parse out the location ID
   let splitName = locations[i].name.split(/\s(.+)/, 2)
   let LBSId = splitName[0]
   let locationName = splitName[1]
   // create the update object
   let update = {
    task_id: locations[i]["key"],
    location_name: locationName,
    project_id: locations[i]["project_id"],
    stage: locations[i]["pick_list_custom_field:102670"],
    original_estimated_go_live: locations[i]["date_custom_field:151494"],
    estimated_go_live: locations[i]["date_custom_field:147376"],
    actual_go_live: locations[i]["date_custom_field:151495"],
    website_launch_date: locations[i]["date_custom_field:151496"],
    start_date: locations[i]["date_custom_field:151496"],
    project_lost_date: locations[i]["date_custom_field:151564"],
   }
   await lbs.update({ id: LBSId }, update)
  }
  await updateJob('update_lbs', 'complete')
 }