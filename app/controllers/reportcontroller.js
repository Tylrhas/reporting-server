mrr = require('../lib/reports/mrr')

module.exports = {
  quarter_detail,
  month_detail,
  year_detail,
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

async function month_detail (month, year) {
  if (month == null || year == null) {
    // it is for the current month
    var date = new Date();
    month = date.getMonth()
    year = date.getFullYear()
    var day = date.getDate()
    var firstDay = new Date(year, month, 1)
    var backlogfirstDay = new Date(year, month, day)
    var lastDay = new Date(year, month + 1, 0)
    backlogfirstDay.setHours(0, 0, 0, 0)
  } else {
    var firstDay = new Date(year, month, 0)
    var lastDay = new Date(year, month + 1, 0)
  }
  firstDay.setHours(0, 0, 0, 0)
  lastDay.setHours(23, 59, 59, 999)

  var month_activated = mrr.activated_total(firstDay, lastDay)
  var ps_month_activated = mrr.activated_ps_total(firstDay, lastDay)
  var da_month_activated = mrr.activated_da_total(firstDay, lastDay)
  var month_backlog = mrr.backlog_total(backlogfirstDay, lastDay)

  return Promise.all([month_activated, ps_month_activated, da_month_activated, month_backlog])
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

  } else {

    var firstDay = new Date(quater_month_map[quarter].first + '/' + year)
    var lastDay = new Date(quater_month_map[quarter].last + '/' + year)
    firstDay.setHours(0, 0, 0, 0)
    lastDay.setHours(23, 59, 59, 999)

    var quarter_activated = mrr.activated_total(firstDay, lastDay)
    var ps_quater_activated = mrr.activated_ps_total(firstDay, lastDay)
    var da_quarter_activated = mrr.activated_da_total(firstDay, lastDay)
    var quarter_backlog = 0
  }
  return Promise.all([quarter_activated, ps_quater_activated, da_quarter_activated, quarter_backlog])
}

async function year_detail (year) {
  if (year == null) {
    var date = new Date()
    year = date.getFullYear()

    let firstDay = new Date(year, 0,1)
    let lastDay = new Date(year, 11,31)

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

  } else {
    let firstDay = new Date(year, 0,1)
    let lastDay = new Date(year, 11,0)
    firstDay.setHours(0, 0, 0, 0)
    lastDay.setHours(23, 59, 59, 999)
  
    var backlogfirstDay = new Date(year, month, day)
    backlogfirstDay.setHours(0, 0, 0, 0)
  
    var year_activated = mrr.activated_total(firstDay, lastDay)
    var ps_year_activated = mrr.activated_ps_total(firstDay, lastDay)
    var da_year_activated = mrr.activated_da_total(firstDay, lastDay)
    var year_backlog = 0

  }

  return Promise.all([year_activated, ps_year_activated, da_year_activated, year_backlog])
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