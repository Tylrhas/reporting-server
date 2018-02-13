var exports = module.exports = {}
require('dotenv').config();
const request = require("request");

//add event emmitter 
const EventEmitter = require('events');
class MyEmitter extends EventEmitter { }
const myEmitter = new MyEmitter();

//Models
var db = require("../../models");

const url = 'https://app.liquidplanner.com/api/workspaces/'+ process.env.LPWorkspaceId +'/reports/55476/data';
const auth = "Basic " + new Buffer(process.env.LpUserName + ":" + process.env.LPPassword).toString("base64");

exports.updateProjects = function (){
    console.log(db);

    get_all_projects();

    myEmitter.once('returnresults', () => {
        return 'done';
    });
}

function get_all_projects(){
    request.get({ url: url, headers: { "Authorization": auth } }, (error, response, body) => {
        let json = JSON.parse(body);
        console.log('we got it');
        forEach(json.rows);
    });
}

function forEach(data){
    for (var i = 0; i < Object.keys(data).length; i++) {

        finalProject = false;

        if(i === Object.keys(data).length -1 ){
            finalProject  = true;
        }
        insertproject(data[i], finalProject);
    }
}

function insertproject(project, finalProject){
    //convert the is_done to a bool

    if(project['is_done']=== 't'){
        project['is_done'] = true ;
    }
    else if (project['is_done'] === 'f'){
        project['is_done'] = false ;
    }

    db.lp_project.upsert({ id: project['key'], is_done: project['is_done'], updated_on: project['updated_at'], pcost: project['pay_logged'], otr_cs: project['currency_custom_field:131198'], project_name: project['name'], client_name: project['client'], owners: project['owner'], vertical: project['pick_list_custom_field:98051'], package: project['pick_list_custom_field:102049'], mrr: project['currency_custom_field:125814'], client_type: project['pick_list_custom_field:103318'], project_type: project['pick_list_custom_field:102050'], launch_type: project['pick_list_custom_field:121534'], platform_type:project['pick_list_custom_field:103316'], integration_type: project['pick_list_custom_field:117838'], ps_phase: project['pick_list_custom_field:130700'], otr_ps: project['currency_custom_field:125815'] }).then(results => {
        console.log(results);
    });
}