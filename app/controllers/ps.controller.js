const mrrController = require('./mrr.controller')
const dates = require('./dates.controller')
const site_data = require('./site_data.controller')
const psMRRReports = '/ps/reports/mrr'
const teamMRRController = require('./teamMrr.controller')
const teamController = require('./team.controller')
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
  yearDetailArchive,
  teamActivatedDetails,
  mrrDetailsDashboard,

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
async function teamActivatedDetails(req, res) {
  var id = parseInt(req.params.teamid)
  var month = parseInt(req.params.month)
  var year = parseInt(req.params.year)

  var today = dates.today()
  if (month === undefined || year === undefined) {
    month = dates.currentMonth()
    year = dates.currentYear()
  }
  var firstDay = dates.firstDay(month, year)
  var lastDay = dates.lastDay(month, year)
  var cft_name = await teamController.getName(id)


  if (id === 0) {
    var no_team = await teamMRRController.non_associated_range(firstDay, lastDay)
    
    res.render('pages/ps/reports/no_team_mrr_detail', { user: req.user, results: no_team, slug: 'mrr', site_data: site_data.all() })
  } else {
    var lbs = await teamMRRController.activated(firstDay, lastDay, id)
      for (i = 0; i < lbs.length; i++) {
        lbs[i].total_mrr = lbs[i].lbs.reduce((prev, cur) => prev + cur.total_mrr, 0)
      }
      res.render('pages/ps/reports/team_mrr_detail', { user: req.user, projects: lbs, lp_space_id: process.env.LPWorkspaceId, slug: 'mrr', site_data: site_data.all(), cftName: cft_name });
  }
}
async function mrrDetailsDashboard(req, res) {
  // get all LBS items launched this month and match to project and CFT and sum the totals for each team
  var month = parseInt(req.params.month)
  var year = parseInt(req.params.year)

  teamDetails = []
  var teams = await teamController.realTeams()
  for (let i = 0; i < teams.length; i++) {
    var teamId = teams[i].id
    teamDetail = await __teamDashboard(month, year, teamId)
    teamDetail.name = teams[i].name
    teamDetails.push(teamDetail)
  }
  res.render('pages/ps/reports/team_mrr', { user: req.user, teamMrr: teamDetails, site_data: site_data.all(), slug: 'mrr' })
}

async function __teamDashboard(month, year, teamId) {

  var today = dates.today()
  if (month === undefined || year === undefined) {
    month = dates.currentMonth()
    year = dates.currentYear()
  }
  var firstDay = dates.firstDay(month, year)
  var lastDay = dates.lastDay(month, year)
  var backlogfirstDay = firstDay

  if (dates.moment(today).isAfter(firstDay)) {
    backlogfirstDay = today
  }
  var backlog = 0
  // get starting backlog
  var startingBacklog = await teamMRRController.startingBacklog(month, year, teamId)
  // get target 
  var target = await teamMRRController.target(month, year, teamId)
  // get current backlog
  var  backlog = {
    value: 0,
    link: `/ps/reports/mrr/teams/backlog/${teamId}/${year}/${month}`
}
  if (dates.moment(today).isBefore(lastDay)) {
    backlog.value = await teamMRRController.backlog(backlogfirstDay, lastDay, teamId)
}
  // get activated
  var activated =  {
    value: await teamMRRController.activatedTotal(firstDay, lastDay, teamId),
    link: `/ps/reports/mrr/teams/${teamId}/${year}/${month}` 
  }
  // calculate % of backlog activated
  var backlogPercent = {
    percent: teamMRRController.percent(startingBacklog, activated.value),
    class: site_data.checkVariance(activated.value, startingBacklog)
  } 
  // caluclate the % of target activated
  var targetPercent = {
    percent: teamMRRController.percent(target, activated.value),
    class: site_data.checkVariance(activated.value, target)
  } 
 
  var details = {
    activated,
    startingBacklog,
    backlog,
    target,
    backlogPercent,
    targetPercent
  }
  return details
}