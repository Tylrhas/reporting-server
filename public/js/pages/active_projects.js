$(document).ready(function () {
  $('#cft').multiselect({
    onChange: function (option, checked, select) {
      filter()
    },
    onSelectAll: function () {
      // show all teams
      $('#active_projects tr').show()
    },
    onDeselectAll: function () {
      // hide all teams
      $('#active_projects tr').hide()
    },
    includeSelectAllOption: true,
    selectedClass: 'multiselect-selected',
  })
  // select all of the teams
  $('#cft').multiselect('selectAll', false)
  $('#cft').multiselect('updateButtonText')

  $('#projectType').multiselect({
    onChange: function (option, checked, select) {
      filter()
    },
    onSelectAll: function () {
      // show all teams
      $('#active_projects tr').show()
    },
    onDeselectAll: function () {
      // hide all teams
      $('#active_projects tr').hide()
    },
    includeSelectAllOption: true,
    selectedClass: 'multiselect-selected',
  })

  // select all of the teams
  $('#projectType').multiselect('selectAll', false)
  $('#projectType').multiselect('updateButtonText')

  $('#package').multiselect({
    onChange: function (option, checked, select) {
      filter()
    },
    onSelectAll: function () {
      // show all teams
      $('#active_projects tr').show()
    },
    onDeselectAll: function () {
      // hide all teams
      $('#active_projects tr').hide()
    },
    includeSelectAllOption: true,
    selectedClass: 'multiselect-selected',
  })

  // select all of the teams
  $('#package').multiselect('selectAll', false)
  $('#package').multiselect('updateButtonText')

  $('#servicesActivated').multiselect({
    onChange: function (option, checked, select) {
      filter()
    },
    onSelectAll: function () {
      // show all teams
      filter()
    },
    onDeselectAll: function () {
      // hide all teams
      filter()
    },
    includeSelectAllOption: true,
    selectedClass: 'multiselect-selected',
  })

  // select all of the teams
  $('#servicesActivated').multiselect('selectAll', false)
  $('#servicesActivated').multiselect('updateButtonText')

  $('#estFinnish').multiselect({
    onChange: function (option, checked, select) {
      filter()
    },
    onSelectAll: function () {
      // show all teams
      filter()
    },
    onDeselectAll: function () {
      // hide all teams
      filter()
    },
    includeSelectAllOption: true,
    selectedClass: 'multiselect-selected',
  })

  // select all of the teams
  $('#estFinnish').multiselect('selectAll', false)
  $('#estFinnish').multiselect('updateButtonText')
})

function filter () {
  var table = $('#active_projects tr')
  let lut = {
    team: 1,
    package: 2,
    projectType: 3,
    servicesActivated: 4,
    estFinnish: 5
  }
  // get the filters
  teamFilter = $('.cft .multiselect-container>li.multiselect-selected:not(".multiselect-all") input').map(function () {
    return $(this).val()
  }).get()
  packageFilter = $('.package .multiselect-container>li.multiselect-selected:not(".multiselect-all") input').map(function () {
    return $(this).val()
  }).get()
  projectTypeFilter = $('.projectType .multiselect-container>li.multiselect-selected:not(".multiselect-all") input').map(function () {
    return $(this).val()
  }).get()
  servicesActivatedFilter = $('.servicesActivated .multiselect-container>li.multiselect-selected:not(".multiselect-all") input').map(function () {
    return $(this).val()
  }).get()
  estFinnishFilter = $('.estFinnish .multiselect-container>li.multiselect-selected:not(".multiselect-all") input').map(function () {
    return $(this).val()
  }).get()
  console.log('filtering')
  for (let i = 0; i < table.length; i++) {
    let hide = false
    // for each row in the table check the tds for match with filter
    let tds = $(table[i]).children('td').map(function () {
      return $(this).text().trim();
    }).get()



    if (tds.length !== 0) {
      // check if this row should be displayed or not
      if (teamFilter.indexOf(tds[lut.team].trim()) === -1) {
        hide = true
      } else if (packageFilter.indexOf(tds[lut.package].trim()) === -1) {
        hide = true
      } else if (projectTypeFilter.indexOf(tds[lut.projectType].trim()) === -1) {
        hide = true
      } else if (servicesActivatedFilter.indexOf(tds[lut.servicesActivated].trim()) === -1) {
        hide = true
      } else if (estFinnishFilter.indexOf(tds[lut.estFinnish].trim().substring(0, 3)) === -1) {
        hide = true
      }

      // hide row if needed
      if (hide) {
        $(table[i]).hide()
      } else {
        $(table[i]).show()
      }
    }

  }

}