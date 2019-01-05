const dates = require('./dates.controller')
module.exports = {
  all
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