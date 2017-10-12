//the Guts of the API
var pg = require('pg');
var express = require('express');

exports.getlocationsfiltered = function(req){
	var query = buildQuery(req);
    return query;

}

exports.getAllLocations = function(){

}

function buildQuery(req) {
	var startDate = req.query.end_date ;
	var endDate = req.query.end_date ;
	var vertical = req.query.vertical;
	var SQLquery = "SELECT * FROM TABLE";

	if(endDate){
		//add date range filter
		SQLquery = SQLquery + " WHERE DATE BETWEEN '"+req.query.end_date+"' and '"+req.query.start_date+"'";
	}
	if(vertical){
		SQLquery = SQLquery + "and vertical = '" +vertical+"'";
	}

	return getLocationsLaunchedData(SQLquery);
}
function getLocationsLaunchedData(SQLquery){
	//get all of the information from the database

	return formatJSONLocationsLaunched(locationData)
}

function formatJSONLocationsLaunched(locationData){
	//format the data into the proper format for chart.js
	var chartData  = ""
	return chartData;
}