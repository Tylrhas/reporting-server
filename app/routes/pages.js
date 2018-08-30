var Sequelize = require("sequelize")
const Op = Sequelize.Op
//Models
var db = require("../models")
var moment = require('moment');
var teamMrr = require('../lib/reports/team_mrr')
var cfts = require('../lib/reports/cft')

module.exports = function (app, passport) {
    app.get('/', checkAuthentication, function (req, res) {
        // get todays month
        var date = new Date();
        var month = date.getMonth()
        var year = date.getFullYear()
        var firstDay = new Date(year, month , 0);
        var lastDay = new Date(year, month + 1, 0);
        firstDay.setHours(23,59,59,999);
        lastDay.setHours(23,59,59,999);

        var backlogMonthlyMRR = db.lbs.sum('total_mrr', {
            where: {
                estimated_go_live: {
                    [Op.between]: [firstDay, lastDay]
                },
                actual_go_live: null
            }
        })

        var activatedMonthlyMRR = db.lbs.sum('total_mrr', {
            where: {
                actual_go_live: {
                    [Op.between]: [firstDay, lastDay]
                }
            }
        })

        var ps_MRR = db.lbs.sum('total_mrr',{
            where: {
            total_mrr: {
                [Op.not]: null
              },
              actual_go_live: {
                [Op.between]: [firstDay, lastDay]
              },
              project_type: {
                [Op.notIn] : ["DA Rep & Social", "SEM Only", "Digital Advertising" ]
              }
            }
          })

          var da_mrr = db.lbs.sum('total_mrr',{
            where: {
            total_mrr: {
                [Op.not]: null
              },
              actual_go_live: {
                [Op.between]: [firstDay, lastDay]
              },
              project_type: ["DA Rep & Social", "SEM Only", "Digital Advertising" ]
              }
          })

        Promise.all([backlogMonthlyMRR, activatedMonthlyMRR, ps_MRR, da_mrr]).then(function (values) {
            // calculate the estimated go-live MRR for august
            total_mrr = values[0] + values[1]

            res.render('pages/index', { user: req.user, slug: 'home', total_mrr: total_mrr.toLocaleString() , backlog_mrr: values[0].toLocaleString(), activatedMRR: values[1].toLocaleString(), ps_MRR: values[2].toLocaleString(), da_mrr: values[3].toLocaleString() , year: year, month: month +1,  date: date, moment:moment  })
        })
        // res.render('pages/index', { user: req.user, slug: 'home', active_projects: 1 })
    })
    app.get('/reports/active-projects', checkAuthentication, function (req, res) {
        var date = new Date();
        var month = date.getMonth()
        var year = date.getFullYear()
        var projectType = ['Add Location', 'New', 'Migration', 'Transfer', 'Enh - General Enhancement', 'Enh - Branded Name Change', 'Internal Project', 'Corporate Only', 'Redesign']
        var package = ['Essential', 'Elite', 'Add - Existing Design', 'Expanded', 'Proven Path', 'New Package (combination)', 'Streamlined (retired)']
        let cft = db.cft.findAll({
            attributes: ['name']
        })
        let projects = db.lp_project.findAll({
            attributes: ['expected_finish', 'id', 'package', 'project_type', 'ps_phase'],
            where: {
                is_done: false,
                is_archived: false,
                is_on_hold: false,
                expected_finish: {
                    [Op.not]: null
                }
            },
            include: [
                {
                    attributes: ['id', 'name'],
                    model: db.treeitem,
                    where: {
                        child_type: 'project'
                    }
                },
                {
                    attributes: ['name'],
                    model: db.cft,
                },
                {
                    attributes: ['total_mrr', 'estimated_go_live', 'actual_go_live'],
                    model: db.lbs,
                }
            ]
        })
        Promise.all([cft, projects])
            .then(results => {
                console.log(results)
                for (i = 0; i < results[1].length; i++) {
                    // calculate the activated and unactivated MRR
                    if (results[1][i].hasOwnProperty('lbs')) {
                        results[1][i].activatedMRR = 0
                        results[1][i].unactivatedMRR = 0
                        results[1][i].activationDate = null
                        results[1][i].estimatedGolive = null
                        for (lbsi = 0; lbsi < results[1][i].lbs.length; lbsi++) {
                            let lbs = results[1][i].lbs[lbsi]
                            if (lbs.actual_go_live != null) {
                                // activated MRR
                                results[1][i].activatedMRR = results[1][i].activatedMRR + lbs.total_mrr
                                results[1][i].activationDate = checkActivationDate(results[1][i].activationDate, lbs.actual_go_live)
                                results[1][i].estimatedGolive = checkEstimatedGoLiveDate(results[1][i].estimatedGolive, lbs.estimated_go_live)
                            } else {
                                // unactivated MRR
                                results[1][i].unactivatedMRR = results[1][i].unactivatedMRR + lbs.total_mrr
                                results[1][i].activationDate = checkActivationDate(results[1][i].activationDate, lbs.actual_go_live)
                                results[1][i].estimatedGolive = checkEstimatedGoLiveDate(results[1][i].estimatedGolive, lbs.estimated_go_live)
                            }
                        }
                        // get the oldest go-live date and the furtheset away estimated - go-live date

                    }
                }
                // send over the projects lp_space_id to create links on page and moment to change the date 
                res.render('pages/active_projects', { user: req.user, projects: results[1], cfts: results[0], projectType: projectType, package: package, lp_space_id: process.env.LPWorkspaceId, moment: moment, slug: 'active-projects', month: month, year: year});
            })
    })
    app.get('/reports/mrr/:month/:year/teams', checkAuthentication, function (req, res) {
        // get all LBS items launched this month and match to project and CFT and sum the totals for each team

        var month = parseInt(req.params.month)
        var year = parseInt(req.params.year)

        var firstDay = new Date(year, month -1 , 0);
        var lastDay = new Date(year, month, 0);

        firstDay.setHours(23,59,59,999);
        lastDay.setHours(23,59,59,999);

        var mrr = teamMrr.month(firstDay, lastDay)
        var teams = cfts.getall()
        var non_assigned_mrr = teamMrr.non_associated_total()


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

            res.render('pages/team_mrr', { user: req.user, teamMrr: teamMrr, month: month, year: year, slug: 'mrr', moment: moment });
        })
    })
    app.get('/reports/mrr/:month/:year/teams/:teamid', checkAuthentication, function (req, res) {
        id = parseInt(req.params.teamid)
        var month = parseInt(req.params.month)
        var year = parseInt(req.params.year)

        var firstDay = new Date(year, month -1 , 0);
        var lastDay = new Date(year, month, 0);

        firstDay.setHours(23,59,59,999);
        lastDay.setHours(23,59,59,999);
        
        if (id === 0) {
           var no_team = teamMrr.non_associated_range(firstDay, lastDay)

           no_team.then(results => {
            res.render('pages/no_team_mrr_detail', { user: req.user, results: results, slug: 'mrr', moment: moment, month: month, year :year });
           })
        } else {
           var lbs = teamMrr.month_id(firstDay, lastDay, id)
           lbs.then(results => {
               for (i = 0; i < results.length; i++) {
                   results[i].total_mrr = results[i].lbs.reduce((prev, cur) => prev + cur.total_mrr, 0)
               }
            res.render('pages/team_mrr_detail', { user: req.user, projects: results, lp_space_id: process.env.LPWorkspaceId, slug: 'mrr', moment: moment, month: month, year :year  });
           })
        }
    })

    function isAdmin (req, res, next) {
        if (req.isAuthenticated() && req.user.user_group == 'admin') {

            return next();

        }
        else {
            res.redirect('/');
        }
    }
    function checkAuthentication (req, res, next) {
        if (req.isAuthenticated()) {
            // if user is looged in, req.isAuthenticated() will return true
            next()
        } else {
            res.redirect('/g5_auth/users/auth/g5')
        }
    }
}

function checkActivationDate (activationDate, actual_go_live) {
    if (activationDate == null && actual_go_live != null) {
        return actual_go_live
    } else if (activationDate != null && actual_go_live != null && moment(actual_go_live).isBefore(activationDate)) {
        return actual_go_live
    } else {
        return activationDate
    }
}

function checkEstimatedGoLiveDate (estimatedGolive, estimated_go_live) {
    if (estimatedGolive == null && estimated_go_live != null) {
        return estimated_go_live
    } else if (estimatedGolive != null && estimated_go_live != null && moment(estimated_go_live).isAfter(estimatedGolive)) {
        return estimated_go_live
    } else {
        return estimatedGolive
    }
}