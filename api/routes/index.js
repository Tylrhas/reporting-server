var express = require('express')
  , router = express.Router()
//get the location routes
  router.use('/', require('./location'))
  
  module.exports = router