var exports = module.exports = {}
//require api functions
lp_projects = require('./api/lp_projects');
lp_lbs = require('./api/lp_lbs');
client_time = require('./jobs/client_time');

//Models
var db = require("../models");

//API Calls
exports.updatelpLbsapi = function(req, res){
    lp_lbs.updateapi(req,res);
}
exports.updatelpprojectsapi = function(req,res){
    lp_projects.updateProjectsapi(req,res);
    
}
exports.updatelptasksapi = function(req,res){
    lp_tasks.updateAllTasks(req,res);
}

exports.test_view =  function(req, res){
    db.sequelize.query("SELECT * FROM test_view", { type:db.Sequelize.QueryTypes.SELECT})
    .then(data => {
        res.send (data);
    })
}