var apiController = require('../controllers/apicontroller.js')


module.exports = function (app, passport) {

    app.get('/api/jobs/updatetasks', checkAuthentication, apiController.updatelptasksapi);
    app.get('/api/download/at-risk-projects',checkAuthentication,  apiController.at_risk_CSV);

    //    app.get('/api/views/testData', isAdmin, apiController.test_view);

    function isAdmin(req, res, next) {
        if (req.isAuthenticated() && req.user.group == 'admin') {
            return next();
        }
        else if (req.isAuthenticated()) {
            res.redirect('/jobs');
        }
        else {
            res.redirect('/');
        }
    }
}

function checkAuthentication (req, res, next) {
    if (req.isAuthenticated()) {
        // if user is looged in, req.isAuthenticated() will return true
        next()
    } else {
        res.redirect('/g5_auth/users/auth/g5')
    }
}