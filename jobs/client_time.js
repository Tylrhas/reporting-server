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

exports.logClientTime = function () {
    getallclienttasks();
}

getallclienttasks();

function getallclienttasks() {
    request.get({ url: url, headers: { "Authorization": auth } }, (error, response, body) => {
        let json = JSON.parse(body);
        parseLPData(json)
    })
}
function parseLPData(data) {
    for (var i = 0; i < data.length; i++) {
        checkTask(data[i])
    }
}
function checkTask(task){
    if(checkParentFolder(task)){
        console.log('true')
        console.log(task.parent_ids)
    }
    if(checkParentFolder(task) && checkStartDate(task) && checkStartDate(task) ){
        //all deps met now log time
    }
}

function checkParentFolder(task){
    //console.log(process.env.ProServFolderId);
    //console.log(task.parent_ids.includes(process.env.ProServFolderId));
return task.parent_ids.includes(process.env.ProServFolderId);
}