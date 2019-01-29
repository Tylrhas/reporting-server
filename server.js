require('dotenv').config()
const PORT = process.env.PORT
var express = require('./app/config/express')
//Models
var db = require("./app/models")

//load passport strategies
require('./app/config/passport.js')(express.passport, db.user)

// //load the jobs 
// require('./app/config/job_scheduler')



// Sync the Database and start the app
db.sequelize.sync().then(() => {
 express.app.listen(PORT, () => {
  console.info(`Reporting Server listening on ${PORT}`)
 })
 require('./app/routes/index')(express.app, express.passport)
}).catch(console.error)