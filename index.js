//get env vars
require('dotenv').config()
//required elements
var express = require('express');
var app = express();
const https = require("https");

//required models for page load 
var locationmodel = require('./api/db/location');
var wisKpi  = require('./api/db/wis_kpi')
var jobs = require('./jobs/index')

function getQuarter(d) {
  d = d || new Date(); // If no date supplied, use today
  var q = [4,1,2,3];
  return q[Math.floor(d.getMonth() / 3)];
}

function getYear(){
return (new Date()).getFullYear()
}

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
//WIS KPI Chart
app.get('/wis/kpi/:name', function(request, response){
var data = wisKpi.getcurrentQuarterdata(getQuarter(),getYear(),request.params.name);
  response.render('pages/chart', {chart: data} );
})
app.get('/locations_launched', function(request, response) {
  //get all locations on initial page load
  var data = locationmodel.getAllLocationsnoAPI();
  response.render('pages/chart', {chart: data} );
});

app.get('/jobs', function(request, response) {
  response.render('pages/jobs');
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
// Require the job endpoints 
app.use('/jobs', require('./jobs/index'));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

