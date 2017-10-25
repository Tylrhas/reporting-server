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
    $update_time_url = 'https://app.liquidplanner.com/api/workspaces/'.$workspace_id.'/tasks/'.$treeitem_id.'/track_time';

    var updateTime = {
        'work': hours_per_day,
        'activity_id': 224571,
        'member_id': $client_lp_id
    }


    var low_effort_remaining = parseInt(assignment['low_effort_remaining']);
    var new_effort_remaining = low_effort_remaining - parseInt(process.env.LPClientHoursPerDay);
    //update the updateTime var with the new info
    updateTime['low'] = $new_effort_remaining;
    updateTime['high'] = $new_effort_remaining;
    //if the low effort is less than or equal to one days work add more hours on the the expected time

    if (new_effort_remaining < parseInt(process.env.LPClientHoursPerDay)) {
        updateTime['low'] = parseInt(process.env.LPClientTimeUpdate);
        updateTime['high'] = parseInt(process.env.LPClientTimeUpdate);
        //update the estimated to true for the log
        var estupdated = true;
    }
    else {
        var estupdated = false;
    }
    //TODO JSON POST Update and log update to database
}