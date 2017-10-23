//http call to the LP tasks report to ppoulate the database
// REQUIRE ALL NEEDED MODULES
require('dotenv').config()
const request = require("request");
//require express for use of exports
var express = require('express');

//add event emmitter 
const EventEmitter = require('events');
class MyEmitter extends EventEmitter { }
const myEmitter = new MyEmitter();

const url ="https://app.liquidplanner.com/api/workspaces/158330/reports/54178/data"
const auth = "Basic " + new Buffer(process.env.LpUserName + ":" + process.env.LPPassword).toString("base64");

exports.updateLpTasksTable = function (req, res) {
	//listen for the job to have finished running
	 myEmitter.once('LPTaskUpdated', () => {

    res.setHeader('Content-Type', 'application/json');
    res.json({
    	'Status': 'Sucess',
        'Message': 'Function Ran'
        })
  })
 getLPReport();
}

function getLPReport(){
	console.log('Getting Task Report')
	request.get({url: url,headers : {"Authorization" : auth}}, (error, response, body) => {
	  let json = JSON.parse(body);
	  parseLPData(json)
	  console.log(json.rows)
	  myEmitter.emit('LPTaskUpdated');
	});
}

function parseLPData(data){
	console.log('parsing Data')
	//TODO Create Pool Here
	//TODO Clear Existing table data here
	console.log('datarows ${data}')
	for (var i = 0; i < data.length; i++) {
		var task = data[i]
		logTask(task);
	}
}

function logTask(task){
//TODO Connect To pool and then add the data
}