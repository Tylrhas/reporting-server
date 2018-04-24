var Sequelize = require("sequelize")
const Op = Sequelize.Op
//Models
var db = require("../models")
var moment = require('moment');

module.exports = function (app, passport) {
    // app.get('/reports/pmweightedprojects', function (req, res) {
    //     res.render('pages/pmweight', { user: req.user });
    // });

    // app.get('/reports/monthlygoals', function (req, res) {
    //     res.render('pages/monthlygoals', { user: req.user });
    // });

    app.get('/reports/at-risk-projects', function (req, res) {
        db.lp_project.findAll({
            attributes: ['project_name'],
            include: [{
                attributes: ['task_name', 'e_finish', 'deadline', 'project_id'],
                model: db.lp_task,
                where: {
                    'deadline': {
                        [Op.not]: null
                    },
                    'date_done': null,
                    'e_finish': {
                        [Op.gt]: Sequelize.col('deadline')
                    }, 
                        [Op.or]: [{'task_name': 'Activation Of Services'}, {'task_name': 'Launch Websites'}] 
                }
            }]

        }).then(results => {
            console.log(results)
            res.render('pages/at_risk_projects', {user: req.user, projects: results, lp_space_id: process.env.LPWorkspaceId, moment: moment});
        })
    });
} 