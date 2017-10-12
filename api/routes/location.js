var express = require('express');
var router = express.Router();

var location_controller = require('../controllers/locationController.js');

router.get('/locations/launched', location_controller.getLocationsLaunched);
//router.get('/locations/launched/:vertical', location_controller.getLocationsLaunchedVertical);

module.exports = router;