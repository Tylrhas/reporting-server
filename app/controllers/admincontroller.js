var Sequelize = require("sequelize");
var sequelize = new Sequelize(process.env.DATABASE_URL, {dialectOptions: {ssl: true}});
var exports = module.exports = {}

exports.jobs = function (req, res) {
    sequelize.query("SELECT jobname, lastrun, lastrunstatus FROM jobs").then(results => {
        console.log('we here')
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