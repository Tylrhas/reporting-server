var exports = module.exports = {}


exports.signup = function(req, res) {

   res.render('pages/signup');

}

exports.signin = function(req, res) {

   res.render('pages/signin');

}


exports.dashboard = function(req, res) {
   res.render('pages/profile');
}

exports.logout = function(req, res) {
    
       req.session.destroy(function(err) {
    
           res.redirect('/');
    
       });
    
   }