var Sequelize = require("sequelize")
const Op = Sequelize.Op
//Models
var db = require("../models")
var moment = require('moment');

module.exports = function (app, passport) {
    app.get('/reports/at-risk-projects', checkAuthentication, function (req, res) {
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
                    [Op.or]: [{
                        'task_name': {
                            [Op.like]: '%Activation%'
                        }
                    },
                    {
                        'task_name': {
                            [Op.like]: '%Launch%'
                        }
                    }
                    ]

                }
            }]

        }).then(results => {
            console.log(results)
            // send over the projects lp_space_id to create links on page and moment to change the date 
            res.render('pages/at_risk_projects', { user: req.user, projects: results, lp_space_id: process.env.LPWorkspaceId, moment: moment });
        })
    });

    function checkAuthentication (req, res, next) {
        if (req.isAuthenticated()) {
            // if user is looged in, req.isAuthenticated() will return true
            next()
        } else {
            res.redirect('/g5_auth/users/auth/g5')
        }
    }
} 