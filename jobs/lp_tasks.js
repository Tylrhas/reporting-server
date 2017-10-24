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

//global vars for easier use of callbacks
var pool
var client
const url ="https://app.liquidplanner.com/api/workspaces/158330/reports/54178/data"
const auth = "Basic " + new Buffer(process.env.LpUserName + ":" +process.env.LPPassword).toString("base64");

exports.updateLpTasksTable = function (req, res) {
	//listen for the job to have finished running
	 myEmitter.once('sendresults', () => {

    res.setHeader('Content-Type', 'application/json');
    res.json({
    	'Status': 'Sucess',
        'Message': 'Function Ran'
        })
  })
 getLPReport()
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
	createPool()
	console.log('datarows ${data}')
	for (var i = 0; i < data.length; i++) {
		var task = data[i]
		logTask(task);
	}
}

function logTask(task){
//TODO Connect To pool and then add the data
pool.connect((err, client, release) => {
    if (err) {
      updateStatus = {
        'Status': 'Failed',
        'Error': 'Error acquiring client' + err.stack
      }
      console.error('Error acquiring client', err.stack)
      myEmitter.emit('sendresults');
      return
    }
    client.query(query, (err, result) => {
      //release client back to the pool
      release()
      if (err) {
        updateStatus = {
          'Status': 'Failed',
          'Error': 'Error executing query' + err.stack
        }
        console.error('Error executing query', err.stack)
        myEmitter.emit('sendresults');
        return
	  }
	  //no errors return data
    })
  })
}

function createPool() {
	pool = new Pool({
	  user: process.env.PGUSER,
	  host: process.env.PGHOST,
	  database: process.env.PGDATABASE,
	  password: process.env.PGPASSWORD,
	  port: process.env.PGPORT,
	  ssl: true
	})
  }

  function updateTaskQuery(){

  }

  function addQCDataQuery(row) {
	var query = {
	  // give the query a unique name
	  name: 'addQCData',
	  text: 'INSERT INTO gd_qcscore(id, projectmanager, wis, staging, prelive, live) VALUES($1::int, $2, $3, $4, $5, $6) RETURNING *',
	  values: [row[0], row[4], row[6], row[7], row[7], row[9]]
	}
	return query
  }