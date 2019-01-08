const mrrController = require('./mrr.controller')
const dates = require('./dates.controller')
const site_data = require('./site_data.controller')
const psMRRReports = '/ps/reports/mrr'
const quater_month_map = {
  1: {
    months: [1, 2, 3],
  },
  2: {
    months: [4, 5, 6]
  },
  3: {
    months: [7, 8, 9]
  },
  4: {
    months: [10, 11, 12]
  }
}
module.exports = {
  dashboard,
  yearDetails,
  quarterDetails,
  yearDetailArchive
}
async function dashboard(req, res) {

  var month = await mrrController.month_detail()
  var quarter = await mrrController.quarter_detail()
  var year = await mrrController.year_detail()

  month.name = dates.moment(`${dates.currentMonth()}/1/${dates.currentYear()}`).format('MMM - YYYY')
  quarter.name = `Q${dates.currentQuarter()} ${dates.currentYear()}`
  year.name = dates.currentYear()

  month.class = site_data.checkVariance(month.total, month.target)
  quarter.class = site_data.checkVariance(quarter.total, quarter.target)
  year.class = site_data.checkVariance(year.total, year.target)
  let quick_look_reports = [month, quarter, year]

  res.render('pages/ps/index', { user: req.user, slug: 'home', site_data: site_data.all(), quick_look_reports, quick_look_reports })
}
async function yearDetailArchive(req, res) {
  // get all years from 2018 - forward
  let years = site_data.archive_years()
  let yearReports = []
  for (i = 0; i < years.length; i++) {
    let year = years[i]
    let yearDetails = await mrrController.year_detail(year)
    yearDetails.name = year
    yearDetails.link = `${psMRRReports}/${year}`
    yearDetails.class = site_data.checkVariance(yearDetails.total, yearDetails.target)
    yearReports.push(yearDetails)
  }
  res.render('pages/ps/reports/mrr', { user: req.user, slug: 'mrr', site_data: site_data.all(), details: yearReports, cols: 12 })
}
async function yearDetails(req, res) {
  var year = parseInt(req.params.year)
  // get the needed dates for links
  quarters = []
  for (let quarter = 1; quarter < 5; quarter++) {
    let quarterDetails = await mrrController.quarter_detail(quarter, year)
    quarterDetails.name = `Q${quarter}`
    quarterDetails.link = `${psMRRReports}/${year}/quarter/${quarter}`
    quarterDetails.class = site_data.checkVariance(quarterDetails.total, quarterDetails.target)
    quarters.push(quarterDetails)
  }
  res.render('pages/ps/reports/mrr', { user: req.user, slug: 'mrr', site_data: site_data.all(), details: quarters, cols: 3 });
}
async function quarterDetails(req, res) {
  // parse the year and month params out of the URL 
  var quarter = parseInt(req.params.quarter)
  var year = parseInt(req.params.year)
  let months = quater_month_map[quarter].months
  details = []
  for (let i = 0; i < months.length; i++) {
    let month = months[i]
    let monthDetails = await mrrController.month_detail(month, year)
    monthDetails.name = dates.moment(`${month}/1/${year}`).format('MMM - YYYY')
    monthDetails.class = site_data.checkVariance(monthDetails.total, monthDetails.target)
    details.push(monthDetails)
  }
 res.render('pages/ps/reports/mrr', { user: req.user, slug: 'mrr', site_data: site_data.all(), details: details, cols: 4 })
}