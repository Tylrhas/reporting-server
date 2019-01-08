var moment = require('moment')
var momentTz = require('moment-timezone')

function pst_to_utc(date) {
  if (date !== null) {
    // strip any timezone information
    date = moment(date).tz('America/Los_Angeles')
    // add in PST
    date = momentTz(date).format()
    // convert to UTC
    date = moment(date).utc().format()
    if (date == 'Invalid date') {
      date = null
    }
  }
  return date
}
function utc_to_pst(date) {
  // add in PST
  date = momentTz(date, 'America/Los_Angeles').format()
  // convert to UTC
  date = moment(date).utc().format()
  if (date == 'Invalid date') {
    date = null
  }
  return date
}
function utc_to_pst_no_time(date) {
  if (date != null) {
  // convert to pst and remove hours 
  date = moment(date).tz('America/Los_Angeles').format('MM-DD-YYYY')
  if (date == 'Invalid date') {
    date = null
  }
  return date
} else {
  return null
}
}
function addPST(date) {
  return momentTz(date, 'America/Los_Angeles').format()
}
function now() {
  return moment().format()
}
function today() {
  return moment().startOf('day').format()
}
function currentMonth() {
  return moment().format('MM')
}
function currentDay() {
  return moment().format('DD')
}
function currentYear() {
  return moment().format('YYYY')
}
function currentQuarter() {
  return moment().quarter()
}
function startOfQuarter(quarter) {
  moment().quarter(quarter).startOf('quarter')
}
function endOfQuarter(quarter) {
  moment().quarter(quarter).endOf('quarter')
}
function firstDay(month, year) {
  return moment().month(--month).year(year).startOf('month').format()
}
function lastDay(month, year) {
  return moment().month(--month).year(year).endOf('month').format()
}
module.exports = {
  pst_to_utc,
  utc_to_pst,
  utc_to_pst_no_time,
  moment,
  momentTz,
  now,
  today,
  currentDay,
  currentMonth,
  currentYear,
  currentQuarter,
  endOfQuarter,
  startOfQuarter,
  firstDay,
  lastDay,
  addPST,
}