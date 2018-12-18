require('dotenv').config()
var express = require('./app/config/express')
const passport = require('passport')

//Models
var db = require("./app/models")

//load passport strategies
require('./app/config/passport.js')(passport, db.user)

//load the jobs 
require('./app/config/job_scheduler')



// Sync the Database and start the app
db.sequelize.sync().then(() => {
 express.app.listen(PORT, () => {
  console.info(`${express.app.type} listening on ${express.app.address()}`)
 })
 require('./app/routes/index')(express.app, passport)
}).catch(console.error)