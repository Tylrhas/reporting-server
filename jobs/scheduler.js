// REQUIRED PACKAGES
var schedule = require('node-schedule')

//REQUIRED FILES
QCSheet = require('../jobs/qc_sheet_api')
clientTime = require('../jobs/client_time');

//SCHEDULED JOBS
/*
schedule.scheduleJob('* 22 * * *', function(){
  QCSheet.updateQCScoresNoAPI()
});
*/
schedule.scheduleJob('45 16 * * 1-5', function(){
  clientTime.logClientTimeJob();
});