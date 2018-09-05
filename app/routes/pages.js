var Sequelize = require("sequelize")
const Op = Sequelize.Op
//Models
var db = require("../models")
var moment = require('moment');
var teamMrr = require('../lib/reports/team_mrr')
var cfts = require('../lib/reports/cft')
var mrr = require('../controllers/reportcontroller')

module.exports = function (app, passport) {
    app.get('/', checkAuthentication, function (req, res) {
        // get todays month
        var month_detail = mrr.month_detail()
        var quarter_detail = mrr.quarter_detail()
        var year_detail = mrr.year_detail()
        var d = new Date();
        var date = {
            month: d.getMonth() +1,
            year: d.getFullYear()
        }

        Promise.all([month_detail, quarter_detail, year_detail]).then(function (values) {

            let quarter = {
                total_mrr: values[1][0] + values[1][3],
                ps_MRR: values[1][1],
                da_mrr: values[1][2],
                backlog_mrr: values[1][3],
                activatedMRR: values[1][0]
            }
            let month = {
                ps_MRR: values[0][1],
                da_mrr: values[0][2],
                backlog_mrr: values[0][3],
                activatedMRR: values[0][0],
                total_mrr: values[0][0] + values[0][3],
            }
            let year = {
                ps_MRR: values[2][1],
                da_mrr: values[2][2],
                backlog_mrr: values[2][3],
                activatedMRR: values[2][0],
                total_mrr: values[2][0] + values[2][3],
            }
            month = checkValues(month)
            quarter = checkValues(quarter)
            year = checkValues(year)

            res.render('pages/index', { user: req.user, slug: 'home', date: date, moment: moment, month: month, quarter: quarter, year: year })
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
}

function checkValues(object) {
    for (i = 0; i < Object.keys(object).length; i++) {
        let key = Object.keys(object)[i]
        if (object[key] === null) {
            object[key] = 0
        }
        object[key] = object[key].toLocaleString()
    }
    return object
}