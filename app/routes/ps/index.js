var auth = require('../../controllers/auth.controller')
var mrr = require('../../controllers/reportcontroller')
var moment = require('moment')
var page_data = require('../../lib/page_links')
var reportcontroller = require('../../controllers/reportcontroller')
var psPath = '/ps'

module.exports = function (app, passport) {

  app.get(`${psPath}/`, auth.basic, function (req, res) {
    // get todays month
    var month_detail = mrr.month_detail()
    var quarter_detail = mrr.quarter_detail()
    var year_detail = mrr.year_detail()
    let link_data = page_data()

    // mrr targets
    let month_targets = mrr.month_target(link_data.date.month, link_data.date.year)
    let quarter_targets = mrr.quarter_target(link_data.quarter, link_data.date.year)
    let year_targets = mrr.year_target(link_data.date.year)

    Promise.all([month_detail, quarter_detail, year_detail, month_targets, quarter_targets, year_targets]).then(function (values) {

      let month = {
        name: moment(link_data.date.month + '/1/' + link_data.date.year).format( 'MMM - YYYY'),
        psActivated: values[0][1],
        daActivated: values[0][2],
        backlog: values[0][3],
        activatedMRR: values[0][0],
        totalMRR: values[0][0] + values[0][3],
        target: values[3],
        variance: (values[0][0] + values[0][3]) - values[3]
      }
      let quarter = {
        name: 'Q' + link_data.quarter + ' ' + link_data.date.year,
        totalMRR: values[1][0] + values[1][3],
        psActivated: values[1][1],
        daActivated: values[1][2],
        backlog: values[1][3],
        activatedMRR: values[1][0],
        target: values[4],
        variance: (values[1][0] + values[1][3]) - values[4]
      }
      let year = {
        name: link_data.date.year,
        psActivated: values[2][1],
        daActivated: values[2][2],
        backlog: values[2][3],
        activatedMRR: values[2][0],
        totalMRR: values[2][0] + values[2][3],
        target: values[5],
        variance: (values[2][0] + values[2][3]) - values[5]
      }
      month = checkValues(month)
      quarter = checkValues(quarter)
      year = checkValues(year)
      month.class = reportcontroller.checkVariance(month.totalMRR, month.target)
      quarter.class = reportcontroller.checkVariance(quarter.totalMRR, quarter.target)
      year.class = reportcontroller.checkVariance(year.totalMRR, year.target)
      let quick_look_reports = [month, quarter, year]

      res.render('pages/ps/index', { user: req.user, slug: 'home', link_data: link_data, moment: moment, quick_look_reports, quick_look_reports })
    })
  })

  // require all of the PS report routes
  require('./reports/index')(app, passport)
}

function checkValues (object) {
  for (i = 0; i < Object.keys(object).length; i++) {
    let key = Object.keys(object)[i]
    if (object[key] === null) {
      object[key] = 0
    }
    if (key !== 'name') {
      object[key] = object[key].toLocaleString()
    }
  }
  return object
}