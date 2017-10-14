var express = require('express');
var router = express.Router();

var kpi_controller = require('../controllers/wis_kpiController.js');

router.get('/kpi/wis', kpi_controller.quarterkpi);

router.get('/kpi/wis/:name', kpi_controller.quarterkpi);

//router.get('/locations/launched/:vertical', location_controller.getLocationsLaunchedVertical);
module.exports = router;