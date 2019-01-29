const adminController = require('../controllers/admin.controller')
const adminRoute = '/admin'
const auth = require('../controllers/auth.controller')
module.exports = function (app, passport) {
  app.get(`${adminRoute}/users`, auth.isAdmin, adminController.getAllUsers)
  app.get(`${adminRoute}/update`, auth.isAdmin, adminController.getJobs)
  app.get(`${adminRoute}/goals/update`, auth.isAdmin, adminController.getMRRGoals)
}