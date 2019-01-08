const dates = require('./dates.controller')
module.exports = {
  all,
  checkVariance
} 

function all (month, year) {

  var siteData = {
    currentDate: date_data(),
    currentMonth: dates.moment(date_data()).format('MM') ,
    currentYear: dates.moment(date_data()).format('YYYY') ,
    currentQuarter: getQuarter(),
    convert: dates
  }
  if (month == null || year == null) {
      siteData.pageMonth = siteData.currentMonth
      siteData.pageYear = siteData.currentYear
      pageQuarter = siteData.currentQuarter
    }
  else {
    siteData.pageMonth = month,
    siteData.pageYear = year,
    pageQuarter = getQuarter(month + '/1/' + year)
  }
  return siteData
}
function getQuarter(d) {
  if (d == null){
    d = new Date();
  } else {
    d = new Date(d);
  }
  var m = Math.floor(d.getMonth()/3) +1;
  let quarter = m > 4? m - 4 : m;
  return quarter
}
function date_data () {
  var d = new Date();
  var date = {
    month: d.getMonth() + 1,
    year: d.getFullYear()
  }
  return date
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