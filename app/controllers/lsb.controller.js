const throttledRequest = require('../config/throttled_request_promise')
const LPauth = "Basic " + new Buffer(process.env.LpUserName + ":" + process.env.LPPassword).toString("base64")
const db = require('../models')
const dates = require('./dates.controller')
const jobController = require('../controllers/job.controller')
const Papa = require("papaparse")
const Op = db.Sequelize.Op
const slack = require('../controllers/slack.controller')
const Honeybadger = require('honeybadger').configure({
  apiKey: process.env.HONEYBADGER_API_KEY
})
module.exports = {
  update,
  locations,
  projects,
  updateNSDates,
  match
}

async function update(req, res) {
  if (req) {
    res.sendStatus(201)
  }
  try {
    let job = await db.job.findOne({
      where: {
        jobname: 'update_lbs'
      }
    })
    await job.update({ status: 'running' })
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
      if (LBSId == 53508715) {
        debugger
      }
      let locationName = splitName[1]
      let owner = await db.lp_user.findOne({
        where: {
          user_name: location.owner
        }
      })
      if (owner == null) {
        await updatelpUsers()
        owner = await db.lp_user.findOne({
          where: {
            user_name: location.owner
          }
        })
      }
      console.log({ owner })

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
        project_lost_date: null,
        estimatedLostDate: null,
        projectLossReason: location["pick_list_custom_field:109756"],
        projectPhase: null
      }
      if (owner !== null ) {
        update.pm_id = owner.id
      }
      if (isNaN(LBSId) || LBSId === '') {
        try {
          Honeybadger.notify('id is not a number', {
            context: {
              update: update
            }
          }) 
        } catch (error) {
          console.error(error)
        }
      } else {
        var lsb = await db.lbs.findOrCreate({
          where: {
            id: LBSId
          }
        })

        if (location['pick_list_custom_field:102670'] === 'Lost') {
          //  check if the location is currently set to lost
          if (update.project_lost_date == null) {
            update.project_lost_date = dates.pst_to_utc(dates.now())
          }
        }
        if (location['pick_list_custom_field:102670'] === 'On Hold') {
          //  check if the location is currently set to lost
          if (update.estimatedLostDate == null) {
            update.estimatedLostDate = dates.pst_to_utc(dates.now())
          }
        }

        //  if the actual go live is not null then dont allow it to be updated
        if ( lsb[0].actual_go_live == null || dates.moment(lsb[0].actual_go_live).format('MM-DD-YYYY') == dates.moment(update.actual_go_live).format('MM-DD-YYYY')) {
          try {
            await __findTreeItem(update)
            await lsb[0].update(update)
          } catch (error) {
            Honeybadger.notify(error, {
              context: {
                update: update
              }
            })
          }
        } else {
          Honeybadger.notify('Actual Go live is set', {
            context: {
              update: update,
              lsb: lsb[0]
            }
          })
        }
      }
    }
    await job.update({ lastrun: dates.pst_to_utc(dates.now()), status: 'active', lastrunstatus: 'complete' })
  } catch (error) {
    console.log({ error })
    Honeybadger.notify(error, {
      context: {
        update: update,
        lsb: lsb
      }
    })
  }
}
async function locations(req, res) {
  try {
    var startDate = req.query.startDate
    var locations = await db.lbs.findAll({
      attributes: [['id', 'Internal ID'], ['estimated_go_live', 'Current Estimated Go-Live Date'], ['actual_go_live', 'Actual Go-Live Date'], ['original_estimated_go_live', 'Original Estimated Go-live'], ['website_launch_date', 'Website Launch Date'], ['project_lost_date', 'Project Lost date'], ['stage', 'OpenAir: Project Stage'], ['pm_id', 'Primary PM'], [ 'projectPhase', 'Project Phase'], ['estimatedLostDate','On Hold Date'], ['projectLossReason','Project Loss Reason']],
      where: {
        updatedAt: {
          [db.Sequelize.Op.gte]: startDate
        }
      },
      include: [
        {
          model: db.lp_user
        }
      ]
    })
    var csv = []
    let updatedLocations = await throttledRequest.promise({ url: process.env.LP_LBS_UPDATE, method: 'GET', headers: { "Authorization": LPauth } })
    updatedLocations = updatedLocations.rows
    let updatedLocationIds = []
    updatedLocations.forEach(location => {
      let id  = location.name.split(/\s(.+)/, 2)[0]
      try {
        id = parseInt(id)
        updatedLocationIds.push(id)
      } catch (e) {
        console.error(e)
      }
    })
    for (let i = 0; i < locations.length; i++) {
      if (updatedLocationIds.indexOf(locations[i].dataValues['Internal ID']) !== -1) {
        let first_name = ''
        let last_name = ''
        if (locations[i].dataValues.lp_user != null) {
          first_name = locations[i].dataValues.lp_user.dataValues.first_name
          last_name = locations[i].dataValues.lp_user.dataValues.last_name
        }
        csv.push({
          'Internal ID': locations[i].dataValues['Internal ID'],
          'Current Estimated Go-Live Date': dates.utc_to_pst_no_time(locations[i].dataValues['Current Estimated Go-Live Date']),
          'Actual Go-Live Date': dates.utc_to_pst_no_time(locations[i].dataValues['Actual Go-Live Date']),
          'Original Estimated Go-live': dates.utc_to_pst_no_time(locations[i].dataValues['Original Estimated Go-live']),
          'Website Launch Date': dates.utc_to_pst_no_time(locations[i].dataValues['Website Launch Date']),
          'Project Lost date': dates.utc_to_pst_no_time(locations[i].dataValues['Project Lost date']),
          'OpenAir: Project Stage': locations[i].dataValues['OpenAir: Project Stage'],
          'Primary PM' : `${first_name} ${last_name}`,
          'Project Phase': locations[i].dataValues['Project Phase'],
          'On Hold Date': dates.utc_to_pst_no_time(locations[i].dataValues['On Hold Date']),
          'Project Loss Reason': locations[i].dataValues['Project Loss Reason']
        })
      }
    }
    csv = Papa.unparse(csv)

    res.send(csv)
    // convert all dates from utc to PST for upload
  } catch (error) {
    Honeybadger.notify(error)
    res.send(error)
  }
}
async function projects(req, res) {
  try {
    let updatedLocations = await throttledRequest.promise({ url: process.env.LP_LBS_UPDATE, method: 'GET', headers: { "Authorization": LPauth } })
    updatedLocations = updatedLocations.rows
    let updatedLocationIds = []
    updatedLocations.forEach(location => {
      let id  = location.name.split(/\s(.+)/, 2)[0]
      try {
        id = parseInt(id)
        if (!isNaN(id)) {
          updatedLocationIds.push(id)
        }
      } catch (e) {
        console.error(e)
      }
    })
    let master_project_ids = []
    let updated_master_project_ids = await db.lbs.findAll({
      where: {
        id: {
          [Op.in] : updatedLocationIds
        }
      }
    })
    updated_master_project_ids.forEach(location => {
      if (!master_project_ids.includes(location.master_project_id)) {
        master_project_ids.push(location.master_project_id)
      }
    })
    let lbsLocations = await db.masterProject.findAll({
      attributes: [['id', 'Internal ID'], ['estimatedGoLive', 'Current Estimated Go-Live Date'], ['actualGoLive', 'Actual Go-Live Date'], ['originalEstimatedGoLive', 'Original Estimated Go-live'], ['websiteLaunchDate', 'Website Launch Date'], ['lostDate', 'Project Lost date'], ['stage', 'OpenAir: Project Stage'], ['pmId', 'Primary PM'], [ 'projectPhase', 'Project Phase'], ['onHoldDate','On Hold Date']],
      where: {
        id: {
          [Op.in]: master_project_ids
        }
      },
      include: [
        {
          model: db.lp_user
        }
      ]
    })
    var csv = []
    // create CSV from json object and return it
    for (let i = 0; i < lbsLocations.length; i++) {
      try {
        let first_name = ''
        let last_name = ''
        if (lbsLocations[i].dataValues.lp_user != null) {
          first_name = lbsLocations[i].dataValues.lp_user.dataValues.first_name
          last_name = lbsLocations[i].dataValues.lp_user.dataValues.last_name
        }
        csv.push({
          'Internal ID': lbsLocations[i].dataValues['Internal ID'],
          'Current Estimated Go-Live Date': dates.utc_to_pst_no_time(lbsLocations[i].dataValues['Current Estimated Go-Live Date']),
          'Actual Go-Live Date': dates.utc_to_pst_no_time(lbsLocations[i].dataValues['Actual Go-Live Date']),
          'Original Estimated Go-live': dates.utc_to_pst_no_time(lbsLocations[i].dataValues['Original Estimated Go-live']),
          'Website Launch Date': dates.utc_to_pst_no_time(lbsLocations[i].dataValues['Website Launch Date']),
          'Project Lost date': dates.utc_to_pst_no_time(lbsLocations[i].dataValues['Project Lost date']),
          'OpenAir: Project Stage': lbsLocations[i].dataValues['OpenAir: Project Stage'],
          'Primary PM' : `${first_name} ${last_name}`,
          'Project Phase': lbsLocations[i].dataValues['Project Phase'],
          'On Hold Date': lbsLocations[i].dataValues['On Hold Date']
        })
      } catch (error) {
        Honeybadger.notify(error)
        slack.sendError(error.message)
      }
      // get all all of the locations that stages that are part of this project
    }

    csv = Papa.unparse(csv)

    res.send(csv)
  } catch (error) {
    Honeybadger.notify(error)
    res.send(error.stack)
  }
}
async function updateNSDates(req, res) {
  try {
    var job = await __updateJob('ns_backlog', { status: 'running' })
    res.status(200)
    var updates = []
    var data = req.body.data
    var row
    // get the list of users in LP
    var users = await __get_all_lp_users()
    for (i = 0; i < data.length; i++) {
      if (data[i]['Internal ID'] !== undefined) {
        if (data[i].hasOwnProperty('Go-Live Date (Day)')) {
          // parse the PM name
          pmName = data[i]['PM'].trim().toLowerCase()
          pmName = pmName.replace(/ /g, "_")
          if (pmName in users) {
            pmID = users[pmName].id
          } else {
            pmID = null
          }
          row = {
            id: data[i]['Internal ID'],
            location_name: null,
            total_mrr: data[i]['Total MRR'],
            pm_id: pmID,
            gross_ps: data[i]['Gross Professional Services'],
            net_ps: data[i]['Net Professional Services'],
            total_ps_discount: data[i]['Total Professional Services Discount'],
            gross_cs: data[i]['Gross Creative Services'],
            net_cs: data[i]['Net Creative Services'],
            total_cs_discount: data[i]['Total Creative Services Discount'],
            actual_go_live: dates.pst_to_utc(data[i]['Go-Live Date (Day)']),
            project_type: data[i]['Project Type'],
            stage: data[i]['OpenAir: Project Stage']
          }
          try {
            master_project_id = parseInt(data[i]['Master Project ID'])
            if (!isNaN(master_project_id)) {
              row.master_project_id = master_project_id
            }
          } catch (error) {
            row.master_project_id = ''
          }
          console.log({ row })
          if (data[i]['Location'].split(/\s(.+)/).length > 1) {
            row.location_name = data[i]['Location'].split(/\s(.+)/)[1]
          } else {
            row.location_name = data[i]['Location'].split(/\s(.+)/)[0]
          }
        } else {
          // parse the PM name
          pmName = data[i]['PM'].trim().toLowerCase()
          pmName = pmName.replace(/ /g, "_")
          if (pmName in users) {
            pmID = users[pmName].id
          } else {
            pmID = null
          }
  
          row = {
            id: data[i]['Internal ID'],
            location_name: null,
            pm_id: pmID,
            total_mrr: data[i]['Total MRR'],
            gross_ps: data[i]['Gross Professional Services'],
            net_ps: data[i]['Net Professional Services'],
            total_ps_discount: data[i]['Total Professional Services Discount'],
            gross_cs: data[i]['Gross Creative Services'],
            net_cs: data[i]['Net Creative Services'],
            total_cs_discount: data[i]['Total Creative Services Discount'],
            estimated_go_live: dates.pst_to_utc(data[i]['Estimated Go-Live Date (Day)']),
            project_type: data[i]['Project Type'],
            stage: data[i]['OpenAir: Project Stage']
          }
          try {
            master_project_id = parseInt(data[i]['Master Project ID'])
            if (!isNaN(master_project_id)) {
              row.master_project_id = master_project_id
            }
          } catch (error) {
            row.master_project_id = ''
          }
          if (data[i]['Location'].split(/\s(.+)/).length > 1) {
            row.location_name = data[i]['Location'].split(/\s(.+)/)[1]
          } else {
            row.location_name = data[i]['Location'].split(/\s(.+)/)[0]
          }
        }
        if (data[i]['Opportunity Close Date'] != '') {
          row.opportunity_close_date = dates.pst_to_utc(data[i]['Opportunity Close Date'])
        } else {
          row.opportunity_close_date = null
        }
  
        updates.push(db.lbs.upsert(row, { returning: true }))
      }
    }
    Promise.all(updates).then(() => {
      console.log('All updates done')
      if (data[0].hasOwnProperty('Estimated Go-Live Date (Day)')) {
        // get the first day of the month from this backlog
        var backlogDate = new Date(data[0]['Estimated Go-Live Date (Day)'])
        var today = new Date()
        var year = backlogDate.getFullYear()
        var month = backlogDate.getMonth()
        var firstDay = new Date(year, month, 1)
        var lastDay = new Date(year, month + 1, 0)
  
        // find all LBS tasks that are in this month and not updated today
        db.lbs.findAll({
          where: {
            estimated_go_live: {
              [Op.between]: [firstDay, lastDay]
            },
            updatedAt: {
              [Op.lt]: today.setHours(0, 0, 0, 0)
            },
            actual_go_live: null
          }
        }).then(nsLocation => {
          updates = []
          for (let i2 = 0; i2 < nsLocation.length; i2++) {
            updates.push(nsLocation[i2].update({ estimated_go_live: null }))
          }
          Promise.all([updates]).then(() => {
            job.update({ lastrun: dates.moment().format(), lastrunstatus: 'complete', status: 'active' })
          })
        })
      } else {
        console.log('complete')
        job.update({ lastrun: dates.moment().format(), lastrunstatus: 'complete', status: 'active' })
      }
    }) 
  } catch (error) {
    console.log( { error} )
  }
}
async function match(req, res) {
  try {
    // set the job to running 
    let job = await db.job.findOne({
      where: {
        jobname: 'match_lbs'
      }
    })
    if (req) {
      res.sendStatus(201)
    }
    await job.update({ status: 'running' })
    // select LSB from database where there is no task or project id
    var lsb = await db.lbs.findAll({
      where: {
        task_id: null,
        project_id: null
      },
      order: [
        ['estimated_go_live', 'DESC']
      ]
    })
    for (let i = 0; i < lsb.length; i++) {
      var location = lsb[i]
      var url = `https://app.liquidplanner.com/api/workspaces/158330/tasks?filter[]=name contains ${location.id}`
      var treeitem = await throttledRequest.promise({ url: url, method: 'GET', headers: { "Authorization": LPauth } })
      if (treeitem.length > 0) {
        await __findTreeItem({ task_id: treeitem[0].id, project_id: treeitem[0].project_id })
        await location.update({
          task_id: treeitem[0].id,
          project_id: treeitem[0].project_id
        })
      }
    }
    job.update({ lastrun: dates.now(), status: 'active' })
  } catch (error) {
    Honeybadger.notify(error, {
      context: {
        location: location.dataValues,
        treeitem: treeitem
      }
    })
  }
}
async function __findTreeItem(update) {
  var treeItem = await db.treeitem.findOne({ where: { id: update.task_id } })
  if (treeItem === null) {
    // fetch the project from LP
    let projectURL = `https://app.liquidplanner.com/api/v1/workspaces/158330/treeitems/${update.project_id}?depth=-1&leaves=true`
    var project = await throttledRequest.promise({ url: projectURL, method: 'GET', headers: { "Authorization": LPauth } })
    try {
      await jobController._updateProject(project)
      // update every treeitem in project
      return
    } catch (error) {
      Honeybadger.notify(error, {
        context: {
          project: project
        }
      })
    }
  } else {
    return
  }
  console.log(treeItem)
}
function __get_all_lp_users() {
  return db.lp_user.findAll().then(users => {
    userObject = {}
    for (i = 0; i < users.length; i++) {
      user = users[i]
      key = user.first_name.toLowerCase() + ' ' + user.last_name.toLowerCase()
      key = key.replace(/ /g, "_")
      userObject[key] = {
        first_name: user.first_name,
        last_name: user.last_name,
        id: user.id
      }
    }
    return userObject
  })
}
/**
 *
 *
 * @param {string} jobName
 * @param {*} update
 * @returns {}
 */
async function __updateJob(jobName, update) {
  var job = await db.job.findAll({
    where: {
      jobname: jobName
    }
  })

  await job[0].update(update)
  return job[0]
}

async function updatelpUsers() {
  let users = await throttledRequest.promise({ url: process.env.LP_USERS, method: 'GET', headers: { "Authorization": LPauth } })
  for (let i = 0; i < users.length; i++) {
    let user = users[i]
    await db.lp_user.upsert({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        user_name: user.user_name
    })
  }
}
