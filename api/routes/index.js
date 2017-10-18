var express = require('express')
  , router = express.Router()
//get the location routes
  //router.use('/', require('./location'));
   router.use('/', require('./wis_kpi'));
  
  module.exports = router