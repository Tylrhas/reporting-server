const db = require('../models')
const site_data = require('../controllers/site_data.controller')
const adminRoute = '/admin'
const auth = require('./auth')
module.exports = function (app, passport) {


  app.get(`${adminRoute}/users`, async function (req, res) {
    var users = await db.user.findAll()
    res.render('pages/users', { user: req.user, users: users, slug: "users", site_data: site_data.all() });

  })
  app.get(`${adminRoute}/update`, async function (req, res) {
    var results = await db.job.findAll()
    // Transform the data
    let jobs = {}
    for (let i = 0; i < results.length; i++) {
      jobs[results[i].jobname] = {
        lastRunStatus: results[i].lastrunstatus,
        lastRun: results[i].lastrun,
        status: results[i].status
      }
    }

    res.render('pages/csv_upload', { slug: "update", user: req.user, jobs: jobs, moment: moment, link_data: link_data.page() })

  })

  // app.post('/api/goals/update', async function (req, res) {
  //     let body = req.body
  //     if ('id' in body) {
  //         let targets = await models.mrr_targets.upsert(body)
  //     } else {
  //         try {
  //             await models.mrr_targets.create(body)
  //         } catch (err) {
  //             console.log(err)
  //         }
  //     }
  //     res.send(200)
  // })
  // app.get(`${adminRoute}/goals/update`, auth.isAdmin, async function (req, res) {
  //      let link_data = page_data()
  //      let cft_targets = await models.mrr_targets.findAll({
  //         where: {
  //             cft_id: {
  //                 [Op.not]: null
  //             }
  //         },
  //         order: [
  //             ['year', 'DESC'],
  //             ['month', 'DESC'],
  //             ['cft_id', 'DESC']
  //         ]
  //     })
  //     let dept_targets = await models.mrr_targets.findAll({
  //         where: {
  //             cft_id: null
  //         },
  //         order: [
  //             ['year', 'DESC'],
  //             ['month', 'DESC']
  //         ]
  //     })
  //     res.render('pages/goals', { user: req.user, slug: "goals", moment: moment, link_data : link_data, dept_targets: dept_targets, cft_targets: cft_targets });

  // })
}