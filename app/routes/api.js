var apiController = require('../controllers/apicontroller.js');


module.exports = function(app, passport) {

   //app.get('/api/reports/pm/weightedprojects', isAdmin, apiController.jobs);

   app.get('/api/jobs/updateQcScores', apiController.updateQcScores);

   app.get('/api/jobs/updatelpprojects', apiController.updatelpprojects);

   app.get('/api/jobs/updatelplbs', apiController.updatelpLbs);

   app.get('/api/reports/pm/projectweight', apiController.getProjectWeight);

   function isAdmin(req, res, next){
    if (req.isAuthenticated() && req.user.group == 'admin')
    
               return next();
    
            res.redirect('/');
   }
}