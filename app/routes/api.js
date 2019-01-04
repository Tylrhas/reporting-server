const apiController = require('../controllers/api.controller')
const jobController = require('../controllers/job.controller')
const lsbController = require('../controllers/lsb.controller')
// var auth = require('../lib/auth/auth_check')

module.exports = function (app, passport) {
  // Begin Data Endpoints 
  app.get('/api/projects', apiController.getAllProjects)
  app.get('/api/projects/:project_id', apiController.getProject)
  app.put('/api/jobs/archive', jobController.updateArchiveProjects)
  app.put('/api/jobs/active', jobController.updateActiveProjects)
  // End Data Endpoints

  // Begin Liquidplanner -> 360 integration
  app.put('/api/admin/lbs', lsbController.update) 
  app.get('/api/admin/lbs/locations/csv', lsbController.locations)
  app.get('/api/admin/lbs/projects/csv', lsbController.projects)
  // End Liquidplanner -> 360 integration

  // Begin Job Endpoints
  app.put('/api/lbs', lsbController.updateNSDates)
  app.put('/api/lbs/match', lsbController.match)
  // End Job Endpoints
 

  // app.get('/api/jobs/updatetasks', auth.basic , apiController.updatelptasksapi)
  // app.get('/api/projects/update', apiController.updateProjects)
  // app.get('/api/treeitems', apiController.getTreeItems)
  // app.post('/api/admin/user/update',auth.isAdmin, apiController.updateUser);
  // app.post('/api/admin/update/projects/archived', apiController.updateArchivedProjects)
  // // start LP and NS integation endpoints
  // app.get('/api/admin/lbs/locations/csv', apiController.getLBSLocations)
  // app.get('/api/admin/lbs/projects/csv',apiController.getLBSProjects)
  // app.get('/update', apiController.lbsAPIUpdate)
  // app.post('/api/admin/lbs/backfill', apiController.backfillLBS)
  // // end LP and NS integation endpoints
  // app.get('/api/admin/lbs/match', auth.isAdmin, apiController.findLBSProjects)
  // app.get('/api/admin/teams/update', isAdmin, apiController.updateTeamProjects)
  // app.get('/api/views/testData', isAdmin, apiController.test_view);
}