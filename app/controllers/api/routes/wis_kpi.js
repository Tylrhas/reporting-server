var express = require('express');
var router = express.Router();

var wiskpi = require('../db/wis_kpi.js');

router.get('/kpi/wis', wiskpi.quarterKpiNoName);

router.get('/kpi/wis/:name',wiskpi.wisQuarterKpi);

//router.get('/locations/launched/:vertical', location_controller.getLocationsLaunchedVertical);
module.exports = router;