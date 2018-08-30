var adminController = require('../controllers/admincontroller.js');
var Sequelize = require("sequelize");
var sequelize = new Sequelize(process.env.DATABASE_URL, {dialectOptions: {ssl: true}});
var models = require('../models')
var moment = require('moment');

module.exports = function(app, passport) {


   app.get('/admin/users',isAdmin, function (req, res) {
    var date = new Date();
    var month = date.getMonth()
    var year = date.getFullYear()
    models.user.findAll().then(results => {
        res.render('pages/users', { user: req.user, users: results, slug: "users", moment:moment, month: month, year: year });
    })
   })
   app.get('/admin/update',isAdmin, function (req, res) {
    var date = new Date();
    var month = date.getMonth()
    var year = date.getFullYear()
    models.job.findAll().then(results => {
        // Transform the data
        let jobs = {}
        for (let i = 0; i < results.length; i++) {
            jobs[results[i].jobname] = {
                lastRunStatus: results[i].lastrunstatus,
                lastRun: results[i].lastrun,
                status: results[i].status
            }
        }
        res.render('pages/csv_upload', {slug: "update", user: req.user, jobs: jobs, moment:moment, , month: month, year: year})
    })
   })


   function isAdmin(req, res, next){
    if (req.isAuthenticated() && req.user.user_group == 'admin'){
    
               return next();

        }
        else{
            res.redirect('/');
        }
   }
}