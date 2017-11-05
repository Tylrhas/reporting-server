var exports = module.exports = {}


exports.jobs = function(req, res) {

   res.render('pages/jobs', { user : req.user} );

}