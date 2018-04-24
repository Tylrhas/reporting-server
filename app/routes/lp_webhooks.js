var Sequelize = require("sequelize")
const Op = Sequelize.Op
var db = require("../models")

module.exports = function (app, passport) {
  app.post('/webhooks/tasks', function (req, res) {
    // LP Post to the webhood to update the task
    res.sendStatus(200)
    console.log(req.body)
    if (req.body.change_type === 'update') {
      //if change_type is update then update the record
      db.lp_task.findAll({
        where: {
          id: req.body.treeitem_id
        }
      }).then(task => {
        task.update({e_start: req.body.expected_start, e_finish: req.body.expected_finish, deadline:req.body.promise_by, hrs_logged:req.body.hours_logged, date_done:req.body.done_on, hrs_remaning:req.body.high_effort_remaining})
      })
    }
  });
}