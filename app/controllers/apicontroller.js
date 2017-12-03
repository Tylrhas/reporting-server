var exports = module.exports = {}
//require api functions
pm = require('./apifunctions/pm_project_weight');
qc = require('./apifunctions/qcscores');
lp_projects = require('./apifunctions/lp_projects');
lp_lbs = require('./apifunctions/lp_lbs');
client_time = require('./jobs/client_time')

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

exports.updatelpLbs = function(req, res){
    lp_lbs.update(req,res);
}
exports.updateClientTime = function(req, res){
    client_time.logClientTime(req,res);
}