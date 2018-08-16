var Sequelize = require("sequelize")
const Op = Sequelize.Op
//Models
var db = require("../models")
var moment = require('moment');

module.exports = function (app, passport) {
    app.get('/reports/active-projects', checkAuthentication, function (req, res) {
        var projectType = [ 'Add Location', 'New', 'Migration', 'Transfer', 'Enh - General Enhancement', 'Enh - Branded Name Change', 'Internal Project', 'Corporate Only', 'Redesign']
        var package = ['Essential','Elite', 'Add - Existing Design', 'Expanded', 'Proven Path', 'New Package (combination)','Streamlined (retired)']
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
                },
                {
                    attributes: ['name'],
                    model: db.cft,
                }
            ]
        })
        Promise.all([cft, projects])
            .then(results => {
                console.log(results)
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
