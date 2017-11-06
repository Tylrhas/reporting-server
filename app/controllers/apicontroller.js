var exports = module.exports = {}
//require api functions
pm = require('./apifunctions/pm_project_weight');
qc = require('./apifunctions/qcscores')

exports.clienttime = function(req, res) {
        data = pm.getPMWeightedData();
       res.send(data);
    }

exports.updateQcScores = function(req,res){
    data = qc.updateScores();
    res.send('stuff');
}