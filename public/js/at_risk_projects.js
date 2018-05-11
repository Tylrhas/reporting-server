function filterStartEndProjects() {
  $('table tbody tr td:nth-child(4)').each(function (i, el) {
    //check the date and if it doesnt fall in the needed range hide it
    var date = moment($(this).text(), ['MMM-DD-YYYY']).format()
    var end_date = moment($('#end_date').val()).format()
    var start_date = moment($('#start_date').val()).format()
    if (moment(date).isBefore(start_date, 'day') || moment(date).isAfter(end_date, 'day')) {
      //if it is not inbetween the two dates hide it 
      console.log( $(el).parent())
      $(el).parent().hide()
    }
  })
}

function filterEndDate() {
  $('table tbody tr td:nth-child(4)').each(function (i, el) {
    //check the date and if it doesnt fall in the needed range hide it
    var date = moment($(this).text(), ['MMM-DD-YYYY']).format()
    var end_date = moment($('#end_date').val()).format()
    if (moment(date).isAfter(end_date, 'day')) {
      //if it is not inbetween the two dates hide it 
      console.log($(el).parent())
      $(el).parent().hide()
    }
  })
}

function filterStartDate() {
  $('table tbody tr td:nth-child(4)').each(function (i, el) {
    //check the date and if it doesnt fall in the needed range hide it
    var date = moment($(this).text(), ['MMM-DD-YYYY']).format()
    var start_date = moment($('#start_date').val()).format()
    if (moment(date).isBefore(start_date, 'day')) {
      //if it is not inbetween the two dates hide it 
      console.log($(el).parent())
      $(el).parent().hide()
    }
  })
}