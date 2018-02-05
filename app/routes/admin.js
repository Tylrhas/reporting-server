var adminController = require('../controllers/admincontroller.js');

module.exports = function(app, passport) {

   app.get('/jobs', adminController.jobs);

   function isAdmin(req, res, next){
    if (req.isAuthenticated() && req.user.group == 'admin'){
    
               return next();
    
            res.redirect('/');
        }
        else if(req.isAuthenticated()){
            res.redirect('/');
        }
        else{
            res.redirect('/signin');
        }
   }
}