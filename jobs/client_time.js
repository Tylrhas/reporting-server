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
const url = "https://app.liquidplanner.com/api/workspaces/158330/tasks?include=dependencies&filter[]=owner_id=660968&filter[]=is_done%20is%20false"
const auth = "Basic " + new Buffer(process.env.LpUserName + ":" + process.env.LPPassword).toString("base64");

var sendData;

exports.logClientTime = function (req, res) {
    myEmitter.once('sendresults', () => {
        res.setHeader('Content-Type', 'application/json');
        res.json(sendData)
    })
    getallclienttasks();
}

function getallclienttasks() {
    request.get({ url: url, headers: { "Authorization": auth } }, (error, response, body) => {
        let json = JSON.parse(body);
        parseLPData(json);
    })
}
function parseLPData(data) {
    for (var i = 0; i < Object.keys(data).length; i++) {
        checkTask(data[i])
    }
}
function checkTask(task) {
    if (checkParentFolder(task) && checkDependencies(task)) {
        getAssignment(task);
    }
    sendData = task;
    myEmitter.emit('sendresults');
}

function checkParentFolder(task) {
    //check if the task is in the active ProServ folder in LP
    return task.parent_ids.includes(parseInt(process.env.ProServFolderId));
}
function checkDependencies(task) {
    //check that all Dependencies are met
    //set var to true and only change if it is false 
    if (Object.keys(task.dependencies).length != 0) {
        for (var i = 0; i < Object.keys(task.dependencies).length; i++) {
            if (task.dependencies[i]['prerequisite_item']['is_done'] === false) {
                return false;
            }
        }
        //if none are false then return true
        console.log('dependencies met');
        return true;
    }
    else {
        //there are no dependencies
        console.log('dependencies met');
        return true;
    }
}
function getAssignment(task) {
    //check if the task is supposed to start today
    //find the assignment that is associated with the client
    for (var i = 0; i < Object.keys(task.assignments).length; i++) {

        if (task.assignments[i]['person_id'] === parseInt(process.env.LPClientId)) {
            //check if the expected start is null
            if (task.assignments[i]['expected_start'] === null) {
                //start date is null and time will not be logged
                console.log('null' + ' ' + task.assignments[i]);
                return
            }
            else {
                //estimated start is not null and time will be logged
                if (checkStartDate(task.assignments[i])) {
                    //task is supposed to start today
                    logClientTime(task.assignments[i]);
                }
            }
        }
    }
}
function checkStartDate(assignment) {
    console.log(assignment);
    var startDate = assignment['expected_start'].split("T")[0];
    var todaysDate = getTodaysDate();
    console.log(startDate + ' ' + startDate);
    if (startDate === todaysDate) {
        return true;
    }
    else {
        return false;
    }
}

function getTodaysDate() {
    // get todays date and format it 
    var dateObj = new Date();
    var month = dateObj.getMonth() + 1; //months from 1-12
    var day = dateObj.getDate();
    var year = dateObj.getFullYear();
    newdate = year + "-" + month + "-" + day;
    return newdate;
}

function logClientTime(assignment) {
    var update_time_url = 'https://app.liquidplanner.com/api/workspaces/'+process.env.LPWorkspaceId+'/tasks/'+assignment['treeitem_id']+'/track_time';
    var estupdated;
    var updateTime = {
        'work': hours_per_day,
        'activity_id': 224571,
        'member_id': process.env.LPClientId
    }


    var low_effort_remaining = parseInt(assignment['low_effort_remaining']);
    var new_effort_remaining = low_effort_remaining - parseInt(process.env.LPClientHoursPerDay);
    //update the updateTime var with the new info
    updateTime['low'] = $new_effort_remaining;
    updateTime['high'] = $new_effort_remaining;
    //if the low effort is less than or equal to one days work add more hours on the the expected time

    if (new_effort_remaining <= parseInt(process.env.LPClientHoursPerDay)) {
        updateTime['low'] = parseInt(process.env.LPClientTimeUpdate);
        updateTime['high'] = parseInt(process.env.LPClientTimeUpdate);
        //update the estimated to true for the log
        estupdated = true;
    }
    else {
        estupdated = false;
    }
    //TODO JSON POST Update and log update to database
    updateClientTime(updateTime,estupdated,url);
    insertData(insertData(updateTime, estupdated))
}
function updateClientTime(jsonPayload,estUpdated,url){
    request.post({ url: url, json:jsonPayload, headers: { "Authorization": auth } }, (error, response, body) => {

    })
}

function insertData(updateTime, estupdated){
    var query = {
		// give the query a unique name
		name: 'addQCLPClientTime',
		text: 'INSERT INTO users (id, lp_task_name, task_type, owners, start_date, end_date, hrs_logged, date_done, project_id ) VALUES ($1::int, $2::text, $3::text, $4::text, $5::text, $6::text, $7::text, $8::text, $9::int  0) ON CONFLICT (id) DO UPDATE SET level = users.level + 1;',
		values: [task['key'], task['name'], task['pick_list_custom_field:102046'], task['owner'], task['expected_start'], task['expected_finish'], task['hours_logged'], task['date_done'], task['project_id']]
	}
	return query
}