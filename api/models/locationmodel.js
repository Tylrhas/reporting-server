//get env vars
require('dotenv').config();

//the Guts of the API
const {Pool,Client} = require('pg');

var express = require('express');

const connectionString = process.env.DATABASE_URL;

exports.getlocationsfiltered = function(req){
	var query = buildQuery(req);
    return query;

}

exports.getAllLocations = function(){
    return return_starter_data();
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
	return formatJSONLocationsLaunched(locationData);
}

function formatJSONLocationsLaunched(locationData){
	//format the data into the proper format for chart.js
	var chartData  = "";
	return chartData;
};

function return_starter_data(){
   var data =  {  
   "type":"line",
   "data":{  
      "labels":["Jan","Feb","Mar","Apl","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec"],
      "datasets":[  
         {  
            "label":"My First Dataset",
            "data":[  65,59,80,81,56,55,40,50,60,70,80,90],
            "fill":false,
            "borderColor":"rgb(75, 192, 192)",
            "lineTension":0.1
         }
      ]
   },
   "options": {
                "responsive": true,
                "legend": {
                    "position": 'top'
                }
            }
}
        return data;
};