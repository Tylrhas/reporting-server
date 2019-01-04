var moment = require('moment')
var momentTz = require('moment-timezone')

function pst_to_utc (date) {
  // strip any timezone information
  date = moment(date)
  // add in PST
  date = momentTz(date, 'America/Los_Angeles').format()
  // convert to UTC
  date = moment(date).utc().format()
  if (date == 'Invalid date') {
    date = null
  }
  return date
}
function addPST (date) {
  return momentTz(date, 'America/Los_Angeles').format()
}
function now() {
  return moment().format()
}
function today() {
  return moment().format('MM-DD-YYYY')
}
function currentMonth() {
  return moment().format('MM')
}
function currentDay () {
  return moment().format('DD')
}
function currentYear () {
  return moment().format('YYYY')
}
function firstDay (month, year) {
  return moment().month(--month).year(year).startOf('month').format('MM-DD-YYYY HH:mm:ss')
}
function lastDay (month, year) {
  return moment().month(--month).year(year).endOf('month').format('MM-DD-YYYY HH:mm:ss')
}
module.exports = {
  pst_to_utc,
  moment,
  momentTz,
  now,
  today,
  currentDay,
  currentMonth,
  currentYear,
  firstDay,
  lastDay,
  addPST
}