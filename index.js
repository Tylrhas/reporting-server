//GET THE ENV VARS
require('dotenv').config()

//REQUIRED PACKAGES
var favicon = require('serve-favicon')
var path = require('path')
var express = require('express');
var app = express();
const https = require("https");

//REQUIRED MODULES
var locationmodel = require('./api/db/location')
var wisKpi  = require('./api/db/wis_kpi')
var jobs = require('./jobs/index')

//CONFIGS
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')))
app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//INDEX PAGE
app.get('/', function(request, response) {
  response.render('pages/index');
});

//REPORTS
app.get('/wis/kpi/:name', function(request, response){
var data = wisKpi.getcurrentQuarterdata(getQuarter(),getYear(),request.params.name)
  response.render('pages/chart', {chart: data} );
})
app.get('/locations_launched', function(request, response) {
  //get all locations on initial page load
  var data = locationmodel.getAllLocationsnoAPI()
  response.render('pages/chart', {chart: data} )
});
app.get('/monthlygoals', function(request, response) {
  response.render('pages/monthlygoals');
});


//ADMIN PAGES
app.get('/jobs', function(request, response) {
  response.render('pages/jobs');
});

//API ROUTES
app.use('/api', require('./api/routes/index'))

//JOBS ROUTES
app.use('/jobs', require('./jobs/index'))

//JOBS SCHEDULER
require('./jobs/scheduler')


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'))
});

// REQUIRED FUNCTIONS 
function getQuarter(d) {
  d = d || new Date(); // If no date supplied, use today
  var q = [4,1,2,3];
  return q[Math.floor(d.getMonth() / 3)];
}

function getYear(){
return (new Date()).getFullYear()
}