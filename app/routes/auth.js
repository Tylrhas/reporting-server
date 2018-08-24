var Sequelize = require("sequelize")
const Op = Sequelize.Op
//Models
var db = require("../models")
var moment = require('moment')

module.exports = function (app, passport) {

    app.get('/g5_auth/users/auth/g5',
        passport.authenticate('oauth2'))

    app.get('/g5_auth/users/auth/g5/callback',
        passport.authenticate('oauth2', { failureRedirect: '/g5_auth/users/auth/g5' }),
        function (req, res) {
            // Successful authentication, redirect home.
            res.redirect('/')
        })

    app.get('/', checkAuthentication, function (req, res) {
        // get todays month
        var date = new Date();
        var firstDay = new Date(date.getFullYear(), date.getMonth() , 0);
        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        var month = date.getMonth()
        firstDay.setHours(23,59,59,999);
        lastDay.setHours(23,59,59,999);

        var backlogMonthlyMRR = db.lbs.findAll({
            attributes: ['total_mrr'],
            where: {
                estimated_go_live: {
                    [Op.between]: [firstDay, lastDay]
                },
                actual_go_live: null
            }
        })

        var activatedMonthlyMRR = db.lbs.findAll({
            attributes: ['total_mrr'],
            where: {
                actual_go_live: {
                    [Op.between]: [firstDay, lastDay]
                }
            }
        })
        // Successful authentication, render home.
        var active_projects = db.lp_project.count({
            where: {
                is_done: false,
                is_archived: false,
                is_on_hold: false,
                expected_finish: {
                    [Op.not]: null
                }
            }
        })

        Promise.all([active_projects, backlogMonthlyMRR, activatedMonthlyMRR]).then(function (values) {
            // calculate the estimated go-live MRR for august
            var backlog_mrr = 0
            for (i = 0; i < values[1].length; i++) {
                backlog_mrr = backlog_mrr + values[1][i].total_mrr
            }

            var activatedMRR = 0
            for (i = 0; i < values[2].length; i++) {
                activatedMRR = activatedMRR + values[2][i].total_mrr
            }

            res.render('pages/index', { user: req.user, slug: 'home', active_projects: values[0], backlog_mrr: backlog_mrr.toLocaleString(), activatedMRR: activatedMRR.toLocaleString(),  date: date, moment:moment  })
        })
        // res.render('pages/index', { user: req.user, slug: 'home', active_projects: 1 })
    })

    function checkAuthentication (req, res, next) {
        if (req.isAuthenticated()) {
            // if user is looged in, req.isAuthenticated() will return true
            next()
        } else {
            res.redirect('/g5_auth/users/auth/g5')
        }
    }

    function isAdmin (req, res, next) {
        if (req.isAuthenticated() && req.user.group == 'admin') {
            return next();
        }
        else {
            res.redirect('/');
        }
    }
}