// REQUIRED PACKAGES
var schedule = require('node-schedule')
var apiController = require('../controllers/apicontroller.js')

if (process.env.production =="true") {
// update LP data every hour
schedule.scheduleJob('0 * * * *', function() {
  console.log('updating LP data')
  apiController.updateProjects(null,null)
})
// update LP data every hour
schedule.scheduleJob('30 * * * *', function() {
 console.log('Updating Archived projects')
 apiController.updateArchivedProjects(null,null)
})

// match LBS once a day 
schedule.scheduleJob('0 1 * * *', function() {
  console.log('updating LP data')
  apiController.findLBSProjects(null,null)
})

// match LBS once a day 
schedule.scheduleJob('55 * * * *', function() {
 console.log('updating LP data')
 apiController.lbsAPIUpdate(null,null)
})
}