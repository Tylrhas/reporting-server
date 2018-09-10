module.exports = function (month, year) {
  if (month == null || year == null) {
    return {
      date: date_data(),
      quarter: getQuarter()
    }
  }
  else {
    return {
      date: {
        month: month, 
        year: year,
        quarter: getQuarter(month + '/1/' + year)
      }
    }
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