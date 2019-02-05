const schedule = require('node-schedule')
const jobController = require('../controllers/job.controller')
const lsbController = require('../controllers/lsb.controller') 


if (process.env.production =="true") {
// update LP data every hour
schedule.scheduleJob('0 * * * *', function() {
  console.log('updating Active Projects')
  jobController.updateActiveProjects(null, null)
})
// update LP data every hour
schedule.scheduleJob('30 * * * *', function() {
 console.log('Updating Archived projects')
 jobController.updateArchiveProjects(null, null)
})

// match LBS once a day 
schedule.scheduleJob('0 1 * * *', function() {
  console.log('updating LP data')
  lsbController.match(null, null)
})

// Update LBS dates every hour
schedule.scheduleJob('55 * * * *', function() {
 console.log('Updating LBS Dates')
 lsbController.update(null,null)
})
}