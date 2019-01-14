const moment = require('moment')
const momentTz = require('moment-timezone')
const momentBusinessDays = require('moment-business-days')

momentBusinessDays.updateLocale('us', {
  workingWeekdays: [1, 2, 3, 4, 5]
})


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
  return moment().quarter(quarter).startOf('quarter').format()
}
function endOfQuarter(quarter) {
  return moment().quarter(quarter).endOf('quarter').format()
}
function startOfYear(year) {
  return moment().year(year).startOf('year').format()
}
function endOfYear(year) {
  return moment().year(year).endOf('year').format()
}
function firstDay(month, year) {
  return moment().month(--month).year(year).startOf('month').format()
}
function lastDay(month, year) {
  return moment().month(--month).year(year).endOf('month').format()
}
function bussinessDaysBetween (lastDay, firstDay) {
  let days
  if (moment(firstDay).isAfter(lastDay)) {
    days = moment(lastDay).diff(firstDay,'days')
  } else {
    days = momentBusinessDays(lastDay, 'MM-DD-YYYY').businessDiff(momentBusinessDays(firstDay,'MM-DD-YYYY'))
  }
  return days
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
  startOfYear,
  endOfYear,
  firstDay,
  lastDay,
  addPST,
  bussinessDaysBetween
}