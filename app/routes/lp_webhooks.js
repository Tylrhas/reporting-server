var Sequelize = require("sequelize")
const Op = Sequelize.Op
var db = require("../models")

module.exports = function (app, passport) {
  app.post('/webhooks/tasks', function (req, res) {
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
      console.log(req.body)
      db.lp_folder.upsert({ id: req.body.parent_id, project_name: req.body.project_name, lp_folder_name: req.body.parent_crumbs[req.body.parent_crumbs.length - 1] })
        .then(results => {
          //create the new priority for this project
          for (let i = 0; i < req.body.global_priority.length; i++) {
            db.lp_project_priority.upsert({
              project_id: req.body.project_id,
              priority: req.body.global_priority[i],
              index: i,
            })
          }
        })
        .then(results => {
          //if change_type is update then update the record
          db.lp_task.upsert({
            id: req.body.id,
            e_start: req.body.expected_start,
            task_name: req.body.name,
            e_finish: req.body.expected_finish,
            deadline: req.body.promise_by,
            hrs_logged: req.body.hours_logged,
            date_done: req.body.done_on,
            hrs_remaning: req.body.high_effort_remaining,
            ready_on: req.body.custom_field_values['Ready To Start On'],
            parent_id: req.body.parent_id

          })
        })
    }
  });

  app.post('/webhooks/projects', function (req, res) {
    console.log('projects')
    console.log(req.body)
    // project webhook
    // LP Post to the webhood to update the task
    res.sendStatus(200)

    if (req.body.change_type === 'delete') {

      // delete the project priorities associated with the project
      console.log('delete')
      console.log(req.body)

      // DELETE THE PROJECT AND ALL TASK ASSOCIATED WITH IT
      db.lp_project.destroy({
        where: {
          id: req.body.id
        }
      })
      // find all tasks associated with a project
      db.lp_task.findAll({
        where: {
          project_id: req.body.id
        }
      }).then(tasks => {
        for (let i = 0; i < tasks.length; i++) {
          let task = tasks[i].id
          //destroy the task
          task.destroy();
        }
      })

      db.lp_project_priority.destroy({
        where: {
          project_id: req.body.id
        }
      })
    }
    else {
      //create the new priority for this project
      var promises = []
      for (let i = 0; i < req.body.global_priority.length; i++) {
        promises.push(db.lp_project_priority.upsert({
          project_id: req.body.id,
          priority: req.body.global_priority[i],
          index: i,
        }))
      }
      Promise.all(promises)
    .then(() => {
      let update_object = {
        project_name: req.body.name,
        done_on: req.body.done_on,
        started_on: req.body.started_on,
        expected_finish: req.body.expected_finish,
        expected_start: req.body.expected_start,
        is_done: req.body.is_done,
        is_on_hold: req.body.is_on_hold,
        promise_by: req.body.promise_by,
        // BEGIN CUSTOM FIELDS
        launch_day: req.body.custom_field_values['Launch Day'],
        launch_month: req.body.custom_field_values['Launch Month'],
        project_impact: req.body.custom_field_values['Project Impact'],
        launch_type: req.body.custom_field_values['Launch Type'],
        project_type: req.body.custom_field_values['Project Type'],
        package: req.body.custom_field_values['Package'],
        services_activated: req.body.custom_field_values['Services Activated'],
        risk_level: req.body.custom_field_values['Risk Level'],
        ps_phasephase: req.body.custom_field_values['PS Phase'],
        vertical: req.body.custom_field_values['Vertical'],
        mrr: req.body.custom_field_values['MRR'],
        otr_ps: req.body.custom_field_values['OTR - PS'],
        otr_cs: req.body.custom_field_values['OTR - CS'],
        integration_type: req.body.custom_field_values['Integration Type'],
        client_type: req.body.custom_field_values['Client Type']
      }

      // FIND OR CREATE THE LOCATION THEN UPDATE IT WITH THE NEW DATA
      db.lp_project.upsert(update_object)
    })

    }

  })

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

  app.post('/webhooks/folders', function (req, res) {
    res.sendStatus(200)
    console.log('folders')
    console.log(req.body)
    if (req.body.change_type === 'update') {
      db.lp_folder.findOrCreate({ where: { id: req.body.id }, defaults: { project_name: req.body.name } }).then(project => {
        project[0].update(update_object)
      })
    }
    else if (req.body.change_type === 'create') {
      db.lp_folder.findOrCreate({ where: { id: req.body.id }, defaults: { project_name: req.body.name } }).then(project => {
        project[0].update(update_object)
      })
    }
    else if (req.body.change_type === 'delete') {

    }

  })
}