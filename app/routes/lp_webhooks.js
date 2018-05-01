var Sequelize = require("sequelize")
const Op = Sequelize.Op
var db = require("../models")

module.exports = function (app, passport) {
  app.post('/webhooks/tasks', function (req, res) {
    // LP Post to the webhood to update the task
    res.sendStatus(200)
    if (req.body.change_type === 'update') {
      //if change_type is update then update the record
      db.lp_task.update({
        e_start: req.body.expected_start,
        task_name: req.body.name,
        e_finish: req.body.expected_finish,
        deadline: req.body.promise_by,
        hrs_logged: req.body.hours_logged,
        date_done: req.body.done_on,
        hrs_remaning: req.body.high_effort_remaining,
        ready_on: req.body.custom_field_values['Ready To Start On']
      }, {
          where: {
            id: req.body.id
          }
        })

      // destroy the old partent ids from this task 
      db.lp_parent_id.destroy({
        where: {
          task_id: req.body.id,
        }
      })
      // add new partent ids for this task
      for (let i = 0; i < req.body.parent_ids.length; i++) {
        db.lp_parent_id.upsert({
          task_id: req.body.id,
          lp_parent_id: req.body.parent_ids[i]
        })
      }

    }
    else if (req.body.change_type === 'create') {

      // add this task to the database
      db.lp_task.create({
        id: req.body.id,
        task_name: req.body.name,
        e_start: req.body.expected_start,
        project_id: req.body.project_id,
        e_finish: req.body.expected_finish,
        deadline: req.body.promise_by,
        hrs_logged: req.body.hours_logged,
        date_done: req.body.done_on,
        hrs_remaning: req.body.high_effort_remaining,
        ready_on: req.body.custom_field_values['Ready To Start On']
      })
      // trigger update of the other fields that do not come in webhooks like inherited tags

      for (let i = 0; i < req.body.parent_ids.length; i++) {
        db.lp_parent_id.upsert({
          task_id: req.body.id,
          lp_parent_id: req.body.parent_ids[i]
        })
      }

    }
    else if (req.body.change_type === 'delete') {
      db.lp_task.destroy({
        where: {
          id: req.body.id
        }
      })
    }
  });

  app.post('/webhooks/projects', function (req, res) {
    // project webhook
    // LP Post to the webhood to update the task
    res.sendStatus(200)

    if (req.body.change_type === 'update') {
      console.log('update')
      console.log(req.body)

      let update_object = {
        project_name: req.body.name,
        done_on: req.body.done_on,
        started_on: req.body.started_on,
        earliest_finish: req.body.earliest_finish,
        earliest_start: req.body.earliest_start,
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
        phase: req.body.custom_field_values['PS Phase'],
        vertical: req.body.custom_field_values['Vertical'],
        mrr: req.body.custom_field_values['MRR'],
        otr_ps: req.body.custom_field_values['OTR - PS'],
        otr_cs: req.body.custom_field_values['OTR - CS'],
        integration_type: req.body.custom_field_values['Integration Type'],
        client_type: req.body.custom_field_values['Client Type']
      }

      // FIND OR CREATE THE LOCATION THEN UPDATE IT WITH THE NEW DATA
      db.lp_project.findOrCreate({ where: { id: req.body.id }, defaults: { project_name: req.body.name } }).then(project => {
        project.update(update_object)
      })

      // delete the old project priority
    }
    else if (req.body.change_type === 'create') {
      console.log('create')
      console.log(req.body)

      let update_object = {
        id: req.body.id,
        project_name: req.body.name,
        done_on: req.body.done_on,
        started_on: req.body.started_on,
        earliest_finish: req.body.earliest_finish,
        earliest_start: req.body.earliest_start,
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
        phase: req.body.custom_field_values['PS Phase'],
        vertical: req.body.custom_field_values['Vertical'],
        mrr: req.body.custom_field_values['MRR'],
        otr_ps: req.body.custom_field_values['OTR - PS'],
        otr_cs: req.body.custom_field_values['OTR - CS'],
        integration_type: req.body.custom_field_values['Integration Type'],
        client_type: req.body.custom_field_values['Client Type']
      }

      // FIND OR CREATE THE PROJECT 
      db.lp_project.create({update_object})
    }
    else if (req.body.change_type === 'delete') {
      // DELETE THE PROJECT AND ALL TASK ASSOCIATED WITH IT
      // delete the partent ids that are associates with the tasks 
      // delete the project priorities associated with the project
      console.log('delete')
      console.log(req.body)
    }

  })
}