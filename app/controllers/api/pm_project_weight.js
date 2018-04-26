//get env vars
require('dotenv').config();

//Models
var db = require("../../models");

var exports = module.exports = {}

exports.getPMProjectWeight =  function(req, res){
    db.sequelize.query("SELECT * FROM pm_weighted_projects", { type:db.Sequelize.QueryTypes.SELECT})
    .then(pmweights => {
        res.send (pmweights);
    })
}