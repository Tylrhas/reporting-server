var Sequelize = require("sequelize");
const Op = Sequelize.Op
var models = require('../models/index.js')
var moment = require('moment');
var page_data = require('../lib/page_links')
const adminRoute = '/admin'
const auth = require('../lib/auth/auth_check')
module.exports = function (app, passport) {


    app.get(`${adminRoute}/users`, auth.isAdmin, function (req, res) {
        let link_data = page_data()
        models.user.findAll().then(results => {
            res.render('pages/users', { user: req.user, users: results, slug: "users", moment: moment, link_data : link_data });
        })
    })
    app.get(`${adminRoute}/update`, auth.isAdmin, function (req, res) {
        let link_data = page_data()
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

    app.post('/api/goals/update', async function (req, res) {
        let body = req.body
        if ('id' in body) {
            let targets = await models.mrr_targets.upsert(body)
        } else {
            try {
                await models.mrr_targets.create(body)
            } catch (err) {
                console.log(err)
            }
        }
        res.send(200)
    })
    app.get(`${adminRoute}/goals/update`, auth.isAdmin, async function (req, res) {
         let link_data = page_data()
         let cft_targets = await models.mrr_targets.findAll({
            where: {
                cft_id: {
                    [Op.not]: null
                }
            },
            order: [
                ['year', 'DESC'],
                ['month', 'DESC'],
                ['cft_id', 'DESC']
            ]
        })
        let dept_targets = await models.mrr_targets.findAll({
            where: {
                cft_id: null
            },
            order: [
                ['year', 'DESC'],
                ['month', 'DESC']
            ]
        })
        res.render('pages/goals', { user: req.user, slug: "goals", moment: moment, link_data : link_data, dept_targets: dept_targets, cft_targets: cft_targets });

    })
}