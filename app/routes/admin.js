var adminController = require('../controllers/admincontroller.js');
var Sequelize = require("sequelize");
var sequelize = new Sequelize(process.env.DATABASE_URL, {dialectOptions: {ssl: true}});
var models = require('../models')
var moment = require('moment');

module.exports = function(app, passport) {

   app.get('/jobs',isAdmin, function (req, res) {
    sequelize.query("SELECT jobname, lastrun, lastrunstatus FROM jobs").then(results => {
        res.render('pages/jobs', { user: req.user, jobs: formatresults(results[0]) });
    });
   });

   app.get('/admin/users',isAdmin, function (req, res) {
    models.user.findAll().then(results => {
        res.render('pages/users', { user: req.user, users: results, slug: "users", moment:moment });
    })
   })

   app.get('/admin/upload',isAdmin, function (req, res) {
        res.render('pages/csv_upload', {slug: "upload", user: req.user});
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