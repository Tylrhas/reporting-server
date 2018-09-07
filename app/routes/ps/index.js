var auth = require('../../lib/auth/auth_check')
var mrr = require('../../controllers/reportcontroller')
var moment = require('moment')
var page_data = require('../../lib/page_links')

var auth = require('../../lib/auth/auth_check')
// index rout for /ps
module.exports = function (app, passport, express) {
  var psRouter = express.Router()
  psRouter.get('/', auth.basic, function (req, res) {
    // get todays month
    var month_detail = mrr.month_detail()
    var quarter_detail = mrr.quarter_detail()
    var year_detail = mrr.year_detail()
    let link_data = page_data()


    Promise.all([month_detail, quarter_detail, year_detail]).then(function (values) {

      let month = {
        name: 'This Month',
        ps_MRR: values[0][1],
        da_mrr: values[0][2],
        backlog_mrr: values[0][3],
        activatedMRR: values[0][0],
        total_mrr: values[0][0] + values[0][3],
      }
      let quarter = {
        name: 'This Quarter',
        total_mrr: values[1][0] + values[1][3],
        ps_MRR: values[1][1],
        da_mrr: values[1][2],
        backlog_mrr: values[1][3],
        activatedMRR: values[1][0]
      }
      let year = {
        name: 'This Year',
        ps_MRR: values[2][1],
        da_mrr: values[2][2],
        backlog_mrr: values[2][3],
        activatedMRR: values[2][0],
        total_mrr: values[2][0] + values[2][3],
      }
      month = checkValues(month)
      quarter = checkValues(quarter)
      year = checkValues(year)
      let quick_look_reports = [month, quarter, year]

      res.render('pages/ps/index', { user: req.user, slug: 'home', link_data: link_data, moment: moment, quick_look_reports, quick_look_reports })
    })
    // res.render('pages/index', { user: req.user, slug: 'home', active_projects: 1 })
  })

  // set the sub dir for all PS level pages
  app.use('/ps', psRouter)

  var reports = require('./reports/index')(app, passport, express)
}

function checkValues(object) {
  for (i = 0; i < Object.keys(object).length; i++) {
      let key = Object.keys(object)[i]
      if (object[key] === null) {
          object[key] = 0
      }
      object[key] = object[key].toLocaleString()
  }
  return object
}