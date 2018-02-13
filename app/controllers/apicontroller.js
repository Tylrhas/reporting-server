var exports = module.exports = {}
//require api functions
pm = require('./api/pm_project_weight');
qc = require('./api/qcscores');
lp_projects = require('./api/lp_projects');
lp_lbs = require('./api/lp_lbs');
client_time = require('./jobs/client_time')
//Models
var db = require("../models");

// exports.clienttime = function(req, res) {
//         data = pm.getPMWeightedData();
//        res.send(data);
//     }

exports.updateQcScores = function(req,res){
    data = qc.updateScores();
    res.send('stuff');
}

exports.updatelpprojects = function(req,res){
    data = lp_projects.updateProjects();
    res.send(data);
}

exports.getProjectWeight = function(req, res){
    pm.getPMProjectWeight(req, res);
}

exports.updatelpLbsapi = function(req, res){
    lp_lbs.updateapi(req,res);
}
exports.updatelpLbs = function(req, res){
    lp_lbs.update(req,res);
}

exports.updateClientTime = function(req, res){
    client_time.logClientTime(req,res);
}

exports.test_view =  function(req, res){
    db.sequelize.query("SELECT * FROM test_view", { type:db.Sequelize.QueryTypes.SELECT})
    .then(data => {
        res.send (data);
    })
}