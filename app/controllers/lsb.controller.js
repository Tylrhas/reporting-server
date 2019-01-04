const throttledRequest = require('../config/throttled_request_promise')
const LPauth = "Basic " + new Buffer(process.env.LpUserName + ":" + process.env.LPPassword).toString("base64")
const db = require('../models')
const dates = require('./dates.controller')
const jobController = require('../controllers/job.controller')
module.exports = {
  update
}

async function update(req, res) {
  if (req) {
    res.sendStatus(201)
  }
  var locations
  start_date = null
  if (req && req.body.start_date) {
    // check if there is a start date
    start_date = req.body.start_date
  }
  locations = await throttledRequest.promise({ url: process.env.LP_LBS_UPDATE, method: 'GET', headers: { "Authorization": LPauth } })
  locations = locations.rows
  for (let i = 0; i < locations.length; i++) {
    let location = locations[i]
    // update each lbs with the new info
    console.log(location)
    // parse out the location ID
    let splitName = location.name.split(/\s(.+)/, 2)
    let LBSId = splitName[0]
    let locationName = splitName[1]

    // create the update object
    let update = {
      task_id: location["key"],
      location_name: locationName,
      project_id: location["project_id"],
      stage: location["pick_list_custom_field:102670"],
      original_estimated_go_live: dates.pst_to_utc(location["date_custom_field:151494"]),
      estimated_go_live: dates.pst_to_utc(location["date_custom_field:147376"]),
      actual_go_live: dates.pst_to_utc(location["date_custom_field:151495"]),
      website_launch_date: dates.pst_to_utc(location["date_custom_field:151496"]),
      start_date: dates.pst_to_utc(location["date_custom_field:151496"]),
      project_lost_date: null,
    }

    let lsb = await db.lbs.findOrCreate({
      where: {
        id: LBSId
      }
    })
    
    if (location['pick_list_custom_field:102670'] === 'Lost') {
      //  check if the location is currently set to lost
      if (!lsbStatusCheck[1] || lsbStatusCheck.project_lost_date == null) {
        update.project_lost_date = dates.pst_to_utc(dates.now())
      }
    }

    await _findTreeItem (update, null)
    await lsb[0].update(update)
  }
  // await updateJob('update_lbs', 'complete')
}

async function _findTreeItem (update, treeItemArray) {
  var treeItem = await db.treeitem.findOne({where: {id:update.task_id}})
  if (treeItem === null) {
    // fetch the project from LP
    let projectURL = `https://app.liquidplanner.com/api/v1/workspaces/158330/treeitems/${update.project_id}?depth=-1&leaves=true`
    var project = await throttledRequest.promise({ url: projectURL, method: 'GET', headers: { "Authorization": LPauth } })
    try {
    await jobController._updateProject(project)
    // update every treeitem in project
    return
    } catch (error) {
      console.log(error) 
    }
  } else {
    return
  }
  console.log(treeItem)
}