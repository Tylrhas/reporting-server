var Sequelize = require("sequelize")
const Op = Sequelize.Op
var db = require("../models")
const request = require("request"),
  throttledRequest = require('throttled-request')(request)
//This will throttle the requests so no more than 30 are made every 15 seconds 
throttledRequest.configure({
  requests: 20,
  milliseconds: 15000
});

module.exports = function (app, passport) {
  app.post('/webhooks/items', function (req, res) {
    // LP Post to the webhood to update the task
    res.sendStatus(200)
    if (req.body.change_type === 'delete') {
      db.lp_task.destroy({
        where: {
          id: req.body.id
        }
      })
    }
    else {
      let body = req.body
      let subFolders = []
      checkParent(body,subFolders)
    }
  });
}

  app.post('/webhooks/clients', function (req, res) {
    console.log('clients')
    res.sendStatus(200)
    console.log(req.body)
    if (req.body.change_type === 'update') {
      db.lp_client.findOrCreate({ where: { id: req.body.id }, defaults: { name: req.body.name } }).then(project => {
        project[0].update({
          id: req.body.id,
          name: req.body.name
        })
      })
    }
    else if (req.body.change_type === 'create') {
      db.lp_client.create({
        id: req.body.id,
        name: req.body.name
      })
    }
    else if (req.body.change_type === 'delete') {
      db.lp_client.destroy({
        where: {
          id: req.body.id
        }
      })
    }
  })

async function checkParent (body, subFolders) {
  console.log(body.type.toLowerCase())
  if (body.type === 'Project') {
    // this is the top level folder and doesnt need a partent
      await createProject(body)
    if (subFolders.length > 0) {
      // create all of the sub items
      for (let i = 0; i < subFolders.length; i++){
        await createSubItem(subFolders[i])
      }
    }

  } else {
  let projectCount = await db.project_folders.count({ where: { id: body.parent_id } })
    if (projectCount > 0) {
      // parent exists
      createSubItem(body)
      if (subFolders.length > 0) {
        // create all of the sub items
        for (let i = 0; i < subFolders.length; i++){
          await createSubItem(subFolders[i])
        }
      }
    } else {
      subFolders.push({
        id: body.id,
        e_start: body.expected_start,
        name: body.name,
        e_finish: body.expected_finish,
        deadline: body.promise_by,
        hrs_logged: body.hours_logged,
        date_done: body.done_on,
        hrs_remaning: body.high_effort_remaining,
        parent_id: body.parent_id,
        type: body.type
      })
      // go get the parent item info
      let url = 'https://app.liquidplanner.com/api/workspaces/' + process.env.LPWorkspaceId + '/treeitems/' + body.parent_id + '?depth=-1&leaves=true'
      const auth = "Basic " + new Buffer(process.env.LpUserName + ":" + process.env.LPPassword).toString("base64");
      throttledRequest({ url: url, method: 'GET', headers: { "Authorization": auth } }, function (error, response, body) {
        if (error) {
          //Handle request error 
          console.log(error);
        }
        let parentBody = JSON.parse(body)
        // create the project if it is missing
        return checkParent(parentBody,subFolders)
      })
    }
  }
}
async function createSubItem (body) {
  body.type.toLowerCase()
  return db.project_folders.create({
    id: body.id,
    e_start: body.expected_start,
    name: body.name,
    e_finish: body.expected_finish,
    deadline: body.promise_by,
    hrs_logged: body.hours_logged,
    date_done: body.done_on,
    hrs_remaning: body.high_effort_remaining,
    parent_id: body.parent_id,
    child_type: body.type.toLowerCase()
  })
}

async function createProject (body) {
console.log(body.type.toLowerCase())
  //create the new priority for this project
  let update_object = {
    id: body.id,
    done_on: body.done_on,
    started_on: body.started_on,
    expected_finish: body.expected_finish,
    expected_start: body.expected_start,
    is_done: body.is_done,
    is_on_hold: body.is_on_hold,
    promise_by: body.promise_by,
    // BEGIN CUSTOM FIELDS
    launch_day: null,
    launch_month: null,
    project_impact: null,
    launch_type: null,
    project_type: null,
    package: null,
    services_activated: null,
    risk_level: null,
    ps_phase: null,
    vertical: null,
  }

  for (let i = 0; i < Object.keys(body.custom_field_values).length; i++) {
    let key = Object.keys(body.custom_field_values)[i]
    // check if the custom field is already in the update object if so add the new data to it
    if (update_object[key.replace(/ /g, "_").toLowerCase()] !== 'undefined') {
      update_object[key.replace(/ /g, "_").toLowerCase()] = body.custom_field_values[key]
    }
  }
  // FIND OR CREATE THE LOCATION THEN UPDATE IT WITH THE NEW DATA
  return db.lp_project.upsert(update_object).then(() => {
    db.project_folders.create({
      id: body.id,
      e_start: body.expected_start,
      name: body.name,
      e_finish: body.expected_finish,
      deadline: body.promise_by,
      hrs_logged: body.hours_logged,
      date_done: body.done_on,
      hrs_remaning: body.high_effort_remaining,
      child_type: body.type.toLowerCase()
    })
  })
}