$(document).ready(function () {
  $('#cft').multiselect({
    onChange: function (option, checked, select) {
      filter()
    },
    onSelectAll: function () {
      // show all teams
      $('#active_projects tr').show()
      filter()
    },
    onDeselectAll: function () {
      // hide all teams
      $('#active_projects tr').slice(1).hide()
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
      filter()
    },
    onDeselectAll: function () {
      // hide all teams
      $('#active_projects tr').slice(1).hide()
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
      filter()
    },
    onDeselectAll: function () {
      // hide all teams
      $('#active_projects tr').slice(1).hide()
    },
    includeSelectAllOption: true,
    selectedClass: 'multiselect-selected',
  })

  // select all of the teams
  $('#package').multiselect('selectAll', false)
  $('#package').multiselect('updateButtonText')

  $('#estFinnish').multiselect({
    onChange: function (option, checked, select) {
      filter()
    },
    onSelectAll: function () {
      // show all teams
      $('#active_projects tr').show()
      filter()
    },
    onDeselectAll: function () {
      // hide all teams
      $('#active_projects tr').slice(1).hide()
    },
    includeSelectAllOption: true,
    selectedClass: 'multiselect-selected',
  })

  // select all of the go-live months
  $('#estFinnish').multiselect('selectAll', false)
  $('#estFinnish').multiselect('updateButtonText')

  $('#actual_go_live').multiselect({
    onChange: function (option, checked, select) {
      $('#active_projects tr').show()
      filter()
    },
    onSelectAll: function () {
      // show all teams
      $('#active_projects tr').show()
      filter()
    },
    onDeselectAll: function () {
      // hide all teams
      $('#active_projects tr').slice(1).hide()
    },
    includeSelectAllOption: true,
    selectedClass: 'multiselect-selected',
  })

  // select all of the go-live months
  $('#actual_go_live').multiselect('selectAll', false)
  $('#actual_go_live').multiselect('updateButtonText')
})

function filter () {
  var table = $('#active_projects tr')
  let lut = {
    team: 1,
    package: 2,
    projectType: 3,
    go_live: 4,
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
  estFinnishFilter = $('.estFinnish .multiselect-container>li.multiselect-selected:not(".multiselect-all") input').map(function () {
    return $(this).val()
  }).get()
  goLiveFilter = $('.actual_go_live .multiselect-container>li.multiselect-selected:not(".multiselect-all") input').map(function () {
    return $(this).val()
  }).get()
  console.log(teamFilter)
  console.log(packageFilter)
  console.log(projectTypeFilter)
  console.log(estFinnishFilter)
  console.log('filtering')

  for (let i = 0; i < table.length; i++) {
    let hide = false
    // for each row in the table check the tds for match with filter
    let tds = $(table[i]).children('td').map(function () {
      return $(this).text().trim();
    }).get()

    console.log(tds)


    if (tds.length !== 0) {
      // check if this row should be displayed or not
      if (teamFilter.indexOf(tds[lut.team].trim()) === -1) {
        hide = true
        console.log('no match')
        debugger
      } else if (packageFilter.indexOf(tds[lut.package].trim()) === -1) {
        hide = true
        console.log('no match')
        debugger
      } else if (projectTypeFilter.indexOf(tds[lut.projectType].trim()) === -1) {
        hide = true
        console.log('no match')
        debugger
      } else if (estFinnishFilter.indexOf(tds[lut.estFinnish].trim().substring(0, 3)) === -1) {
        hide = true
        console.log('no match')
        debugger
      } else if(goLiveFilter.indexOf(tds[lut.go_live].trim().substring(0, 3)) === -1) {
        hide = true
        console.log('no match')
        debugger
      }

      // hide row if needed
      if (hide) {
        $(table[i]).hide()
        console.log('hiding')
      } else {
        $(table[i]).show()
      }
    }

  }

}

$('#download_csv').click(function () {
  // gather all visable rows in the table
  let headers = $('table#active_projects thead tr').get().map(function (row) {
    return $(row).find('th').get().map(function (cell) {
      return $(cell).text().trim();
    })
  })
console.log(headers)
  let data = $('table#active_projects tbody tr:visible').get().map(function (row) {
    return $(row).find('td').get().map(function (cell) {
      return $(cell).text().trim();
    })
  })
  data = headers.concat(data)
  var csv = Papa.unparse(data);
// construct and download CSV
  var blob = new Blob([csv]);
  if (window.navigator.msSaveOrOpenBlob)  // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
    window.navigator.msSaveBlob(blob, "active_projects.csv");
  else {
    var a = window.document.createElement("a");
    a.href = window.URL.createObjectURL(blob, { type: "text/plain" });
    a.download = "active_projects.csv";
    document.body.appendChild(a);
    a.click();  // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
    document.body.removeChild(a);
  }

  console.log(csv)
})