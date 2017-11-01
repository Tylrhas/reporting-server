// REQUIRED PACKAGES
var schedule = require('node-schedule')

//REQUIRED FILES
QCSheet = require('../jobs/qc_sheet_api')
clientTime = require('../jobs/client_time');
lpTasks = require('../jobs/lp_tasks');

//SCHEDULED JOBS
schedule.scheduleJob('45 15 * * 1-5', function(){
	console.log('Updating Client Time');
  clientTime.logClientTimeJob();
});

schedule.scheduleJob('* 22 * * *', function(){
  console.log('Updating LP Tasks');
  lpTasks.updateLpTasksTableJob()
});

schedule.scheduleJob('30 22 * * *', function(){
  console.log('Updating QC Scores');
  QCSheet.updateQCScoresNoAPI()
});