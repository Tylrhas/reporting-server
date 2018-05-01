var adminController = require('../controllers/admincontroller.js');
var Sequelize = require("sequelize");
var sequelize = new Sequelize(process.env.DATABASE_URL, {dialectOptions: {ssl: true}});

module.exports = function(app, passport) {

   app.get('/jobs', function (req, res) {
    sequelize.query("SELECT jobname, lastrun, lastrunstatus FROM jobs").then(results => {
        console.log('we here')
        res.render('pages/jobs', { user: req.user, jobs: formatresults(results[0]) });
    });
   });

   app.get('/add_user', adminController.add_user);


//    function isAdmin(req, res, next){
//     if (req.isAuthenticated() && req.user.group == 'admin'){
    
//                return next();

//         }
//         else{
//             res.redirect('/');
//         }
//    }
}