const auth = require('../../controllers/auth.controller')
const psController = require('../../controllers/ps.controller')
const psPath = '/ps'

module.exports = function (app, passport) {

  app.get(`${psPath}/`, auth.basic, psController.dashboard)

  // require all of the PS report routes
  require('./reports/index')(app, passport)
}