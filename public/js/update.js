function UpdatebuttonClick () {
  $('.updateGoal').click(function () {
    // find the parent row
    var button = $(this)
    let row = $(this).parents('tr')
    // get the values of this row
    var cft_id = row.find('.team :selected').val()
    var month = row.find('.month :selected').val()
    var year = row.find('.year').val()
    var target = row.find('.goal').val()
    var id = $(button).attr('goal_id')
    var update = {
      month,
      year,
      target
    }
    if (cft_id) {
      update.cft_id = parseInt(cft_id)
    }
    if (id) {
      update.id = parseInt(id)
    }
    // change the text of the button to updating 
    $(button).text('Updating')
    // post them to the update endpoint
    $.ajax({
      type: "POST",
      url: '/api/goals/update',
      data: update,
      success: function (data) {
        // if the response is 200 then change the text of the button to updated
        $(button).text('Updated')
      },
      dataType: 'JSON'
    });
    console.log(update)
  })
}

$('#addRow_dept').click(function () {
  var table = $('#dept_goals')
  var html = '<tr class="goal"><td><select class="form-control month"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option></select></td><td><input class="year" type="text" value="null"/></td><td><input class="goal" type="text" value="null"/></td><td><button class="btn btn-success updateGoal">Update</button></td></tr>'
  $(table).prepend(html)
  UpdatebuttonClick()
})
$('#addRow').click(function () {
  var table = $('#cft_goals')
  var html = '<tr class="goal"><td class="form-group"><select class="form-control team"><option value="46132814">Violeta</option><option value="46132817">>Touch of Grey</option><option value="46132815">The Gold Standard</option><option value="46132816">Stored Up FTFU</option><option value="46132813">Run Like the Winded</option><option value="44790301">El Coco Loco</option></select><td><select class="form-control month"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option></select></td><td><input class="year" type="text" value="null"/></td><td><input class="goal" type="text" value="null"/></td><td><button class="btn btn-success updateGoal">Update</button></td></tr>'
  $(table).prepend(html)
  UpdatebuttonClick()
})
UpdatebuttonClick()