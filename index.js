//required elements
var express = require('express');
var app = express();
const https = require("https");

//required models for page load 
var locationmodel = require('./api/models/locationmodel');

//basic configs for the app
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//get the index from the routes folder
app.get('/', function(request, response) {
  response.render('pages/index');
});
app.get('/locations_launched', function(request, response) {
  //get all locations on initial page load
  var data = locationmodel.getAllLocations();
  response.render('pages/chart', {chart: data} );
});

// shows you have to get the config vars
app.get('/times', function(request, response) {
    var result = ''
    var times = process.env.TIMES || 5
    for (i=0; i < times; i++)
      result += i + ' ';
  response.send(result);
});

// Require the API endpoints 
app.use('/api', require('./api/routes/index'));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});