const throttledRequest = require('../config/throttled_request_promise')
const LPauth = "Basic " + new Buffer(process.env.LpUserName + ":" + process.env.LPPassword).toString("base64")
const db = require('../models')
module.exports = {
  updateArchiveProjects,
  updateActiveProjects
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
  _updateProjects(projects)
}
async function _updateProjects(projects) {
  for (let i = 0 ; i < projects.length; i++) {
    var project = projects[i]
    let projectURL = `https://app.liquidplanner.com/api/v1/workspaces/158330/treeitems/${project.key}?depth=-1&leaves=true`
    var projectData = await throttledRequest.promise({ url: projectURL, method: 'GET', headers: { "Authorization": LPauth } })
    if (projectData.type = 'Project') {
      // update the project in the database
      var projectUpdate = {
        id: projectData.id,
        started_on: projectData.started_on,
        done_on: projectData.done_on,
        is_done: projectData.is_done,
        is_on_hold: projectData.is_on_hold,
        is_archived: false,
        promise_by: projectData.promise_by,
        level_of_service: null,
        vertical: null,
        package: null,
        project_type: null,
        ps_phase: null,
      }
      // check if the archived folder is a parent of this project 
      if (projectData.parent_ids.includes(parseInt(process.env.LPArchiveFolder))) {
        projectUpdate.is_archived = true
      } else {
        var cfts = await _getCFTsArray()

      }
      // if custom field values exist then add them
      if (projectData.hasOwnProperty('custom_field_values')) {
        projectUpdate = _addCustomFieldValues(projectData.custom_field_values, projectUpdate)
      }
      // update or create the project in the database
      await db.lp_project.upsert(projectUpdate)
      var dbProject = await db.treeitem.findOrCreate({
        where: {
          id: projectData.id
        }
      })
      await dbProject[0].update({
        hrs_remaning: projectData.high_effort_remaining,
        hrs_logged: projectData.work,
        is_done: projectData.is_done,
        project_id: projectData.id,
        child_type: projectData.type.toLowerCase(),
        name: projectData.name
      })
    }
    await _checkForChildren(projectData)
    console.error('DONE!!!!!!!!!')
    // after everything is complete update the job to have a complete status
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
        e_start: child.expected_start,
        e_finish: child.expected_finish,
        deadline: child.promise_by,
        started_on: child.started_on,
        is_done: child.is_done,
        date_done: child.done_on,
        hrs_logged: child.work,
        hrs_remaning: child.high_effort_remaining,
        name: child.name
      }
      if (child.hasOwnProperty('custom_field_values')) {
        childUpdate = _addCustomFieldValues(child.custom_field_values, childUpdate)
      }
      await dbChild[0].update(childUpdate)
      _checkForChildren(child)
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
// update archive projects and tasks folder
// update LBS dates 
// update lp projects and tasks 
