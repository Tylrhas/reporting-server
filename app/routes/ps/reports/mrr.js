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
var page_data = require('../../../lib/page_links')
var mrr = require('../../../lib/reports/mrr')
var reportController = require('../../../controllers/reportcontroller')
 // set the sub dirs for the PS MRR Reporting Routes
var ps_mrr_reports = '/ps/reports/mrr'

module.exports = function (app, passport, express) {   
   
    app.get(ps_mrr_reports + '/', auth.basic, function (req, res) {
        // get all years from 2018 - forward
        let years = mrr.archive_years()
        let link_data = page_data()
        let year_details = []
        for (i = 0 ; i < years.length; i++) {
            year_details.push(reportController.year_detail(years[i]))
        }
        Promise.all(year_details).then(results => {
            var year_quicklooks = []
            for (i = 0 ; i < results.length; i++) {
                let year_details = results[i]
                let year = {
                    name: year_details[5],
                    backlog: year_details[3].toLocaleString(),
                    activatedMRR: year_details[0].toLocaleString(),
                    totalMRR: (year_details[3] + year_details[0]).toLocaleString(),
                    variance:  (year_details[3] + year_details[0] - year_details[4]).toLocaleString(),
                    psActivated: year_details[1].toLocaleString(),
                    daActivated: year_details[2].toLocaleString(),
                    target: year_details[4].toLocaleString(),
                    link: '/ps/reports/mrr/' + year_details[5]
                }
                year.class = reportController.checkVariance(year.totalMRR, year.target)
                year_quicklooks.push(year)
            }
            res.render('pages/ps/reports/mrr', { user: req.user, slug: 'mrr', moment: moment, link_data: link_data, quick_look_reports: year_quicklooks, cols: 12 });        
        })
    })
    app.get(ps_mrr_reports + '/teams', auth.basic, function (req, res) {
        var months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        let link_data = page_data()
        let years = teamMrr.archive_years()
        res.render('pages/ps/reports/team_mrr_goal_archive', { user: req.user, slug: 'mrr', moment: moment, link_data: link_data, years: years, months: months });
    })
    app.get(ps_mrr_reports + '/teams/:year/:month', auth.basic, function (req, res) {
        // get all LBS items launched this month and match to project and CFT and sum the totals for each team

        var month = parseInt(req.params.month)
        var year = parseInt(req.params.year)

        let link_data = page_data(month, year)
        var team_dashboard = reportController.team_quick_look(month, year)

        Promise.all([team_dashboard]).then(results => {
            res.render('pages/ps/reports/team_mrr', { user: req.user, teamMrr: results[0], link_data: link_data, slug: 'mrr', moment: moment });
        })
    })
    app.get(ps_mrr_reports + '/teams/:teamid/:year/:month', auth.basic, function (req, res) {
        var id = parseInt(req.params.teamid)
        var month = parseInt(req.params.month)
        var year = parseInt(req.params.year)

        var firstDay = new Date(year, month - 1, 0);
        var lastDay = new Date(year, month, 0);
        var cft_name = db.cft.findAll({ 
         where: { 
          id: {
           [Op.not]: 48803247
          } 
         } 
        })

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
    app.get(ps_mrr_reports + '/teams/backlog/:teamid/:year/:month', auth.basic, async function (req, res) {
        var id = parseInt(req.params.teamid)
        var month = parseInt(req.params.month)
        var year = parseInt(req.params.year)
        var lastDay = new Date(year, month, 0)
        let link_data = page_data(month, year)
        // get the backlog for the team
        let lbs = await teamMrr.team_backlog_detail(id, lastDay)
        let cftName = await db.cft.findAll({ where: { id: id } })
        res.render('pages/ps/reports/team_backlog', { user: req.user, lbs: lbs, slug: 'team_backlog', lp_space_id: process.env.LPWorkspaceId, moment: moment, link_data: link_data, cftName: cftName[0] });
    })
    app.get(ps_mrr_reports + '/:year', auth.basic, function (req, res) {
        var year = parseInt(req.params.year)
        // get the needed dates for links
        let link_data = page_data()

        var year_details = reportController.year_view(year)

        Promise.all([year_details]).then(results => {
            
            for (i = 0; i < results[0].length; i++) {
                quarter = i + 1
                results[0][i].link = '/ps/reports/mrr/' + link_data.date.year + '/' + quarter
                results[0][i].class = reportController.checkVariance(results[0][i].totalMRR, results[0][i].target)
            }
            res.render('pages/ps/reports/mrr', { user: req.user, slug: 'mrr', moment: moment, link_data: link_data, quick_look_reports: results[0], cols: 3 });
        })

    })
    app.get(ps_mrr_reports + '/:year/:quarter', auth.basic, function (req, res) {
        // parse the year and month params out of the URL 
        var quarter = parseInt(req.params.quarter)
        var year = parseInt(req.params.year)

        // get the needed dates for links
        let link_data = page_data()

        var quarter_details = reportController.quarter_view(quarter, year)

        Promise.all([quarter_details]).then(results => {

            for (i = 0; i < results[0].length; i++) {
                results[0][i].class = reportController.checkVariance(results[0][i].totalMRR, results[0][i].target)
            }
            res.render('pages/ps/reports/mrr', { user: req.user, slug: 'mrr', moment: moment, link_data: link_data, quick_look_reports: results[0], cols: 4 });
        })
    })
}