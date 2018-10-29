var express = require('express')
var app = express()
var auth = require('../../../lib/auth/auth_check')

module.exports = function (app, passport, express) {
  var psReportingRouter = express.Router()
  // set the sub dir for all PS level pages
  app.use('/ps/reports', psReportingRouter)

  psReportingRouter.get('/', auth.basic, function (req, res) {
    res.send('There is no index page for PS Reports')
  })

  // Import all reporting routes
  var mrrReports = require('./mrr')(app, passport, express)
  var projectReports = require('./project')(app, passport, express)
  var workloadReports = require('./workload')(app, passport)
}