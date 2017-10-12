var locationsCtrl = require('./controllers/locationController');
var express = require('express');
var router = express.Router();

router.get('/locationslaunched', locationsCtrl.getLocationsLaunched);

module.exports = router;