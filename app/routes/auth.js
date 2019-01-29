module.exports = (app, passport) => {

    app.get('/g5_auth/users/auth/g5',
        passport.authenticate('oauth2'))

    app.get('/g5_auth/users/auth/g5/callback',
        passport.authenticate('oauth2', { failureRedirect: '/g5_auth/users/auth/g5' }),
        function (req, res) {
            // Successful authentication, redirect home.
            res.redirect('/')
        })
}