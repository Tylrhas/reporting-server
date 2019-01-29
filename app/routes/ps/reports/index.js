const auth = require('../../../controllers/auth.controller')
var psReportPath = '/ps/reports'
module.exports = function (app, passport) {

  app.get(`${psReportPath}/`, auth.basic, function (req, res) {
    res.send('There is no index page for PS Reports')
  })

  // Import all reporting routes
  require('./mrr')(app, passport)
  require('./workload')(app, passport)
  require('./milestone')(app, passport)
}