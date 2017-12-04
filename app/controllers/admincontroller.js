var fs = require("fs");
var path = require("path");
var Sequelize = require("sequelize");
var env = process.env.NODE_ENV || "development";
var config = require(path.join(__dirname, '..', 'config', 'config.json'))[env];
var sequelize = new Sequelize(config.database, config.username, config.password, config);
var exports = module.exports = {}

exports.jobs = function (req, res) {
    sequelize.query("SELECT jobname, lastrun, lastrunstatus FROM Jobs").then(results => {
        console.log(results[0]);
        res.render('pages/jobs', { user: req.user, jobs: formatresults(results[0]) });
    });
}

function formatresults(results) {
    formattedResults = {};
    for (var i = 0; i < Object.keys(results).length; i++) {
        jobname = results[i]['jobname'];
        formattedResults[jobname] = {};
        formattedResults[jobname]['lastrun'] = results[i]['lastrun'].toLocaleString();
        formattedResults[jobname]['lastrunstatus'] = results[i]['lastrunstatus'].charAt(0).toUpperCase() + results[i]['lastrunstatus'].slice(1);;
    }
    console.log(formattedResults);
    return formattedResults;
}