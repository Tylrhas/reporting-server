//http call to the LP tasks report to ppoulate the database
// REQUIRE ALL NEEDED MODULES
require('dotenv').config()
const request = require("request");
//require express for use of exports
var express = require('express');
const { Pool, Client } = require('pg')

//add event emmitter 
const EventEmitter = require('events');
class MyEmitter extends EventEmitter { }
const myEmitter = new MyEmitter();

//global vars for easier use of callbacks
var pool
var client
const url = "https://app.liquidplanner.com/api/workspaces/158330/reports/54178/data";
const auth = "Basic " + new Buffer(process.env.LpUserName + ":" + process.env.LPPassword).toString("base64");

var sendData;

exports.updateLpTasksTable = function (req, res) {
	//listen for the job to have finished running
	myEmitter.once('sendresults', () => {

		res.setHeader('Content-Type', 'application/json');
		res.json(sendData)
	})
	getLPReport()
}

function getLPReport() {
	console.log('Getting Task Report')
	request.get({ url: url, headers: { "Authorization": auth } }, (error, response, body) => {
		sendData = body;
		let json = JSON.parse(body);
		parseLPData(json.rows)
		myEmitter.emit('sendresults');
	});
}

function parseLPData(data) {
	console.log('parsing Data')
	//createPool()
	console.log(Object.keys(data).length)
	for (var i = 0; i < Object.keys(data).length; i++) {
		var task = data[i]
		//console.log(task['key'] +' '+ task['name']  +' '+ task['pick_list_custom_field:102046'] +' '+ task['owner'] +' '+task['expected_start'] +' '+task['expected_finish'] +' '+task['hours_logged'] +' '+task['date_done'] +' '+task['project_id']);
		query = addLPTaskQuery(task)
		console.log(query)
		//logTask(query);
	}
}

function logTask(task) {
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

function updateTaskQuery() {

}

function addLPTaskQuery(task) {
	var query = {
		// give the query a unique name
		name: 'addQCLPTask',
		text: 'INSERT INTO users (id, lp_task_name, task_type, owners, start_date, end_date, hrs_logged, date_done, project_id ) VALUES ($1::int, $2::text, $3::text, $4::text, $5::text, $6::text, $7::text, $8::text, $9::int  0) ON CONFLICT (id) DO UPDATE SET level = users.level + 1;',
		values: [task['key'], task['name'], task['pick_list_custom_field:102046'], task['owner'], task['expected_start'], task['expected_finish'], task['hours_logged'], task['date_done'], task['project_id']]
	}
	return query
}