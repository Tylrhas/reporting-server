var apiController = require('../controllers/apicontroller.js');


module.exports = function (app, passport) {

    //    app.get('/api/reports/pm/weightedprojects', isAdmin, apiController.jobs);

    //    app.get('/api/jobs/updateQcScores', isAdmin, apiController.updateQcScores);

    //    app.get('/api/jobs/updatelpprojects',  isAdmin, apiController.updatelpprojects);

    app.get('/api/jobs/updatelplbs',isAdmin, apiController.updatelpLbs);

    //    app.get('/api/reports/pm/projectweight', isAdmin, apiController.getProjectWeight);

    //    app.get('/api/jobs/client/logtime', isAdmin, apiController.updateClientTime);

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