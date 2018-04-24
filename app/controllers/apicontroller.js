var exports = module.exports = {}
//require api functions
pm = require('./api/pm_project_weight');
qc = require('./api/qcscores');
lp_projects = require('./api/lp_projects');
lp_lbs = require('./api/lp_lbs');
lp_tasks = require('./api/lp_tasks');
client_time = require('./jobs/client_time');

//Models
var db = require("../models");

//jobs
exports.updateQcScores = function(req,res){
    data = qc.updateScores();
    res.send('stuff');
}

exports.updatelpprojects = function(){
    lp_projects.updateProjects();
}
exports.updatelpLbs = function(req, res){
    lp_lbs.update(req,res);
}

exports.updateClientTime = function(req, res){
    client_time.logClientTime(req,res);
}


//API Calls
exports.updatelpLbsapi = function(req, res){
    lp_lbs.updateapi(req,res);
}
exports.updatelpprojectsapi = function(req,res){
    lp_projects.updateProjectsapi(req,res);
    
}
exports.updatelptasksapi = function(req,res){
    lp_tasks.updatelptasksapi(req,res);
}

exports.test_view =  function(req, res){
    db.sequelize.query("SELECT * FROM test_view", { type:db.Sequelize.QueryTypes.SELECT})
    .then(data => {
        res.send (data);
    })
}