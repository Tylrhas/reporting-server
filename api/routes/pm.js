var express = require('express');
var router = express.Router();

var weight = require('../db/pm_project_weight.js');

router.get('/pm/weightedprojectcount',weight.getPMWeightedData);

//router.get('/locations/launched/:vertical', location_controller.getLocationsLaunchedVertical);
module.exports = router;