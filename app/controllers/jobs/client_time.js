require('dotenv').config()
const request = require("request"),
    throttledRequest = require('throttled-request')(request);
var exports = module.exports = {};
//add event emmitter 
const EventEmitter = require('events');
class MyEmitter extends EventEmitter { }
const myEmitter = new MyEmitter();
var runStatus;

//This will throttle the requests so no more than 30 are made every 15 seconds 
throttledRequest.configure({
    requests: 30,
    milliseconds: 15000
});

//Models
var db = require("../../models");

const url = 'https://app.liquidplanner.com/api/workspaces/' + process.env.LPWorkspaceId + '/tasks?filter[]=owner_id=' + process.env.LPClientId + '&filter[]=is_done%20is%20false&filter[]=all_dependencies_satisfied%20is%20true';
const auth = "Basic " + new Buffer(process.env.LpUserName + ":" + process.env.LPPassword).toString("base64");

var sendData;
var upddateQueue;

exports.logClientTime = function (req, res) {

    myEmitter.once('sendresults', () => {
        res.setHeader('Content-Type', 'application/json');
        res.json(sendData)
    })

    myEmitter.once('queueComplete', () => {
        console.log('queue complete');
        console.log(upddateQueue.length);
        //run through queue now that is complete
        processQueue();
    })

    getallclienttasks();
}
exports.logClientTimeJob = function () {
    myEmitter.once('sendresults', () => {
        return sendData
    });

    myEmitter.once('queueComplete', () => {
        //run through queue now that is complete
        processQueue();
    });

    getallclienttasks();
}

function getallclienttasks() {
    //set global vars to empty
    upddateQueue = [];
    runStatus = '';

    request.get({ url: url, headers: { "Authorization": auth } }, (error, response, body) => {
        let json = JSON.parse(body);
        parseLPData(json);
    })
}
function parseLPData(data) {
    for (var i = 0; i < Object.keys(data).length; i++) {
        checkTask(data[i])
    }
    //the queue has been fully populated fire event
    myEmitter.emit('queueComplete');
}
function checkTask(task) {
    if (checkParentFolder(task) && checkDependencies(task)) {
        console.log('checking task');
        getAssignment(task);
    }
    sendData = task;
}

function checkParentFolder(task) {
    //check if the task is in the active ProServ folder in LP
    return task.parent_ids.includes(parseInt(process.env.ProServFolderId));
}
function checkDependencies(task) {
    //check that all Dependencies are met
    //set var to true and only change if it is false 
    if (task.dependencies != null) {
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
        console.log('No dependencies');
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
                    console.log(task.assignments[i]);
                    //task is supposed to start today
                    //add to queue
                    addToQueue(task.assignments[i]);
                }
            }
        }
    }
}
function checkStartDate(assignment) {
    var startDate = assignment['expected_start'].split("T")[0];
    var todaysDate = getTodaysDate();
    console.log(startDate + ' ' + todaysDate);
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
    if (month < 10) {
        month = '0' + month;
    }
    var day = dateObj.getDate();
    if (day < 10) {
        day = '0' + day
    }
    var year = dateObj.getFullYear();
    newdate = year + "-" + month + "-" + day;
    return newdate;
}

function logClientTime(assignment, last_task) {
    var update_time_url = 'https://app.liquidplanner.com/api/workspaces/'+ process.env.LPWorkspaceId +'/tasks/' + assignment['treeitem_id'] + '/track_time';
    var estupdated;
    var updateTime = {
        'work': parseInt(process.env.LPClientHoursPerDay),
        'activity_id': 224571,
        'member_id': process.env.LPClientId
    }
    var low_effort_remaining = parseInt(assignment['low_effort_remaining']);
    var new_effort_remaining = low_effort_remaining - parseInt(process.env.LPClientHoursPerDay);
    //update the updateTime var with the new info
    updateTime['low'] = new_effort_remaining;
    updateTime['high'] = new_effort_remaining;
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

    updateClientTime(updateTime, estupdated, update_time_url, assignment, last_task);
}
function updateClientTime(jsonPayload, estupdated, url, assignment, last_task) {

    throttledRequest({ url: url, method: 'POST', headers: { "Authorization": auth }, body: JSON.stringify(jsonPayload) }, function (error, response, body) {
        if (error) {
            //Handle request error 
            console.log(error);
        }
        //Do what you need with `response` and `body` )
        insertClientTime(assignment['treeitem_id'], true, estupdated, body, last_task);
    });

}

function insertClientTime(taskid, timeLogged, estUpdated, responseBody, last_task) {
    db.lp_client_time.create({ lp_task: taskid, est_updated: estUpdated, time_logged: timeLogged, response: responseBody }).then(newTimeLog => {

        console.log(last_task);
        //last task insert so send results and update job status
        if(last_task){
            updateJobStatus();
            //queue has processed and send results
            myEmitter.emit('sendresults');
        }
    });
}

function addToQueue(assignment) {
    //add to queue
    upddateQueue.push(assignment);
}
function processQueue() {
    last_task = false;
    for (var i = 0; i < upddateQueue.length; i++) {
        console.log('i='+i);
        assignment = upddateQueue[i];
        if(i === upddateQueue.length - 1){
            last_task = true;
        }
        console.log(last_task);
        logClientTime(assignment,last_task);
    }
}

function updateJobStatus() {
    if (runStatus === '') {
        runStatus = 'complete';
    }
    var date = new Date();
    db.job.upsert({ id: 1, lastrun: date, lastrunstatus: runStatus }).then(jobstatus => {
        return
    });
}