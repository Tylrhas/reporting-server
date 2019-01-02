var auth = require('../../../lib/auth/auth_check')
var psReportPath = '/ps/reports'
module.exports = function (app, passport) {

  app.get(`${psReportPath}/`, auth.basic, function (req, res) {
    res.send('There is no index page for PS Reports')
  })

  // Import all reporting routes
  // require('./mrr')(app, passport, express)
  // var projectReports = require('./project')(app, passport, express)
  // var workloadReports = require('./workload')(app, passport)
}