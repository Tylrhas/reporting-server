mrr = require('../lib/reports/mrr')
var db = require('../models')
var Sequelize = require("sequelize")
const Op = Sequelize.Op
var teamMrr = require('../lib/reports/team_mrr')
var cfts = require('../lib/reports/cft')

var moment = require('moment')

module.exports = {
  year_view,
  quarter_view,
  team_quick_look,
  quarter_detail,
  month_detail,
  year_detail,
  month_target,
  quarter_target,
  year_target,
  checkVariance
}

var quater_month_map = {
  1: {
    first: '01/01',
    last: '03/31'
  },
  2: {
    first: '04/01',
    last: '06/30'
  },
  3: {
    first: '07/01',
    last: '09/30'
  },
  4: {
    first: '10/01',
    last: '12/31'
  }
}
var quater_month_map_targets = {
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

function year_view (year) {
  // get details for all quarters
  var q1 = quarter_detail(1, year)
  var q2 = quarter_detail(2, year)
  var q3 = quarter_detail(3, year)
  var q4 = quarter_detail(4, year)

  return Promise.all([q1, q2, q3, q4]).then(results => {
    var details = []
    // transform the data to an object
    for (i = 0; i < results.length; i++) {
      var quarterNumber = i + 1
      let quarter_details = {
        name: 'Q' + quarterNumber,
        backlog: checkValue(results[i][3]),
        activatedMRR: checkValue(results[i][0]),
        totalMRR: checkValue((results[i][3] + results[i][0])),
        variance: checkValue((results[i][3] + results[i][0] - results[i][4])),
        psActivated: checkValue(results[i][1]),
        daActivated: checkValue(results[i][2]),
        target: checkValue(results[i][4])
      }
      details.push(quarter_details)
    }
    return details
  })
}
function quarter_view (quarter, year) {
  var month_promises = []
  var months = quater_month_map_targets[quarter].months
  for (i = 0; i < months.length; i++) {
    let month = months[i] - 1
    month_promises.push(month_detail(month, year))
  }

  return Promise.all(month_promises).then(results => {
    var details = []
    // transform the data to an object
    for (i = 0; i < results.length; i++) {
      quarterNumber = i + 1
      month_array = months[i]
      let quarter_details = {
        name: moment(month_array + '/1/' + year).format('MMM - YYYY'),
        backlog: checkValue(results[i][3]),
        activatedMRR: checkValue(results[i][0]),
        totalMRR: checkValue((results[i][3] + results[i][0])),
        variance: checkValue((results[i][3] + results[i][0] - results[i][4])),
        psActivated: checkValue(results[i][1]),
        daActivated: checkValue(results[i][2]),
        target: checkValue(results[i][4])
      }
      details.push(quarter_details)
    }
    return details
  })
}

function team_quick_look (month, year) {
  // get all LBS items launched this month and match to project and CFT and sum the totals for each team

  var firstDay = new Date(year, month - 1, 0);
  var lastDay = new Date(year, month, 0);
  var backlogfirstDay

  firstDay.setHours(23, 59, 59, 999);
  lastDay.setHours(23, 59, 59, 999);

  var mrr = teamMrr.month(firstDay, lastDay)
  var teams = cfts.getall()
  var non_assigned_mrr = teamMrr.non_associated_total(firstDay, lastDay)
  var cft_mrr_goals = teamMrr.month_goals(month, year)
  var cft_backlog = teamMrr.current_backlog(firstDay, lastDay)
  var cft_starting_backlog = teamMrr.starting_backlog(month, year)

  return Promise.all([mrr, teams, non_assigned_mrr, cft_mrr_goals, cft_backlog, cft_starting_backlog]).then(results => {
    // set up an object with all teams and associated MRR
    var teamMrr = {}
    for (i = 0; i < results[1].length; i++) {
      let key = results[1][i].id
      teamMrr[key] = {
        name: results[1][i].name,
        mrr: 0,
        target: 0
      }
    }
    // map targets to the correct team
    for (i3 = 0; i3 < results[3].length; i3++) {
      var team = results[3][i3]
      var team_id = team.cft_id
      teamMrr[team_id].target = team.target
      teamMrr[team_id].current_backlog = results[4][team_id].mrr
      teamMrr[team_id].starting_backlog = results[5][team_id].backlog
    }

    for (i2 = 0; i2 < results[0].length; i2++) {
      let project = results[0][i2]
      let cft_id = results[0][i2].cft_id
      for (i3 = 0; i3 < project.lbs.length; i3++) {
        let lbs_mrr = project.lbs[i3].total_mrr
        teamMrr[cft_id].mrr = teamMrr[cft_id].mrr + lbs_mrr
      }
    }


    teamMrr = Object.keys(teamMrr).map(function (key) {
      if (teamMrr[key].mrr == null) {
        teamMrr[key].mrr = 0
      }
      let target_percent = 100 * (teamMrr[key].mrr / teamMrr[key].target)
      let backlog_percent = 100 * (teamMrr[key].mrr / teamMrr[key].starting_backlog)
      teamMrr[key].backlog_percent = Math.round(backlog_percent * 100) / 100 
      teamMrr[key].target_percent = Math.round(target_percent * 100) / 100 
      teamMrr[key].target_class = checkVariance(teamMrr[key].mrr, teamMrr[key].target)
      teamMrr[key].starting_backlog_class = checkVariance(teamMrr[key].mrr, teamMrr[key].starting_backlog)
      return [key, teamMrr[key].name, teamMrr[key].mrr, teamMrr[key].target, teamMrr[key].current_backlog, teamMrr[key].backlog_percent, teamMrr[key].target_percent, teamMrr[key].starting_backlog, teamMrr[key].starting_backlog_class, teamMrr[key].target_class]
    })
    teamMrr[0][2] = teamMrr[0][2] + results[2]
    let not_associated = teamMrr.shift()
    teamMrr.push(not_associated)
    return teamMrr
  })

}

function month_target (month, year) {
  return db.mrr_targets.findAll({
    where: {
      month: month,
      year: year,
      cft_id: null
    }
  }).then(results => {
    return results[0].target
  })

}
function quarter_target (quarter, year) {
  quarter = quater_month_map_targets[quarter]
  console.log(quarter.months)
  return db.mrr_targets.sum('target', {
    where: {
      year: year,
      cft_id: null,
      month: {
        [Op.in]: quarter.months
      }
    }
  })
}
function year_target (year) {
  return db.mrr_targets.sum('target', {
    where: {
      year: year,
      cft_id: null
    }
  })
}
function month_detail (month, year) {
  var date = new Date();
  if (month == null || year == null) {
    // it is for the current month
    month = date.getMonth()
    year = date.getFullYear()
    var day = date.getDate()
    var firstDay = new Date(year, month, 1)
    var lastDay = new Date(year, month + 1, 0)
    var backlogfirstDay = new Date(year, month, day)
    backlogfirstDay.setHours(0, 0, 0, 0)

    var month_activated = mrr.activated_total(firstDay, lastDay)
    var ps_month_activated = mrr.activated_ps_total(firstDay, lastDay)
    var da_month_activated = mrr.activated_da_total(firstDay, lastDay)
    var month_backlog = mrr.backlog_total(backlogfirstDay, lastDay)

  } else if (month >= date.getMonth() && year >= date.getFullYear()) {
    var firstDay = new Date(year, month, 1)
    var lastDay = new Date(year, month + 1, 0)
    var day = date.getDate()
    var backlogfirstDay = new Date(year, month, day)
    backlogfirstDay.setHours(0, 0, 0, 0)

    var month_activated = mrr.activated_total(firstDay, lastDay)
    var ps_month_activated = mrr.activated_ps_total(firstDay, lastDay)
    var da_month_activated = mrr.activated_da_total(firstDay, lastDay)
    var month_backlog = mrr.backlog_total(backlogfirstDay, lastDay)

  } else {
    var firstDay = new Date(year, month, 1)
    var lastDay = new Date(year, month + 1, 0)
    var month_activated = mrr.activated_total(firstDay, lastDay)
    var ps_month_activated = mrr.activated_ps_total(firstDay, lastDay)
    var da_month_activated = mrr.activated_da_total(firstDay, lastDay)
    var month_backlog = mrr.backlog_total(backlogfirstDay, lastDay)
  }
  firstDay.setHours(0, 0, 0, 0)
  lastDay.setHours(23, 59, 59, 999)

  var target = mrr.month_target(month + 1, year)

  return Promise.all([month_activated, ps_month_activated, da_month_activated, month_backlog, target])

}

async function quarter_detail (quarter, year) {
  if (quarter == null || year == null) {
    // it is for the quarter month
    quarter = currentQuarter().quarter
    year = currentQuarter().year
    var date = new Date()
    var day = date.getDate()
    month = date.getMonth()
    year = date.getFullYear()
    var backlogfirstDay = new Date(year, month, day)
    backlogfirstDay.setHours(0, 0, 0, 0)
    var firstDay = new Date(quater_month_map[quarter].first + '/' + year)
    var lastDay = new Date(quater_month_map[quarter].last + '/' + year)
    firstDay.setHours(0, 0, 0, 0)
    lastDay.setHours(23, 59, 59, 999)

    var quarter_activated = mrr.activated_total(firstDay, lastDay)
    var ps_quater_activated = mrr.activated_ps_total(firstDay, lastDay)
    var da_quarter_activated = mrr.activated_da_total(firstDay, lastDay)
    var quarter_backlog = mrr.backlog_total(backlogfirstDay, lastDay)
    var quarter_target = mrr.quarter_target(quarter, year)

  } else if (quarter >= currentQuarter().quarter && year >= currentQuarter().year) {

    var date = new Date()
    var day = date.getDate()
    month = date.getMonth()
    year = date.getFullYear()
    var backlogfirstDay = new Date(year, month, day)
    backlogfirstDay.setHours(0, 0, 0, 0)

    var firstDay = new Date(quater_month_map[quarter].first + '/' + year)
    var lastDay = new Date(quater_month_map[quarter].last + '/' + year)
    firstDay.setHours(0, 0, 0, 0)
    lastDay.setHours(23, 59, 59, 999)


    var quarter_activated = mrr.activated_total(firstDay, lastDay)
    var ps_quater_activated = mrr.activated_ps_total(firstDay, lastDay)
    var da_quarter_activated = mrr.activated_da_total(firstDay, lastDay)
    var quarter_backlog = mrr.backlog_total(backlogfirstDay, lastDay)
    var quarter_target = mrr.quarter_target(quarter, year)
  }
  else {

    var firstDay = new Date(quater_month_map[quarter].first + '/' + year)
    var lastDay = new Date(quater_month_map[quarter].last + '/' + year)
    firstDay.setHours(0, 0, 0, 0)
    lastDay.setHours(23, 59, 59, 999)

    var quarter_activated = mrr.activated_total(firstDay, lastDay)
    var ps_quater_activated = mrr.activated_ps_total(firstDay, lastDay)
    var da_quarter_activated = mrr.activated_da_total(firstDay, lastDay)
    var quarter_target = mrr.quarter_target(quarter, year)
    var quarter_backlog = 0
  }
  return Promise.all([quarter_activated, ps_quater_activated, da_quarter_activated, quarter_backlog, quarter_target])
}

async function year_detail (year) {
  var date = new Date()
  if (year == null) {
    year = date.getFullYear()

    let firstDay = new Date(year, 0, 1)
    let lastDay = new Date(year, 11, 31)

    firstDay.setHours(0, 0, 0, 0)
    lastDay.setHours(23, 59, 59, 999)

    month = date.getMonth()
    var day = date.getDate()

    var backlogfirstDay = new Date(year, month, day)
    backlogfirstDay.setHours(0, 0, 0, 0)

    var year_activated = mrr.activated_total(firstDay, lastDay)
    var ps_year_activated = mrr.activated_ps_total(firstDay, lastDay)
    var da_year_activated = mrr.activated_da_total(firstDay, lastDay)
    var year_backlog = mrr.backlog_total(backlogfirstDay, lastDay)
    var year_target = mrr.year_target(year)

  } else if (date.getFullYear() === year) {
    let firstDay = new Date(year, 0, 1)
    let lastDay = new Date(year, 11, 0)
    firstDay.setHours(0, 0, 0, 0)
    lastDay.setHours(23, 59, 59, 999)
    month = date.getMonth()
    var day = date.getDate()
    var backlogfirstDay = new Date(year, month, day)
    backlogfirstDay.setHours(0, 0, 0, 0)

    var year_activated = mrr.activated_total(firstDay, lastDay)
    var ps_year_activated = mrr.activated_ps_total(firstDay, lastDay)
    var da_year_activated = mrr.activated_da_total(firstDay, lastDay)
    var year_backlog = mrr.backlog_total(backlogfirstDay, lastDay)
    var year_target = mrr.year_target(year)
  } else {
    let firstDay = new Date(year, 0, 1)
    let lastDay = new Date(year, 11, 0)
    firstDay.setHours(0, 0, 0, 0)
    lastDay.setHours(23, 59, 59, 999)

    var year_activated = mrr.activated_total(firstDay, lastDay)
    var ps_year_activated = mrr.activated_ps_total(firstDay, lastDay)
    var da_year_activated = mrr.activated_da_total(firstDay, lastDay)
    var year_backlog = 0
    var year_target = mrr.year_target(year)

  }

  return Promise.all([year_activated, ps_year_activated, da_year_activated, year_backlog, year_target, year])
}

function currentQuarter () {
  var d = new Date();
  var month = d.getMonth() + 1;
  var year = d.getFullYear()
  return {
    quarter: (Math.ceil(month / 3)),
    year: year
  }
}

function checkVariance (total, target) {
  if (typeof total === 'string') {
    total = parseFloat(total.replace(/,/g, ''))
  }
  if (typeof target === 'string') {
    target = parseFloat(target.replace(/,/g, ''))
  }
  let variancePercent = 100 * (total / target)
  if (variancePercent > 97) {
    return 'green'
  } else if (variancePercent < 93 && variancePercent > 97) {
    return 'yellow'
  } else {
    return 'red'
  }
}
function checkValue (number) {
  if (number === null) {
    return 0
  }
  else {
    return number.toLocaleString()
  }
}