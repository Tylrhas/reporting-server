module.exports = function (month, year) {
  if (month == null || year == null) {
    return {
      date: date_data()
    }
  }
  else {
    return {
      date: {
        month, year
      }
    }
  }
}

function date_data () {
  var d = new Date();
  var date = {
    month: d.getMonth() + 1,
    year: d.getFullYear()
  }
  return date
}