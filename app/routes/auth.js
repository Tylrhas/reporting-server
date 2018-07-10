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
        // Successful authentication, render home.
    //    var active_projects = db.lp_project.count({
    //         where: {
    //             is_done: false,
    //             expected_finish: {
    //                 [Op.not]: null
    //             },
    //             is_on_hold: {
    //                 [Op.not]: true
    //             }
    //         }
    //       }).then(results => {
    //           return results;
    //       });

    //     var at_risk_projects  = db.lp_project.count({
    //         distinct: true,
    //         include: [{
    //             model: db.lp_task,
    //             where: {
    //                 'deadline': {
    //                     [Op.not]: null
    //                 },
    //                 'date_done': null,
    //                 'e_finish': {
    //                     [Op.gt]: Sequelize.col('deadline')
    //                 },
    //                 [Op.or]: [{
    //                     'task_name': {
    //                         [Op.like]: '%Activation%'
    //                     }
    //                 },
    //                 {
    //                     'task_name': {
    //                         [Op.like]: '%Launch%'
    //                     }
    //                 }
    //                 ]

    //             }
    //         }]
    //       }).then(results => {
    //         return results;
    //     });

    //       var deadline_passed  = db.lp_project.count({
    //         include: [{
    //             model: db.lp_task,
    //             where: {
    //             date_done:  null,
    //             e_finish: {
    //                 [Op.not]: null
    //             },
    //             deadline: {
    //                 [Op.lt]: moment().format('YYYY-MM-DD')

    //             }
    //         }
    //     }]
    //       }).then(results => {
    //         return results;
    //     });


    //     Promise.all([active_projects, at_risk_projects, deadline_passed]).then(function (values) {
    //         console.log(values)
    //         res.render('pages/index', { user: req.user, slug:'home', active_projects: values[0], at_risk_projects: values[1], deadline_passed: values[2]})
    //       })
    res.render('pages/index', { user: req.user, slug:'home', active_projects: 1, at_risk_projects: 2, deadline_passed: 3})
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