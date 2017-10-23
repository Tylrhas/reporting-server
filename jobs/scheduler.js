// REQUIRED PACKAGES
var schedule = require('node-schedule')

//REQUIRED FILES
QCSheet = require('../jobs/qc_sheet_api')

//SCHEDULED JOBS
schedule.scheduleJob('* 22 * * *', function(){
  QCSheet.updateQCScoresNoAPI()
});