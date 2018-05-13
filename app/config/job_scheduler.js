// REQUIRED PACKAGES
var schedule = require('node-schedule')

//REQUIRED FILES
clientTime = require('../controllers/jobs/client_time');
lpProjects = require('../controllers/api/lp_projects');
lpLBS = require('../controllers/api/lp_lbs');


// SCHEDULED JOBS
// schedule.scheduleJob('45 15 * * 1-5', function(){
// 	console.log('Updating Client Time');
//   clientTime.logClientTimeJob();
// });

// schedule.scheduleJob('0 * * * *', function(){
//   console.log('Updating LP LBS');
//   lpLBS.update();
// });

// schedule.scheduleJob('15 * * * *', function(){
//   console.log('Updating Project Priorities');
//   lpProjects.updatePriority(null,null);
// });