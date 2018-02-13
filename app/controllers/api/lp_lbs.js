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
const url = process.env.lbs_url;
const auth = "Basic " + new Buffer(process.env.LpUserName + ":" + process.env.LPPassword).toString("base64");


//for the api call
exports.updateapi = function (req, res) {

    get_all_Lbs();

    myEmitter.once('returnresults', () => {
        res.send(runStatus);
    });
}
//for the hourly job 
exports.update = function (req, res) {

    get_all_Lbs();

    myEmitter.once('returnresults', () => {
        return runStatus;
    });
}

function get_all_Lbs() {
    throttledRequest({ method: 'GET', url: url, headers: { "Authorization": auth } }, (error, response, body) => {
        if (error) {
            returnresults = error;
            console.log(error)
        }
        else {
            let json = JSON.parse(body);

            for (var i = 0; i < Object.keys(json.rows).length; i++) {

                finalLbs = false;

                if (i === Object.keys(json.rows).length - 1) {
                    //set this only if this is the final LBS row
                    finalLbs = true;
                }
                insertlbs(json.rows[i], finalLbs);
            }
        }
    });
}

function insertlbs(lbs, finalLbs) {
    db.lp_lbs.upsert({ id: lbs['key'], task_name: lbs['name'], in_tags: lbs['inherited_tags'], website_type: lbs['pick_list_custom_field:133069'], design_type: lbs['pick_list_custom_field:133070'], project_id: lbs['project_id'], ns_id: lbs['text_custom_field:135152'], billing_type: lbs['pick_list_custom_field:102670'], billing_lost_reason: lbs['pick_list_custom_field:109756'] }).then(results => {
        console.log(results);
    });
    if (finalLbs) {
        console.log(finalLbs);
        updateJobStatus()
    }
}

function updateJobStatus() {
    if (runStatus === '') {
        runStatus = 'complete';
    }
    else {
        runStatus = 'error';
        //set error emailer here to get the error
    }
    var date = new Date();
    db.job.upsert({ id: 2, lastrun: date, lastrunstatus: runStatus }).then(jobstatus => {
        if (error){
        console.log(error);
    }
    });
    myEmitter.emit('returnresults');
}