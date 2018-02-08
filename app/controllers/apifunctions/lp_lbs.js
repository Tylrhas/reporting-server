var exports = module.exports = {}
require('dotenv').config();
const request = require("request");
var runStatus
//add event emmitter 
const EventEmitter = require('events');
class MyEmitter extends EventEmitter { }
const myEmitter = new MyEmitter();

//Models
var db = require("../../models");
const url = 'https://app.liquidplanner.com/api/workspaces/'+ process.env.LPWorkspaceId +'/reports/42235/data';
const auth = "Basic " + new Buffer(process.env.LpUserName + ":" + process.env.LPPassword).toString("base64");

exports.update = function (){

    get_all_Lbs();

    myEmitter.once('returnresults', () => {
        return 'done';
    });
}

function get_all_Lbs(){
    request.get({ url: url, headers: { "Authorization": auth } }, (error, response, body) => {
        let json = JSON.parse(body);
        forEach(json.rows);
    });
}

function forEach(data){
    for (var i = 0; i < Object.keys(data).length; i++) {

        finalLbs = false;

        if(i === Object.keys(data).length -1 ){
            finalLbs  = true;
        }
        insertlbs(data[i], finalLbs);
    }
}

function insertlbs(lbs, finalLbs){
    db.lp_lbs.upsert({ id: lbs['key'], ns_id:lbs['text_custom_field:121409'], in_tags: lbs['inherited_tags'], task_name:lbs['name'], project_id:lbs['project_id'], website_type: lbs['pick_list_custom_field:133069'], design_type:lbs['design_type'], updated_on: lbs['updated_at']}).then(results => {
        console.log(results);
    });
    if (finalLbs){
        console.log(finalLbs);
        runStatus = ""
        updateJobStatus()
    }
}

function updateJobStatus() {
    if (runStatus === '') {
        runStatus = 'complete';
    }
    var date = new Date();
    console.log(date);
    db.job.upsert({ id: 3, lastrun: date, lastrunstatus: runStatus }).then(jobstatus => {
        return
    });
}