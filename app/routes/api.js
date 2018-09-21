var apiController = require('../controllers/apicontroller.js')


module.exports = function (app, passport) {

    app.get('/api/jobs/updatetasks', checkAuthentication, apiController.updatelptasksapi)
    app.get('/api/download/at-risk-projects', checkAuthentication,  apiController.at_risk_CSV)
    app.get('/api/projects/update', apiController.updateProjects)
    app.get('/api/treeitems', apiController.getTreeItems)
    app.get('/api/projects/:project_id', apiController.getProject)
    app.get('/api/projects', apiController.getAllProjects)
    app.post('/api/csv/netsuitebacklog/update',isAdmin, apiController.updateNsBacklog)
    app.post('/api/admin/user/update',isAdmin, apiController.updateUser);
    app.post('/api/admin/update/projects/archived', apiController.updateArchivedProjects)
    // app.get('/api/admin/teams/update', isAdmin, apiController.updateTeamProjects)

    app.get('/api/admin/lbs/match', isAdmin, apiController.findLBSProjects)

    //    app.get('/api/views/testData', isAdmin, apiController.test_view);

    function isAdmin(req, res, next) {
        if (req.isAuthenticated() && req.user.user_group == 'admin') {
            return next();
        }
        else if (req.isAuthenticated()) {
            res.redirect('/');
        }
        else {
            res.redirect('/g5_auth/users/auth/g5')
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