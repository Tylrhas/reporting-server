const db = require('../models')
const LPauth = "Basic " + new Buffer(process.env.LpUserName + ":" + process.env.LPPassword).toString("base64")
const scheduledimplementation = require('./scheduledImp.controller')
const site_data = require('./site_data.controller')
module.exports = {
  dashboard,
  cftDashboard,
  teamActiveProjects,
  teamScheduledProjects,
  allProjects
}
async function dashboard (req, res) {
  var builder = {}
  var buildRemainingURL = process.env.LP_BUILDER_REMAINING
  var buildLoggedURL = process.env.LP_BUILDER_LOGGED
  if (req.query.start_date && req.query.end_date) {
   var start_date = moment(req.query.start_date).format('YYYY-MM-DD')
   var end_date = moment(req.query.end_date).format('YYYY-MM-DD')
   // if start and end dates are set use those instead
   buildRemainingURL = buildRemainingURL + '?start_date=' + start_date + '&end_date=' + end_date
   buildLoggedURL = buildLoggedURL + '?start_date=' + start_date + '&end_date=' + end_date
  }
  // get the report of hours remaining 

  builder.remaining = await throttledRequest.promise({ url: buildRemainingURL, method: 'GET', headers: { "Authorization": LPauth } })
  // get the report of hours logged
  builder.logged = await throttledRequest.promise({ url: buildLoggedURL, method: 'GET', headers: { "Authorization": LPauth } })

  builder.remaining.total_hours = 0
  builder.remaining.needs_scheduled = 0
  builder.logged.total_hours = 0
  builder.total_availableHours = 0

  // count the build teams remaining availability hours
  for (let i = 0; i < builder.logged.rows.length; i++) {
   //DO NOT COUNT NEEDS WIS OR NEEDS WIS CONTRACTOR 
   if (builder.logged.rows[i].name !== 'needs_WIS' || builder.logged.rows[i].name !== 'needs_WISContractor') {
    builder.remaining.total_hours = builder.remaining.total_hours + parseFloat(builder.logged.rows[i].hours_unscheduled)
   }
  }
  // count the needs wis and nees wis contract hours
  for (let i = 0; i < builder.remaining.rows.length; i++) {
   if (builder.remaining.rows[i].name === 'needs_WIS' || builder.remaining.rows[i].name === 'needs_WISContractor') {
    builder.remaining.needs_scheduled = builder.remaining.needs_scheduled + parseFloat(builder.remaining.rows[i].hours_remaining)
   }
  }
  // count the hours logged for the team
  for (let i = 0; i < builder.logged.rows.length; i++) {
   if (builder.logged.rows[i].name !== 'needs_WIS' || builder.logged.rows[i].name !== 'needs_WISContractor') {
    builder.logged.total_hours = builder.logged.total_hours + parseFloat(builder.logged.rows[i].hours_logged)
   }
  }

  // count the hours available for the build teams
  for (let i = 0; i < builder.logged.rows.length; i++) {
   //DO NOT COUNT NEEDS WIS OR NEEDS WIS CONTRACTOR 
   if (builder.logged.rows[i].name !== 'needs_WIS' || builder.logged.rows[i].name !== 'needs_WISContractor') {
    builder.total_availableHours = builder.total_availableHours + builder.logged.rows[i].hours_available
   }
  }
  // res.json(builder)
  res.render('pages/ps/reports/workload.ejs', { user: req.user, slug: 'wordload', lp_space_id: process.env.LPWorkspaceId, site_data: site_data.all(), builder: builder })
 }

 async function cftDashboard (req, res) {
  // get all teams
  let queue = await scheduledimplementation.getQueue()
  res.render('pages/ps/reports/team_workload.ejs', { user: req.user, slug: 'team_wordload', lp_space_id: process.env.LPWorkspaceId, site_data: site_data.all(), queue: queue })
 }

 async function teamActiveProjects (req, res) {
  var cft_id = parseInt(req.params.teamID)
  // get all active project for a team
  var activeProjects = await scheduledimplementation.getActiveProjects(cft_id)

  // res.json(activeProjects)
  res.render('pages/scheduledimp.ejs', { user: req.user, slug: 'team_wordload', lp_space_id: process.env.LPWorkspaceId, site_data: site_data.all(), projects: activeProjects })

  // var activeProjects = await projects.activeCount({ is_done: false, is_archived: false, is_on_hold: false, cft_id: cft_id })
 }

 async function teamScheduledProjects (req, res) {
  var teamID = parseInt(req.params.teamID)
  // get all active project for a team
  var scheduledProjects = await scheduledimplementation.getScheduledProjects(teamID)

  // res.json(activeProjects)
  res.render('pages/scheduledimp.ejs', { user: req.user, slug: 'team_wordload', lp_space_id: process.env.LPWorkspaceId, site_data: site_data.all(), projects: scheduledProjects })
 }
 async function allProjects (req, res) {
  var teamID = parseInt(req.params.teamID)
  // get all active project for a team
  var allProjects = await scheduledimplementation.getAllProjects(teamID)

  // res.json(activeProjects)
  res.render('pages/scheduledimp.ejs', { user: req.user, slug: 'team_wordload', lp_space_id: process.env.LPWorkspaceId, site_data: site_data.all(), projects: allProjects })
 }