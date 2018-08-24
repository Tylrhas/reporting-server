var exports = module.exports = {}
var slack = require('../error')
//Models
var db = require("../../models")
var Sequelize = require("sequelize")
const Op = Sequelize.Op
var throttledRequest = require('../../config/throttled_request')
const auth = "Basic " + new Buffer(process.env.LpUserName + ":" + process.env.LPPassword).toString("base64");

var status = 'complete'

exports.remote = backFillRemoteData

async function backFillRemoteData (req, res) {
  res.send(200)
  // set the job status to running
  db.job.findAll({
    where: {
      jobname: 'external_update'
    }
  }).then(results => {
    results[0].update({
      lastrun: new Date(),
      status: 'running'
    })
  })
  // get project Data
  let url = process.env.LP_ACTIVE_PROJECTS
  // get the active PS projects
  let activeProjects = new Promise(function (resolve, reject) {
    throttledRequest({ url: url, method: 'GET', headers: { "Authorization": auth } }, function (error, response, body) {
      if (error) {
        reject(error)
      }
      else {
        resolve(body)
      }
    })
  })
  // parse the response body
  activeProjects.then(body => {
    body = JSON.parse(body)
    // get the array of active projects
    body = body.rows
    projectUpdates = []
    for (let i = 0; i < body.length; i++) {
      // for each project create the treeitem as well as creating the project in the project table
      projectUpdates.push(upsertProject(body[i]).then(projectRequest => {
        findChildren(projectRequest)
      }))
    }
    Promise.all(projectUpdates).then(() => {
      // update all the children
      console.log('woot')
      if (status === 'complete') {
        db.job.findAll({
          where: {
            jobname: 'external_update'
          }
        }).then(results => {
          results[0].update({
            lastrun: new Date(),
            status: 'active',
            lastrunstatus: 'complete'
          })
        })

      } else {
        // there was an error
        results[0].update({
          lastrun: new Date(),
          status: 'active',
          lastrunstatus: 'error'
        })
      }
    })
  })
}

function throttledRequestPromise (args) {
  return new Promise(function (resolve, reject) {
    throttledRequest(args, function (error, response, body) {
      if (error) {
        error = {
          error, response
        }
        reject(error)
      }
      else {
        resolve(JSON.parse(body))
      }
    })
  })

}

async function upsertProject (project) {
  return new Promise(async function (resolve, reject) {
    // get the project and its children from LP
    let projectId = project.key
    let url = 'https://app.liquidplanner.com/api/v1/workspaces/' + process.env.LPWorkspaceId + '/treeitems/' + projectId + '?depth=-1&leaves=true'
    var projectRequest = await throttledRequestPromise({ url: url, method: 'GET', headers: { "Authorization": auth } })

    // project update object
    let update_object = {
      id: projectId,
      client_id: projectRequest.client_id,
      done_on: projectRequest.done_on,
      started_on: projectRequest.started_on,
      expected_finish: projectRequest.expected_finish,
      expected_start: projectRequest.expected_start,
      is_done: projectRequest.is_done,
      is_on_hold: projectRequest.is_on_hold,
      is_archived: projectRequest.is_archived,
      promise_by: projectRequest.promise_by
    }
    if (projectRequest.hasOwnProperty('custom_field_values')) {
      // fill out the custom values
      for (let i = 0; i < Object.keys(projectRequest.custom_field_values).length; i++) {
        let key = Object.keys(projectRequest.custom_field_values)[i]
        // check if the custom field is already in the update object if so add the new data to it
        if (update_object[key.replace(/ /g, "_").toLowerCase()] !== 'undefined') {
          update_object[key.replace(/ /g, "_").toLowerCase()] = projectRequest.custom_field_values[key]
        }
      }
    }

    if (projectRequest.hasOwnProperty('parent_ids')) {
      if (projectRequest.parent_ids.indexOf(parseInt(process.env.ProServFolderId)) !== -1) {
        // is this project in the active project PS folder
        update_object.is_archived = false
      } else if (projectRequest.parent_ids.indexOf(parseInt(process.env.ProServArchiveFolder)) !== -1) {
        // in the archived folder
        update_object.is_archived = true
      }
    }
    // get the CFT_ID for the project
    try {
      update_object.cft_id = await get_cft_id(projectRequest)
    }
    catch (error) {
      slack.sendError(update_object, error)
    }
    await db.lp_project.upsert(update_object)

    // create the tree item for the project
    let treeitem = await db.treeitem.findOrCreate({
      where: {
        id: projectId
      },
      defaults: {
        project_id: projectId,
        e_start: projectRequest.expected_start,
        name: projectRequest.name,
        e_finish: projectRequest.expected_finish,
        deadline: projectRequest.promise_by,
        hrs_logged: projectRequest.hours_logged,
        date_done: projectRequest.done_on,
        hrs_remaning: projectRequest.high_effort_remaining,
        child_type: projectRequest.type.toLowerCase()
      }
    })
    // update the object
    await treeitem[0].update({
      project_id: projectId,
      e_start: projectRequest.expected_start,
      name: projectRequest.name,
      e_finish: projectRequest.expected_finish,
      deadline: projectRequest.promise_by,
      hrs_logged: projectRequest.hours_logged,
      date_done: projectRequest.done_on,
      hrs_remaning: projectRequest.high_effort_remaining,
      child_type: projectRequest.type.toLowerCase()
    })
    resolve(projectRequest)
  })
}

function findChildren (treeItem) {
  if (treeItem.children != null) {
    let children = treeItem.children
    for (let ci = 0; ci < children.length; ci++) {
      createTreeItem(children[ci])
    }
  }
}

async function get_cft_id (body) {
  return new Promise(function (resolve, reject) {
    var found = false
    // find CFT ID
    var results = db.cft.findAll({
      attributes: ['id']
    }).then(results => {
      var CFT_ids = []
      // parse the CFT_ids
      for (let i = 0; i < results.length; i++) {
        CFT_ids.push(results[i].id)
      }
      // for each item in the parent_ids 
      for (let i = 0; i < body.parent_ids.length; i++) {
        // check each ID in the cft_ids array
        let parent_id = body.parent_ids[i]
        if (CFT_ids.indexOf(parent_id) !== -1) {
          // I want to return this ID
          found = true
          resolve(parent_id)
        }
      }
      if (!found) {
        resolve(0)
      } else {
        reject('No CFT ID Found')
      }
    })
  })
}

async function createTreeItem (body) {
  // need to modify this
  var update_object = {
    project_id: body.project_id,
    e_start: body.expected_start,
    name: body.name,
    e_finish: body.expected_finish,
    deadline: body.promise_by,
    hrs_logged: body.hours_logged,
    date_done: body.done_on,
    hrs_remaning: body.high_effort_remaining,
    child_type: body.type.toLowerCase()
  }

  if (body.hasOwnProperty('custom_field_values')) {
    // fill out the custom values
    for (let i = 0; i < Object.keys(body.custom_field_values).length; i++) {
      let key = Object.keys(body.custom_field_values)[i]
      // check if the custom field is already in the update object if so add the new data to it
      if (update_object[key.replace(/ /g, "_").toLowerCase()] !== 'undefined') {
        if (body.custom_field_values[key] != null) {
          update_object[key.replace(/ /g, "_").toLowerCase()] = body.custom_field_values[key]
        }
      }
    }
  }

  let id = body.id

  if (body.type.toLowerCase() !== 'project') {
    update_object.parent_id = body.parent_id
  }

  // look for null in the update object
  Object.keys(update_object).forEach(key => { if (update_object[key] === null) { delete update_object[key]; }})

  try {
    var count = await db.treeitem.count({ where: { id: id } })
    var parentCount = await db.treeitem.count({ where: { id: body.parent_id } })
    if (parentCount < 1) {
      console.log(body)
    }
    await db.treeitem.findOrCreate({
      where: {
        id: body.id
      },
      defaults: update_object
    }).then(treeitem => {
      treeitem[0].update(update_object)
    })
  }
  catch (error) {
    console.log(error)
  }

  // create the LBS item 
  if (body.hasOwnProperty('custom_field_values') && body.custom_field_values.hasOwnProperty('Task Type')) {
    // task type is set for this item
    console.log(body.custom_field_values['Task Type'])
    console.log(body.type)
    if (body.custom_field_values['Task Type'] === 'Location Service Billing' && body.type === 'Task') {
      // create or update the LBS row
      let splitName = body.name.split(/\s(.+)/, 2)
      let LBSId = splitName[0]
      let locationName = splitName[1]
      try {
        lbs = await db.lbs.findOrCreate({ where: { id: LBSId }, defaults: { location_name: locationName, task_id: body.id, project_id : body.project_id } })
        lbs[0].update({ location_name: locationName, task_id: body.id, project_id : body.project_id })
      } 
      catch (error) {
        console.log(error)
      }
    }
  }

  if (body.hasOwnProperty('children')) {
    // there are children for this treeitem
    return findChildren(body)
  }
}