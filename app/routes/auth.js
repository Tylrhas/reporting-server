module.exports = function (app, passport) {

    app.get('/g5_auth/users/auth/g5',
        passport.authenticate('oauth2'))

    app.get('/g5_auth/users/auth/g5/callback',
        passport.authenticate('oauth2', { failureRedirect: '/g5_auth/users/auth/g5' }),
        function (req, res) {
            // Successful authentication, redirect home.
            res.redirect('/')
        })

    app.get('/', checkAuthentication, function (req, res) {
        // Successful authentication, render home.
        res.render('pages/index', { user: req.user })
    })

    function checkAuthentication (req, res, next) {
        if (req.isAuthenticated()) {
            // if user is looged in, req.isAuthenticated() will return true
            next()
        } else {
            res.redirect('/g5_auth/users/auth/g5')
        }
    }

    function isAdmin (req, res, next) {
        if (req.isAuthenticated() && req.user.group == 'admin') {
            return next();
        }
        else {
            res.redirect('/');
        }
    }
}