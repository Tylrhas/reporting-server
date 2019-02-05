const dates = require('./dates.controller')
module.exports = {
  all,
  checkVariance,
  archive_years,
  roundNumber,
  percent
} 

function all (month, year) {

  var siteData = {
    currentDate: dates.moment().format(),
    currentMonth: dates.moment(dates.moment().format()).format('MM') ,
    currentYear: dates.moment(dates.moment().format()).format('YYYY') ,
    currentQuarter: __getQuarter(),
    convert: dates,
    pageMonth: month,
    pageYear: year,
    pageQuarter: __getQuarter(month + '/1/' + year),
    LPWorkspaceId: process.env.LPWorkspaceId
  }
  if (month == null || year == null) {
      siteData.pageMonth = siteData.currentMonth
      siteData.pageYear = siteData.currentYear
      siteData.pageQuarter = siteData.currentQuarter
    }
  return siteData
}
function __getQuarter(d) {
  if (d == null){
    d = new Date();
  } else {
    d = new Date(d);
  }
  var m = Math.floor(d.getMonth()/3) +1;
  let quarter = m > 4? m - 4 : m;
  return quarter
}
function archive_years () {
  // get all years from 2018 to current year
  let start_year = 2018
  // get current year
  let ending_year = dates.currentYear()
  let years = []
  for (i = start_year; i <= ending_year; i++) {
    years.push(i)
  }
  return years
}
function checkVariance (total, target) {
  if (typeof total === 'string') {
    total = parseFloat(total.replace(/,/g , ''))
  }
  if (typeof target === 'string') {
    target = parseFloat(target.replace(/,/g , ''))
  }
  let variancePercent = 100 * (total / target)
  if (variancePercent > 90) {
    return 'green'
  } else if (variancePercent < 90 && variancePercent > 75) {
    return 'yellow'
  } else {
    return 'red'
  }
}

function roundNumber (number, digits) {
  if (number !== 0) {
    let power = Math.pow(10,digits) 
    number =  Math.round(number * power) / power
  }
  return number
}

function sum(total, num) {
  return total + num;
}

function percent(first, second) {
  return roundNumber(((first/ second)*100),2)
}

