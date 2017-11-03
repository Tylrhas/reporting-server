var express = require('express')
  , router = express.Router()
//get the location routes
   router.use('/', require('./wis_kpi'));
   router.use('/', require('./pm'));
  
  module.exports = router