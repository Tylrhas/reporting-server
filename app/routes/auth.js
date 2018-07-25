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
        var active_projects = db.lp_project.count({
            where: {
                is_done: false,
                is_archived: false,
                is_on_hold: false,
                expected_finish: {
                    [Op.not]: null
                }
            },
        }).then(results => {
            return results;
        });


        Promise.all([active_projects]).then(function (values) {
            res.render('pages/index', { user: req.user, slug: 'home', active_projects: values[0]})
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