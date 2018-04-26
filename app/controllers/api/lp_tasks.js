var exports = module.exports = {}
require('dotenv').config();
const request = require("request"),
	throttledRequest = require('throttled-request')(request);
var runStatus
//add event emmitter 
const EventEmitter = require('events');
class MyEmitter extends EventEmitter { }
const myEmitter = new MyEmitter();

//This will throttle the requests so no more than 30 are made every 15 seconds 
throttledRequest.configure({
	requests: 20,
	milliseconds: 15000
});


//Models
var db = require("../../models");
const url = "https://app.liquidplanner.com/api/workspaces/158330/reports/54178/data";
const auth = "Basic " + new Buffer(process.env.LpUserName + ":" + process.env.LPPassword).toString("base64");


// exports.updatelptasksapi = function (req, res) {

// 	//listen for the job to have finished running
// 	myEmitter.once('sendresults', () => {

// 		res.setHeader('Content-Type', 'application/json');
// 		res.json('done')
// 	})
// 	getLPReport()
// }

// exports.updateLpTasksTableJob = function (req, res) {

// 	//listen for the job to have finished running
// 	myEmitter.once('sendresults', () => {
// 		return 'done'
// 	})
// 	getLPReport()
// }
exports.updateAllTasks = function (req, res) {
	res.sendStatus(200)
	// get all tasks in the database and go one by one and updata all task data
	db.lp_task.findAll({
	}).then(tasks => {
		// 
		for (i = 0; i < tasks.length; i++) {
			let task = tasks[i]
			// get the task and include tags 
			let task_url = 'https://app.liquidplanner.com/api/v1/workspaces/' + process.env.LPWorkspaceId + '/tasks/' + task.id + '?include=tags'

			// get the task info from LP 
			throttledRequest({ method: 'GET', url: task_url, headers: { "Authorization": auth } }, (error, response, body) => {
				if (error) {
					returnresults = error;
					console.log(error)
				}
				else {
					let json = JSON.parse(body)
					if (json.error !== "NotFound") {
						// this item is not in the trash in LP
						let tags
						if (json.tags) {
							for (i2 = 0; i2 < json.tags.length; i2++) {
								// create a string that is comma seperated for tags
								if (i2 === 0) {
									tags = json.tags[i2].text
								}
								else {
									tags = tags + ', ' + json.tags[i2].text
								}
							}
						}
						console.log(tags)
						// create the update object
						let updateObject = {
							milestone: null,
							task_name: json.name,
							task_type: null,
							e_start: json.expected_start,
							e_finish: json.expected_finish,
							deadline: json.promise_by,
							hrs_logged: json.hours_logged,
							started_on: json.started_on,
							date_done: json.done_on,
							project_id: json.project_id,
							// needs to be able to handle an array
							in_tags: tags,
							hrs_remaning: json.high_effort_remaining,
							cs_offering: null,
							ready_on: null
						}
						// if custom_field_values exists then change the values of the existing object
						if (json.custom_field_values) {
							updateObject.milestone = json.custom_field_values['Milestone Type'],
								updateObject.task_type = json.custom_field_values['Task Type'],
								updateObject.cs_offering = json.custom_field_values['Creative Services Offering'],
								updateObject.ready_on = json.custom_field_values['Ready To Start On']
						}
						// update the task with the new information 
						task.update(updateObject, {
							where: {
								id: req.body.id
							}
						})
					}
				}

			})

		}
	})
}

// function getLPReport () {
// 	console.log('Getting Task Report')
// 	//reset runstatus
// 	runStatus = ''
// 	throttledRequest({ method: 'GET', url: url, headers: { "Authorization": auth } }, (error, response, body) => {
// 		if (error) {
// 			returnresults = error;
// 			console.log(error)
// 		}
// 		else {
// 			console.log('we got it')
// 			let json = JSON.parse(body);
// 			console.log(Object.keys(json.rows).length);
// 			for (i = 0; i < Object.keys(json.rows).length; i++) {
// 				console.log(i);
// 				insertlbs(json.rows[i], i, Object.keys(json.rows).length);
// 			}
// 		}
// 	});
// }

// function insertlbs (task, i, task_length) {
// 	task_length = task_length - 1;
// 	db.lp_task.upsert({ id: task['key'], milestone: task['pick_list_custom_field:102175'], task_name: task['name'], task_type: task['pick_list_custom_field:102046'], e_start: task['expected_start'], e_finish: task['expected_finish'], deadline: task['promise_date'], hrs_logged: task['hours_logged'], started_on: task['date_started'], date_done: task['date_done'], project_id: task['project_id'], in_tags: task['inherited_tags'], hrs_remaning: task['hours_remaining'], cs_offering: task['pick_list_custom_field:119263'], ready_on: task['date_custom_field:139300'] }).then(results => {
// 		console.log(results);
// 		console.log(i + ' ' + task_length);
// 		if (i == task_length) {
// 			updateJobStatus()
// 		}
// 	});
// }


// function updateJobStatus () {
// 	if (runStatus === '') {
// 		runStatus = 'complete';
// 	}
// 	else {
// 		runStatus = 'error';
// 		//set error emailer here to get the error
// 	}
// 	console.log(runStatus);
// 	var date = new Date();
// 	db.job.upsert({ id: 4, lastrun: date, lastrunstatus: runStatus }).then(results => {
// 		console.log(results)
// 		myEmitter.emit('sendresults');
// 		return
// 	});
// }

