var wis_kpi_model = require('../models/wis_kpimodel.js');
var express = require('express')

exports.quarterkpi = function(req, res) {
    wis_kpi_model.getCurrentQuarter(req,res)
};