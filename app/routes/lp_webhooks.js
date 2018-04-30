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
}