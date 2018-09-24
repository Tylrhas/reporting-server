// REQUIRED PACKAGES
var schedule = require('node-schedule')
var apiController = require('../controllers/apicontroller.js')

// //REQUIRED FILES
// clientTime = require('../controllers/jobs/client_time');
// lpProjects = require('../controllers/api/lp_projects');
// lpLBS = require('../controllers/api/lp_lbs');


// // SCHEDULED JOBS
// schedule.scheduleJob('45 15 * * 1-5', function(){
// 	console.log('Updating Client Time');
//   clientTime.logClientTimeJob();
// });

// schedule.scheduleJob('10 * * * *', function(){
//   console.log('Updating LP LBS');
//   lpLBS.update(null,null);
// });

// schedule.scheduleJob('15 * * * *', function(){
//   console.log('Updating Project Priorities');
//   lpProjects.updatePriority(null,null);
// });

// update LP data every hour
schedule.scheduleJob('0 * * * *', function() {
  console.log('updating LP data')
  apiController.updateProjects(null,null)
})

// match LBS once a day 
schedule.scheduleJob('0 1 * * *', function() {
  console.log('updating LP data')
  apiController.updateProjects(null,null)
})
// check for archived projects once a day