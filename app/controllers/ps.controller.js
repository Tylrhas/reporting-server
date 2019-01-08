const mrrController = require('./mrr.controller')
const dates = require('./dates.controller')
const site_data = require('./site_data.controller')
module.exports = {
  dashboard
}
async function dashboard (req, res) {
  
  var month = await mrrController.month_detail()
  var quarter = await mrrController.quarter_detail()
  var year = await mrrController.year_detail()

    month.name =  dates.moment(dates.currentMonth() + '/1/' + dates.currentYear()).format( 'MMM - YYYY')
    quarter.name = `Q ${dates.currentQuarter()} ${dates.currentYear()}`
    year.name = dates.currentYear()

    month.class = site_data.checkVariance((month.actviated + month.backlog), month.target)
    quarter.class = site_data.checkVariance((quarter.actviated + quarter.backlog), quarter.target)
    year.class = site_data.checkVariance((year.actviated + year.backlog), year.target)
    let quick_look_reports = {month, quarter, year}

    res.render('pages/ps/index', { user: req.user, slug: 'home', site_data: site_data.all(), quick_look_reports, quick_look_reports })
}