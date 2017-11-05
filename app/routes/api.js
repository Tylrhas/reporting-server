var apiController = require('../controllers/apicontroller.js');


module.exports = function(app, passport) {

   app.get('/api/', isAdmin, apiController.jobs);

   function isAdmin(req, res, next){
    if (req.isAuthenticated() && req.user.group == 'admin')
    
               return next();
    
            res.redirect('/');
   }
}