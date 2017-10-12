//the Guts of the API
var pg = require('pg');
var express = require('express');

exports.getlocationsfiltered = function(req){
	var query = buildQuery(req);
    return query;

}

exports.getAllLocations = function(){
	var data = {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
	};
	return data;
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