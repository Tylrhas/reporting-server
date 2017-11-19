// REQUIRED PACKAGES
var schedule = require('node-schedule')

//REQUIRED FILES
QCSheet = require('../controllers//jobs/qc_sheet_api')
clientTime = require('../controllers/jobs/client_time');
lpTasks = require('../controllers/jobs/lp_tasks');
lpProjects = require('../controllers/apifunctions/lp_projects');
lpLBS = require('../controllers/apifunctions/lp_lbs');
LPTime = require('../controllers/jobs/lp_time_logged');

//SCHEDULED JOBS

schedule.scheduleJob('45 15 * * 1-5', function(){
	console.log('Updating Client Time');
  clientTime.logClientTimeJob();
});

schedule.scheduleJob('* 21 * * *', function(){
  console.log('Updating LP Projects');
  lpProjects.updateProjects();
});

schedule.scheduleJob('30 21 * * *', function(){
  console.log('Updating LP LBS');
  lpLBS.update();
});

// schedule.scheduleJob('* 22 * * *', function(){
//   console.log('Updating LP Tasks');
//   lpTasks.updateLpTasksTableJob()
// });

schedule.scheduleJob('30 22 * * *', function(){
  console.log('Updating QC Scores');
  QCSheet.updateQCScoresNoAPI()
});

schedule.scheduleJob('0 * * * *', function(){
  console.log('Updating LP Times');
  LPTime.update();
});