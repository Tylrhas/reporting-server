var adminController = require('../controllers/admincontroller.js');
var Sequelize = require("sequelize");
var sequelize = new Sequelize(process.env.DATABASE_URL, { dialectOptions: { ssl: true } });
var models = require('../models/index.js')
var moment = require('moment');
var page_data = require('../lib/page_links')

module.exports = function (app, passport) {


    app.get('/admin/users', isAdmin, function (req, res) {
        let link_data = page_data()
        var d = new Date();
        var date = {
            month: d.getMonth() + 1,
            year: d.getFullYear()
        }
        models.user.findAll().then(results => {
            res.render('pages/users', { user: req.user, users: results, slug: "users", moment: moment, link_data : link_data });
        })
    })
    app.get('/admin/update', isAdmin, function (req, res) {
        let link_data = page_data()
        var d = new Date();
        var date = {
            month: d.getMonth() + 1,
            year: d.getFullYear()
        }
        models.job.findAll().then(results => {
            // Transform the data
            let jobs = {}
            for (let i = 0; i < results.length; i++) {
                jobs[results[i].jobname] = {
                    lastRunStatus: results[i].lastrunstatus,
                    lastRun: results[i].lastrun,
                    status: results[i].status
                }
            }
            res.render('pages/csv_upload', { slug: "update", user: req.user, jobs: jobs, moment: moment, link_data: link_data })
        })
    })

    app.post('/admin/goals/update', async function (req, res) {
        let body = req.body
        let targets = await models.mrr_targets.findOrCreate({
            where: {
                cft_id: body.cft_id,
                month: body.month,
                year: body.year
            },
            defaults: { 
                cft_id: body.cft_id,
                month: body.month,
                year: body.year,
                target: body.target
            }
        })
        res.send('Goals Updated')
    })


    function isAdmin (req, res, next) {
        if (req.isAuthenticated() && req.user.user_group == 'admin') {

            return next();

        }
        else {
            res.redirect('/');
        }
    }
}