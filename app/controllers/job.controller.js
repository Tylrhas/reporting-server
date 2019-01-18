const throttledRequest = require('../config/throttled_request_promise')
const LPauth = "Basic " + new Buffer(process.env.LpUserName + ":" + process.env.LPPassword).toString("base64")
const db = require('../models')
const dates = require('./dates.controller')
const Honeybadger = require('honeybadger').configure({
  apiKey: process.env.HONEYBADGER_API_KEY
})
module.exports = {
  updateArchiveProjects,
  updateActiveProjects,
  _updateProject
}
async function updateArchiveProjects(req, res) {
  // get the job from the database and set its status to running 
  if (req) {
    res.sendStatus(200)
  }
  let response = await throttledRequest.promise({ url: process.env.LP_ARCHIVE_PROJECTS, method: 'GET', headers: { "Authorization": LPauth } })
  var projects = response.rows
  _updateProjects(projects)
}

async function updateActiveProjects(req, res) {
  // get the job from the database and set its status to running 
  if (req) {
    res.sendStatus(200)
  }
  let response = await throttledRequest.promise({ url: process.env.LP_ACTIVE_PROJECTS, method: 'GET', headers: { "Authorization": LPauth } })
  var projects = response.rows
  try {
    let job = await db.jobs.findOne({
      where: {
        name: 'external_update'
      }
    })
    job.update({status: 'running'})
    await _updateProjects(projects)
    job.update({lastrun: dates.now(), status: 'active'})
  } catch (error) {
    Honeybadger.notify(error)
  }
}
async function _updateProjects(projects) {
  try {
    for (let i = 0; i < projects.length; i++) {
      var project = projects[i]
      let projectURL = `https://app.liquidplanner.com/api/v1/workspaces/158330/treeitems/${project.key}?depth=-1&leaves=true`
      var project = await throttledRequest.promise({ url: projectURL, method: 'GET', headers: { "Authorization": LPauth } })
      await _updateProject(project)
      console.error('DONE!!!!!!!!!')
    }
  } catch (error) {
    Honeybadger.notify(error, {
      context: {
      project: project
      }
    })
  }
}
async function _checkForChildren(parent) {
  if (parent.hasOwnProperty('children')) {
    for (let i = 0; i < parent.children.length; i++) {
      var child = parent.children[i]
      // update the database
      var dbChild = await db.treeitem.findOrCreate({
        where: {
          id: child.id
        }
      })
      var childUpdate = {
        parent_id: child.parent_id,
        project_id: child.project_id,
        child_type: child.type.toLowerCase(),
        e_start: dates.pst_to_utc(child.expected_start),
        e_finish: dates.pst_to_utc(child.expected_finish),
        // deadline: child.promise_by,
        started_on: dates.pst_to_utc(child.started_on),
        is_done: child.is_done,
        date_done: dates.pst_to_utc(child.done_on),
        hrs_logged: child.work,
        hrs_remaning: child.high_effort_remaining,
        name: child.name
      }
      if (child.project_id === 49432637) {
        debugger
      }
      if (child.hasOwnProperty('custom_field_values')) {
        childUpdate = _addCustomFieldValues(child.custom_field_values, childUpdate)
        if (childUpdate.hasOwnProperty('task_type') && childUpdate.task_type === 'Location Service Billing') {
          // create an LSB task for it
          // parse the id from the name
          let splitName = childUpdate.name.split(/\s(.+)/, 2)
          if (!isNaN(splitName[0])) {
            let lsb = await db.lbs.findOrCreate({
              where: {
                id: splitName[0]
              }
            })
            await lsb[0].update({
              project_id: childUpdate.project_id,
              task_id: child.id
            })
            await dbChild[0].update(childUpdate)
          } else {
            Honeybadger.notify(`ID is not a number - ${splitName[0]}`, {
              context: {
              dbItem: dbChild[0].dataValues, 
              update: childUpdate
              }
            })
          }
        }
      }
      await dbChild[0].update(childUpdate)
      try {
        await _checkForChildren(child) 
      } catch (error) {
        Honeybadger.notify(error, {
          context: {
            child: child
          }
        })
      }
    }
  } else {
    return
  }
}

function _addCustomFieldValues(customFields, projectUpdate) {
  // fill out the custom values
  for (let i = 0; i < Object.keys(customFields).length; i++) {
    let key = Object.keys(customFields)[i]
    // check if the custom field is already in the update object if so add the new data to it
    if (projectUpdate[key.replace(/ /g, "_").toLowerCase()] !== 'undefined') {
      projectUpdate[key.replace(/ /g, "_").toLowerCase()] = customFields[key]
    }
  }
  return projectUpdate
}

async function _updateProject(project) {
  if (project.type = 'Project') {
    // update the project in the database
    var projectUpdate = {
      id: project.id,
      cft_id: await __getCFTId(project),
      started_on: project.started_on,
      done_on: project.done_on,
      is_done: project.is_done,
      is_on_hold: project.is_on_hold,
      is_archived: false,
      promise_by: project.promise_by,
      level_of_service: null,
      vertical: null,
      package: null,
      project_type: null,
      ps_phase: null,
    }
    // check if the archived folder is a parent of this project 
    if (project.parent_ids.includes(parseInt(process.env.LPArchiveFolder))) {
      projectUpdate.is_archived = true
    }
    // if custom field values exist then add them
    if (project.hasOwnProperty('custom_field_values')) {
      projectUpdate = _addCustomFieldValues(project.custom_field_values, projectUpdate)
    }
    // update or create the project in the database
    await db.lp_project.upsert(projectUpdate)
    var dbProject = await db.treeitem.findOrCreate({
      where: {
        id: project.id
      }
    })
    await dbProject[0].update({
      hrs_remaning: project.high_effort_remaining,
      hrs_logged: project.work,
      is_done: project.is_done,
      project_id: project.id,
      child_type: project.type.toLowerCase(),
      name: project.name
    })
  }
  try {
    await _checkForChildren(project) 
  } catch (error) {
    Honeybadger.notify(error, {
      context: {
        project: project
      }
    })
  }
  return
  // after everything is complete update the job to have a complete status
}

async function _getCFTsArray() {
  var cfts = await db.cft.findAll({
    attributes: ['id']
  })
  var cftsArray = []
  cfts.forEach(cft => {
    cftsArray.push(cft.id)
  })

  return cftsArray
}
async function __getCFTId (project) {
  let teamID = 0
  var cfts = await _getCFTsArray()
  for (let i = 0; i < cfts.length; i++) {
    let cft_id = cfts[i]
    if(project.parent_ids.indexOf(cft_id) !== -1) {
      teamID = cft_id
    }
  }
  return teamID
}
// update archive projects and tasks folder
// update LBS dates 
// update lp projects and tasks 
