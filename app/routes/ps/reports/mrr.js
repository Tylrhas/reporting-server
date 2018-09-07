var express = require('express')
var app = express()
var passport = require('passport')
var auth = require('../../../lib/auth/auth_check')
var Sequelize = require("sequelize")
const Op = Sequelize.Op
//Models
var db = require("../../../models")
var moment = require('moment');
var teamMrr = require('../../../lib/reports/team_mrr')
var cfts = require('../../../lib/reports/cft')
var page_data = require('../../../lib/page_links')

module.exports = function (app, passport, express) {
    var psMrrReportingRoutes = express.Router()
    // set the sub dirs for the PS MRR Reporting Routes
    app.use('/ps/reports/mrr', psMrrReportingRoutes)
    psMrrReportingRoutes.get('/', auth.basic, function (req, res) {
        res.send('there is no index page for mrr reports')
    })
    psMrrReportingRoutes.get('/teams', auth.basic, function (req, res) {
        var months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        let link_data = page_data()
        let years = teamMrr.archive_years()
        res.render('pages/ps/reports/team_mrr_goal_archive', { user: req.user, slug: 'mrr', moment: moment, link_data: link_data, years: years, months: months });
    })
    psMrrReportingRoutes.get('/teams/:year/:month', auth.basic, function (req, res) {
        // get all LBS items launched this month and match to project and CFT and sum the totals for each team

        var month = parseInt(req.params.month)
        var year = parseInt(req.params.year)

        let link_data = page_data(month, year)

        var firstDay = new Date(year, month - 1, 0);
        var lastDay = new Date(year, month, 0);

        firstDay.setHours(23, 59, 59, 999);
        lastDay.setHours(23, 59, 59, 999);

        var mrr = teamMrr.month(firstDay, lastDay)
        var teams = cfts.getall()
        var non_assigned_mrr = teamMrr.non_associated_total(firstDay, lastDay)


        Promise.all([mrr, teams, non_assigned_mrr]).then(results => {
            // set up an object with all teams and associated MRR
            var teamMrr = {}
            for (i = 0; i < results[1].length; i++) {
                let key = results[1][i].id
                teamMrr[key] = {
                    name: results[1][i].name,
                    mrr: 0
                }
            }

            for (i2 = 0; i2 < results[0].length; i2++) {
                let project = results[0][i2]
                let cft_id = results[0][i2].cft_id
                for (i3 = 0; i3 < project.lbs.length; i3++) {
                    let lbs_mrr = project.lbs[i3].total_mrr
                    teamMrr[cft_id].mrr = teamMrr[cft_id].mrr + lbs_mrr
                }
            }

            teamMrr = Object.keys(teamMrr).map(function (key) {
                return [key, teamMrr[key].name, teamMrr[key].mrr]
            })

            teamMrr[0][2] = teamMrr[0][2] + results[2]

            res.render('pages/ps/reports/team_mrr', { user: req.user, teamMrr: teamMrr, link_data: link_data, slug: 'mrr', moment: moment });
        })
    })
    psMrrReportingRoutes.get('/teams/:teamid/:year/:month', auth.basic, function (req, res) {
        var id = parseInt(req.params.teamid)
        var month = parseInt(req.params.month)
        var year = parseInt(req.params.year)

        var firstDay = new Date(year, month - 1, 0);
        var lastDay = new Date(year, month, 0);
        var cft_name = db.cft.findAll({ where: { id: id } })

        firstDay.setHours(23, 59, 59, 999);
        lastDay.setHours(23, 59, 59, 999);

        let link_data = page_data(month, year)

        if (id === 0) {
            var no_team = teamMrr.non_associated_range(firstDay, lastDay)

            no_team.then(results => {
                res.render('pages/ps/reports/no_team_mrr_detail', { user: req.user, results: results, slug: 'mrr', moment: moment, link_data: link_data });
            })
        } else {
            var lbs = teamMrr.month_id(firstDay, lastDay, id)
            Promise.all([cft_name, lbs]).then(results => {
                for (i = 0; i < results[1].length; i++) {
                    results[1][i].total_mrr = results[1][i].lbs.reduce((prev, cur) => prev + cur.total_mrr, 0)
                }
                res.render('pages/ps/reports/team_mrr_detail', { user: req.user, projects: results[1], lp_space_id: process.env.LPWorkspaceId, slug: 'mrr', moment: moment, link_data: link_data, cftName: results[0][0].name });
            })
        }
    })
}