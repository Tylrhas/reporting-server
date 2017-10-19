// all of the jobs endpoints 
var express = require('express');
var router = express.Router();

//include the jobs files
var qcScore = require('./qc_sheet_api');

router.get('/qc_score', qcScore.updateQCScores);

module.exports = router