var exports = module.exports = {}
var projects = require('../lib/controllers/projects')
//require api functions
const lp_projects = require('./api/lp_projects');
lp_lbs = require('./api/lp_lbs');
backfill = require('../lib/controllers/backfill')
client_time = require('./jobs/client_time');
var Sequelize = require("sequelize")
var lp_users = require('../controllers/lp_users')
var lbs = require('../controllers/location_billing_service')
var slack = require('../lib/error')
//Models
const db = require("../models");
const Op = Sequelize.Op
const auth = "Basic " + new Buffer(process.env.LpUserName + ":" + process.env.LPPassword).toString("base64");

const Papa = require("papaparse")
// require dates lib for all date conversion and access to moment and momentTz
const dates = require('../lib/dates') 
// import the config for throttled request
const throttledRequest = require('../config/throttled_request')

//API Calls
exports.updatelpLbsapi = function (req, res) {
 lp_lbs.updateapi(req, res);
}
exports.backfillLBS = function (req, res) {
 var json = req.body
 res.send(201)
 lbs.backfill(json)
}
exports.lbsAPIUpdate = async function (req, res) {
 if (req !== null) {
  res.send(201)
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
   original_estimated_go_live: dates.pst_to_utc(locations[i]["date_custom_field:151494"]),
   estimated_go_live: dates.pst_to_utc(locations[i]["date_custom_field:147376"]),
   actual_go_live: dates.pst_to_utc(locations[i]["date_custom_field:151495"]),
   website_launch_date: dates.pst_to_utc(locations[i]["date_custom_field:151496"]),
   start_date: dates.pst_to_utc(locations[i]["date_custom_field:151496"]),
  }
      // check if the location status is lost
  if (update.stage == 'Lost') {
     // check if the location in the database has a lost date
     var lost_date = await db.lbs.findOne({
      where: {
       id: LBSId
      },
      attributes: ['project_lost_date']
     })
     if (lost_date.project_lost_date == null) {
      update.project_lost_date == dates.moment.utc()
     }
  }

  // check and see if the location has already been activated
  if (update.actual_go_live != null) {
   var actual_go_live = await db.lbs.findOne({
    where: {
     id: LBSId
    },
    attributes: ['actual_go_live']
   })
   if (actual_go_live.actual_go_live != null && actual_go_live.actual_go_live !== dates.pst_to_utc(update.actual_go_live)) {
    // throw error
    slack.sendError(`https://app.liquidplanner.com/space/158330/projects/show/${update.task_id}`, 'Task already has a go-live date')
    // USE REQUEST FROM LP API TO GET THE USERNAME
    // get the task and see who the members are on it 
    // get the members usernames based on member ids
    // @mention the members on the task saying it cant be updated and 
   } else {
    await lbs.update({ id: LBSId }, update)
   }
  }
 }
 await updateJob('update_lbs', 'complete')
}

exports.findLBSProjects = function (req, res) {
 backfill.findMissingLBSProjects(req, res);
}
exports.updatelpprojectsapi = function (req, res) {
 lp_projects.updateProjectsapi(req, res);

}
exports.updatelptasksapi = function (req, res) {
 lp_tasks.updateAllTasks(req, res);
}

exports.updateUser = function (req, res) {
 console.log(req.body)
 db.user.update({ user_group: req.body.group }, {
  where: {
   id: req.body.id,
  }
 }).then(results => {
  res.status(200)
 })
}
exports.getProject = function (req, res) {
 db.treeitem.find({
  where: { id: req.params.project_id },
  include: {
   model: db.treeitem,
   as: 'descendents',
   hierarchy: true
  }
 }).then(function (result) {
  res.send(result)
 })
}

exports.updateNsBacklog = async function (req, res) {
 res.status(200)
 var updates = []
 var data = req.body.data
 var row
 // get the list of users in LP
 var users = await lp_users.get_all()
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
     master_project_id: parseInt(data[i]['Master Project ID']),
     pm_id: pmID,
     gross_ps: data[i]['Gross Professional Services'],
     net_ps: data[i]['Net Professional Services'],
     total_ps_discount: data[i]['Total Professional Services Discount'],
     gross_cs: data[i]['Gross Creative Services'],
     net_cs: data[i]['Net Creative Services'],
     total_cs_discount: data[i]['Total Creative Services Discount'],
     actual_go_live: data[i]['Go-Live Date (Day)'],
     project_type: data[i]['Project Type']
    }
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
     master_project_id: parseInt(data[i]['Master Project ID']),
     pm_id: pmID,
     total_mrr: data[i]['Total MRR'],
     gross_ps: data[i]['Gross Professional Services'],
     net_ps: data[i]['Net Professional Services'],
     total_ps_discount: data[i]['Total Professional Services Discount'],
     gross_cs: data[i]['Gross Creative Services'],
     net_cs: data[i]['Net Creative Services'],
     total_cs_discount: data[i]['Total Creative Services Discount'],
     estimated_go_live: data[i]['Estimated Go-Live Date (Day)'],
     project_type: data[i]['Project Type']
    }
    if (data[i]['Location'].split(/\s(.+)/).length > 1) {
     row.location_name = data[i]['Location'].split(/\s(.+)/)[1]
    } else {
     row.location_name = data[i]['Location'].split(/\s(.+)/)[0]
    }
   }
   if (data[i]['Opportunity Close Date'] != '') {
    row.opportunity_close_date = data[i]['Opportunity Close Date']
   } else {
    row.opportunity_close_date = null
   }

   updates.push(db.lbs.upsert(row).then(results => {
    console.log(results)
   }))
  }
 }
 Promise.all(updates).then(() => {
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
     updateJob('ns_backlog', 'complete')
    })
   })
  } else {
   updateJob('ns_backlog', 'complete')
  }
 })
}
exports.getLBSLocations = async function (req, res) {
 var locations
 var startDate
 var csv = []
 if (req.query.startDate) {
  startDate = req.query.startDate
 }
 if (startDate) {
  let where = {
   updatedAt: {
    [db.Sequelize.Op.gte]: startDate
   }
  }
  locations = await lbs.getNSUpdate(where)
 } else {
  locations = await lbs.getNSUpdate()
 }
 // create CSV from json object and return it
 for (let i = 0; i < locations.length; i++) {
  csv.push({
   'Internal ID': locations[i].dataValues['Internal ID'],
   'Current Estimated Go-Live Date': formatDate(locations[i].dataValues['Current Estimated Go-Live Date']),
   'Actual Go-Live Date': formatDate(locations[i].dataValues['Actual Go-Live Date']),
   'Original Estimated Go-live': formatDate(locations[i].dataValues['Original Estimated Go-live']),
   'Website Launch Date': formatDate(locations[i].dataValues['Website Launch Date']),
   'Start Date': formatDate(locations[i].dataValues['Start Date']),
   'Project Lost date': formatDate(locations[i].dataValues['Project Lost date']),
   'Stage': locations[i].dataValues['Stage']
  })
 }
 csv = Papa.unparse(csv)

 res.send(csv)
}

exports.getLBSProjects = async function (req, res) {
 var locations
 var startDate
 var csv = []
 if (req.query.startDate) {
  startDate = req.query.startDate
 }
 if (startDate) {
  locations = await lbs.getNSProjectUpdate(startDate)
 } else {
  locations = await lbs.getNSProjectUpdate()
 }
 // create CSV from json object and return it
 for (let i = 0; i < locations.length; i++) {
  let project = getProjectStatus(locations, i)
  csv.push(project.data)
  i = project.newIndex
  // get all all of the locations that stages that are part of this project
 }

 csv = Papa.unparse(csv)

 res.send(csv)
}

exports.getAllProjects = function (req, res) {
 db.treeitem.findAll({
  order: Sequelize.col('hierarchyLevel')
 }).then(results => {
  res.send(results)
 })
}

exports.updateProjects = async function (req, res) {
 backfill.remote(req, res)
}
exports.updateArchivedProjects = async function (req, res) {
 backfill.archivedProjects(req, res)
}

exports.getTreeItems = function (req, res) {
 db.treeitem.findAll({
  // Will order ascending assuming ascending is the default order when direction is omitted
  order: Sequelize.col('hierarchyLevel')
 })
  .then(results => {
   res.send(results)
  })
}
exports.updateTeamProjects = function (req, res) {
 res.sendStatus(200)
 let teamIds = []
 // find CFT ID
 db.cft.findAll({
  attributes: ['id'],
  where: {
   id: {
    [Op.not]: 0
   }
  }
 })
  .then(results => {
   // organize team IDs into array 
   for (let i = 0; i < results.length; i++) {
    teamIds.push(results[i].id)
   }
   // get all projects 
   db.lp_project.findAll({})
    .then(results => {
     for (let ri = 0; ri < results.length; ri++) {
      let project = results[ri]
      // API call to project
      const auth = "Basic " + new Buffer(process.env.LpUserName + ":" + process.env.LPPassword).toString("base64")
      let url = 'https://app.liquidplanner.com/api/workspaces/' + process.env.LPWorkspaceId + '/treeitems/' + results[ri].id
      // let url = 'https://app.liquidplanner.com/api/workspaces/' + process.env.LPWorkspaceId  + '/treeitems/' + teamID +'?depth=1'
      throttledRequest({ url: url, method: 'GET', headers: { "Authorization": auth } }, function (error, response, body) {
       if (error) {
        //Handle request error 
        console.log(error);
       } else {
        // is it in PS Active folder
        try {
         body = JSON.parse(body)
        }
        catch (error) {
         console.log(error)
        }
        if (body.error !== undefined) {
         console.log(body.error)
         if (body.error === 'NotFound') {
          results[ri].destroy()
         }
        } else {
         if (project.id === 34359938) {
          console.log('woot')
         }
         if (body.parent_ids.indexOf(parseInt(process.env.ProServFolderId)) !== -1) {
          let updated = false
          for (i = 0; i < teamIds.length; i++) {
           // find the team it is associated with
           if (body.parent_ids.indexOf(parseInt(teamIds[i])) !== -1) {
            updated = true
            results[ri].update({
             cft_id: teamIds[i],
             is_archived: false
            })
           }
          }
          if (!updated) {
           results[ri].update({
            cft_id: 0,
            is_archived: false
           })
          }
         } else if (body.parent_ids.indexOf(parseInt(process.env.ProServArchiveFolder)) !== -1) {
          // is it in the PS archived folder
          results[ri].update({
           is_archived: true
          })
         }
         else {
          results[ri].destroy()
         }
        }
       }
      })
     }
    })

  })
}

function updateProject(project, teamID) {
 return db.treeitem.findOrCreate({
  where: {
   id: project.id
  },
  defaults: {
   e_start: project.expected_start,
   name: project.name,
   e_finish: project.expected_finish,
   deadline: project.promise_by,
   date_done: project.done_on,
   hrs_logged: project.hours_logged,
   hrs_remaning: project.high_effort_remaining,
   child_type: project.type.toLowerCase()
  }
 }).then(results => {
  db.lp_project.upsert({
   id: project.id,
   cft_id: teamID
  })
 })
}
async function createTreeItem(body) {
 return db.treeitem.findOrCreate({
  where: {
   id: body.id
  },
  defaults: {
   parent_id: body.parent_id,
   e_start: body.e_start,
   name: body.name,
   e_finish: body.e_finish,
   deadline: body.deadline,
   hrs_logged: body.hrs_logged,
   date_done: body.date_done,
   hrs_remaning: body.hrs_remaning,
   child_type: body.child_type,
   task_type: body.task_type
  }
 })
  .then(treeitem => {
   treeitem[0].update({
    parent_id: body.parent_id,
    e_start: body.e_start,
    name: body.name,
    e_finish: body.e_finish,
    deadline: body.deadline,
    hrs_logged: body.hrs_logged,
    date_done: body.date_done,
    hrs_remaning: body.hrs_remaning,
    child_type: body.child_type,
    task_type: body.task_type
   })
  })
}
/**
 *
 *
 * @param {string} jobName
 * @param {string} status
 */
function updateJob(jobName, status) {
 db.job.findAll({
  where: {
   jobname: jobName
  }
 }).then(results => {
  results[0].update({
   lastrun: new Date(),
   lastrunstatus: status
  })
 })
}

function getProjectStatus(locations, i) {
 let currentProjectId = locations[i].master_project_id
 var stages = []
 var stage = null
 var data = {
  'Internal ID': locations[i].master_project_id,
  'Current Estimated Go-Live Date': formatDate(locations[i].estimated_go_live),
  'Actual Go-Live Date': formatDate(locations[i].actual_go_live),
  'Original Estimated Go-live': formatDate(locations[i].original_estimated_go_live),
  'Website Launch Date': formatDate(locations[i].website_launch_date),
  'Start Date': formatDate(locations[i].start_date),
  'Project Lost date': formatDate(locations[i].project_lost_date)
 }
 // push the first project into it
 while (i < locations.length && locations[i].master_project_id === currentProjectId) {
  stages.push(locations[i].stage)
  i++
 }

 if (stages.indexOf('In Process') !== -1) {
  // a location is in process so set the project to in process
  stage = "In Process"
 } else if (stages.indexOf('On Hold') !== -1) {
  // there are on hold locations and no i process locations
  stage = "On Hold"
 } else if (stages.indexOf('Complete') !== -1 && stages.indexOf('On Hold') === -1) {
  // all locations are complete or lost so the project is complete
  stage = "Complete"
 } else if (stages.indexOf('Lost') !== -1 && stages.length === 1) {
  // all locations are Lost
  stage = "Lost"
 } else {
  // we have an error
  // SEND IT VIA SLACK
  console.log('error')
 }
 data.stage = stage
 return {
  newIndex: i - 1,
  data: data
 }
}

function formatDate(date) {
 if (date != null) {
  date = dates.moment.utc(date).local().format('MM-DD-YYYY')
 }
 return date
}