const apiController = require('../controllers/api.controller')
const jobController = require('../controllers/job.controller')
const lsbController = require('../controllers/lsb.controller')
const auth = require('../controllers/auth.controller')

module.exports = function (app, passport) {
  // Begin Data Endpoints 
  app.get('/api/projects', apiController.getAllProjects)
  app.get('/api/projects/:project_id', apiController.getProject)
  // End Data Endpoints

  // Begin Liquidplanner -> 360 integration
  app.put('/api/360/lbs', auth.isAdmin, lsbController.update) 
  app.get('/api/360/lbs/locations/csv', lsbController.locations)
  app.get('/api/360/lbs/projects/csv', lsbController.projects)
  // End Liquidplanner -> 360 integration

  // Begin Job Endpoints
  app.put('/api/lbs', auth.isAdmin, lsbController.updateNSDates)
  app.put('/api/lbs/match', auth.isAdmin, lsbController.match)
  app.put('/api/jobs/archive', auth.isAdmin, jobController.updateArchiveProjects)
  app.put('/api/jobs/active', auth.isAdmin, jobController.updateActiveProjects)
  // End Job Endpoints

  app.put('/api/goals', auth.isAdmin, apiController.updateGoal)
 

  // app.get('/api/jobs/updatetasks', auth.basic , apiController.updatelptasksapi)
  // app.get('/api/projects/update', apiController.updateProjects)
  // app.get('/api/treeitems', apiController.getTreeItems)
  // app.post('/api/admin/user/update',auth.isAdmin, apiController.updateUser);
  // app.post('/api/admin/update/projects/archived', apiController.updateArchivedProjects)
  // app.get('/api/admin/lbs/match', auth.isAdmin, apiController.findLBSProjects)
  // app.get('/api/admin/teams/update', isAdmin, apiController.updateTeamProjects)
  // app.get('/api/views/testData', isAdmin, apiController.test_view);
}