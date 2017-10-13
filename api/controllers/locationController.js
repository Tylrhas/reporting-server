var location_model = require('../models/locationmodel.js');
var express = require('express')

exports.getLocationsLaunched = function(req, res) {
//check if a query string is present
if( Object.keys(req.query).length != 0){
	//if filters are present create a new Query
	//res.setHeader('Content-Type', 'application/json');
    res.send(location_model.getlocationsfiltered(req, res));
}
else{
	//if no strings are present send all of the locations
    location_model.getAllLocations(req, res);
}
};