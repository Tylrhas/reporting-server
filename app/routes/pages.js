var Sequelize = require("sequelize")
const Op = Sequelize.Op
//Models
var db = require("../models")
var moment = require('moment');

module.exports = function (app, passport) {
    app.get('/reports/active-projects', checkAuthentication, function (req, res) {
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
                res.render('pages/active_projects', { user: req.user, projects: results[1], cfts: results[0], projectType: projectType, package: package, lp_space_id: process.env.LPWorkspaceId, moment: moment, slug: 'active-projects' });
            })
    })
    app.get('/reports/activations/month/:month/:year', checkAuthentication, function (req, res) {
        //  get the first and last day of the month
        let firstMonth = parseInt(req.params.month) - 1
        let lastMonth = parseInt(req.params.month)
        var first = new Date(req.params.year, firstMonth, 1);
        var last = new Date(req.params.year, lastMonth, 0);
        // get all locations that have been launched in the month and year
        db.lbs.findAll({
            attributes: ['location_name', 'total_mrr', 'gross_ps', 'net_ps', 'total_ps_discount', 'gross_cs', 'net_cs', 'total_cs_discount'],
            include: [{
                attributes: ['date_done'],
                model: db.treeitem,
                where: {
                    'date_done': {
                        between: [first, last]
                    },
                }
            }]
        }).then(results => {
            res.send(results)
        })
    })
    app.get('/reports/activations/quarter/:quarter/:year', checkAuthentication, function (req, res) {
        //  get the first and last day of the month
        let quarter = parseInt(req.params.quarter)
        var year = req.params.year
        var firstMonth = null
        var lastMonth = null
        switch (quarter) {
            case 1:
                firstMonth = 0
                lastMonth = 3
                break;
            case 2:
                firstMonth = 3
                lastMonth = 6
                break;
            case 3:
                firstMonth = 6
                lastMonth = 9
                break;
            case 4:
                firstMonth = 9
                lastMonth = 12
                break;
            default:
                firstMonth = null
                lastMonth = null
        }
        var first = new Date(year, firstMonth, 1);
        var last = new Date(year, lastMonth, 0);
        // get all locations that have been launched in the month and year
        db.lbs.findAll({
            attributes: ['location_name', 'total_mrr', 'gross_ps', 'net_ps', 'total_ps_discount', 'gross_cs', 'net_cs', 'total_cs_discount'],
            include: [{
                attributes: ['date_done'],
                model: db.treeitem,
                where: {
                    'date_done': {
                        between: [first, last]
                    },
                }
            }]
        }).then(results => {
            res.send(results)
        })
    })
    app.get('/reports/teams/mrr/all', checkAuthentication , function (req, res) {

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

function checkActivationDate(activationDate, actual_go_live){
    if (activationDate == null && actual_go_live != null) {
        return actual_go_live
    } else if (activationDate != null && actual_go_live != null && moment(actual_go_live).isBefore(activationDate)) {
        return actual_go_live
    } else {
        return activationDate
    }
}

function checkEstimatedGoLiveDate(estimatedGolive, estimated_go_live){
    if (estimatedGolive == null && estimated_go_live != null) {
        return estimated_go_live
    } else if (estimatedGolive != null && estimated_go_live != null && moment(estimated_go_live).isAfter(estimatedGolive)) {
        return estimated_go_live
    } else {
        return estimatedGolive
    }
}