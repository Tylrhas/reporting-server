var adminController = require('../controllers/admincontroller.js');

module.exports = function(app, passport) {

   app.get('/jobs', isAdmin, adminController.jobs);

   app.get('/add_user',isAdmin, adminController.add_user);


   function isAdmin(req, res, next){
    if (req.isAuthenticated() && req.user.group == 'admin'){
    
               return next();

        }
        else{
            res.redirect('/');
        }
   }
}