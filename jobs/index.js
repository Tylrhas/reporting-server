// all of the jobs endpoints 
var express = require('express');
var router = express.Router();

//include the jobs files
var qcScore = require('./qc_sheet_api');
var lpTask = require('./lp_tasks');
var clientTime = require('./client_time');

router.get('/qc_score', qcScore.updateQCScores);
router.get('/lp_tasks', lpTask.updateLpTasksTable);
router.get('/client_time', clientTime.logClientTime);

module.exports = router