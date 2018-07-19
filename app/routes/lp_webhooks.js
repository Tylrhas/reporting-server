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
      db.treeitem.destroy({
        where: {
          id: req.body.id
        }
      })
    }
    else {
      let body = req.body
      let subFolders = []
      // check if this is a LBS task
      checkParent(body, subFolders)
    }
  });
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

}
async function checkParent (body, subFolders) {
  console.log(body.type.toLowerCase())
  if (body.type === 'Project') {
    // this is the top level folder and doesnt need a partent
    await createProject(body)
    if (subFolders.length > 0) {
      // create all of the sub items
      for (let i = 0; i < subFolders.length; i++) {
        await createSubItem(subFolders[i])
        console.log(subFolders[i])
        if (subFolders[i].task_type === 'Location Service Billing' && subFolders[i].type === 'Task') {
          let splitName = subFolders[i].name.split(/\s(.+)/, 2)
          let LBSId = splitName[0]
          let locationName = splitName[1]
          let lbsTask = await db.lbs.findOrCreate({ where: { id: LBSId }, defaults: { location_name: locationName, task_id: subFolders[i].id } })
          lbsTask[0].update({ location_name: locationName, task_id: body.id })
        }
      }
    }

  } else {
    if (body.parent_id != null) {
      let projectCount = await db.treeitem.count({ where: { id: body.parent_id } })
      if (projectCount > 0) {
        // parent exists
        let updateBody = {
          id: body.id,
          e_start: body.expected_start,
          name: body.name,
          e_finish: body.expected_finish,
          deadline: body.promise_by,
          hrs_logged: body.hours_logged,
          date_done: body.done_on,
          hrs_remaning: body.high_effort_remaining,
          parent_id: body.parent_id,
          type: body.type,
          task_type: null
        }
        if (body.type === 'Task') {
          updateBody.task_type = body.custom_field_values['Task Type']
        }
        await createSubItem(updateBody)
        if (updateBody.task_type === 'Location Service Billing' && updateBody.type === 'Task') {
          let splitName = subFolders[i].name.split(/\s(.+)/, 2)
          let LBSId = splitName[0]
          let locationName = splitName[1]
          let lbsTask = await db.lbs.findOrCreate({ where: { id: LBSId }, defaults: { location_name: locationName, task_id: body.id } })
        }
        if (subFolders.length > 0) {
          // create all of the sub items
          for (let i = 0; i < subFolders.length; i++) {
            await createSubItem(subFolders[i])
            console.log(subFolders[i].task_type)
            console.log(subFolders[i].type)
            if (subFolders[i].task_type === 'Location Service Billing' && subFolders[i].type === 'type') {
              let splitName = subFolders[i].name.split(/\s(.+)/, 2)
              let LBSId = splitName[0]
              let locationName = splitName[1]
              let lbsTask = await db.lbs.findOrCreate({ where: { id: LBSId }, defaults: { location_name: locationName, task_id: body.id } })
            }
          }
        }
      } else {
        let subFolderUpdate = {
          id: body.id,
          e_start: body.expected_start,
          name: body.name,
          e_finish: body.expected_finish,
          deadline: body.promise_by,
          hrs_logged: body.hours_logged,
          date_done: body.done_on,
          hrs_remaning: body.high_effort_remaining,
          parent_id: body.parent_id,
          type: body.type,
          task_type: null
        }
        if (body.type === 'Task') {
          subFolderUpdate.task_type = body.custom_field_values['Task Type']
        }
        subFolders.unshift(subFolderUpdate)
        // go get the parent item info
        let url = 'https://app.liquidplanner.com/api/workspaces/' + process.env.LPWorkspaceId + '/treeitems/' + body.parent_id + '?depth=-1&leaves=true'
        const auth = "Basic " + new Buffer(process.env.LpUserName + ":" + process.env.LPPassword).toString("base64");
        throttledRequest({ url: url, method: 'GET', headers: { "Authorization": auth } }, function (error, response, body) {
          if (error) {
            // Handle request error 
            request({
              url: process.env.SLACK_WEBHOOK_URL,
              method: 'POST',
              json: {
                text: "Error: " + error + "\nBody: " + body
              }
            }, function (error, response, body) {
              console.log(body);
            })
          }
          try {
            let parentBody = JSON.parse(body)
            // create the project if it is missing
            return checkParent(parentBody, subFolders)
          } catch (e) {
            //  post error to slack
            request({
              url: process.env.SLACK_WEBHOOK_URL,
              method: 'POST',
              json: {
                text: "Error: " + e + "\nBody: " + body
              }
            }, function (error, response, body) {
              console.log(body);
            })
          }
          if (parentBody != null) {
            // create the project if it is missing
            return checkParent(parentBody, subFolders)
          }
        })
      }
    }
  }
}
async function createSubItem (body) {
  return db.treeitem.findOrCreate({
    where: {
      id: body.id
    },
    defaults: {
      parent_id: body.parent_id,
      e_start: body.expected_start,
      name: body.name,
      e_finish: body.expected_finish,
      deadline: body.promise_by,
      hrs_logged: body.hours_logged,
      date_done: body.done_on,
      hrs_remaning: body.high_effort_remaining,
      child_type: body.type.toLowerCase(),
      task_type: body.task_type
    }
  })
    .catch(error => {
      // Handle request error 
      request({
        url: process.env.SLACK_WEBHOOK_URL,
        method: 'POST',
        json: {
          text: "Error: " + error
        }
      }, function (error, response, body) {
        console.log(body);
      })
    })
    .then(treeitem => {
      treeitem[0].update({
        parent_id: body.parent_id,
        e_start: body.expected_start,
        name: body.name,
        e_finish: body.expected_finish,
        deadline: body.promise_by,
        hrs_logged: body.hours_logged,
        date_done: body.done_on,
        hrs_remaning: body.high_effort_remaining,
        child_type: body.type.toLowerCase(),
        task_type: body.task_type
      })
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

  // find CFT ID
  var CFT_ids = await db.cft.findAll({
    attributes: ['id']
  })
  // for each item in the parent_ids 
  for (let i = 0; i < body.parent_ids.length; i++ ) {
    // check each ID in the cft_ids array
    let parent_id = body.parent_ids[i]
    if (CFT_ids.indexOf(parent_id) !== -1) {
      update_object.cft_id = parent_id
    }
  }


  // FIND OR CREATE THE LOCATION THEN UPDATE IT WITH THE NEW DATA
  return db.lp_project.upsert(update_object).then(() => {
    db.treeitem.findOrCreate(
      {
        where: {
          id: body.id
        },
        defaults: {
          e_start: body.expected_start,
          name: body.name,
          e_finish: body.expected_finish,
          deadline: body.promise_by,
          hrs_logged: body.hours_logged,
          date_done: body.done_on,
          hrs_remaning: body.high_effort_remaining,
          child_type: body.type.toLowerCase()
        }
      })
      .catch(error => {
        // Handle request error 
        request({
          url: process.env.SLACK_WEBHOOK_URL,
          method: 'POST',
          json: {
            text: "Error: " + error
          }
        }, function (error, response, body) {
          console.log(body);
        })
      })
      .then(treeitem => {
        treeitem[0].update({
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
  })
}