module.exports = {
  getAllUsers,
  getJobs,
  getMRRGoals
}
const db = require('../models')
const site_data = require('../controllers/site_data.controller')


async function getAllUsers (req, res) {
  var users = await db.user.findAll()
  res.render('pages/users', { user: req.user, users: users, slug: "users", site_data: site_data.all() });
}

async function getJobs (req, res) {
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
  res.render('pages/admin_update', { slug: "update", user: req.user, jobs: jobs, site_data: site_data.all() })
}

async function getMRRGoals (req, res) {
  let cft_targets = await db.mrr_targets.findAll({
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
 let dept_targets = await db.mrr_targets.findAll({
     where: {
         cft_id: null
     },
     order: [
         ['year', 'DESC'],
         ['month', 'DESC']
     ]
 })
 res.render('pages/goals', { user: req.user, slug: "goals", site_data: site_data.all(), dept_targets: dept_targets, cft_targets: cft_targets });

}