var authController = require('../controllers/authcontroller.js');

module.exports = function (app, passport) {

    app.get('/', authController.signin);

    app.post('/signup', isAdmin, function (req, res, next) {
        console.log('we here')
        passport.authenticate('local-signup', function (err, user) {
            if (err) { return next(err) }
            if (!user) {
                res.send({ status: "Error", message : "The User NOT Has Been Added" });
            }
        })(req, res, next);
        res.send({ status: "sucess", message : "The User Has Been Added" });
    });

    app.get('/logout', authController.logout);


    app.post('/signin', passport.authenticate('local-signin', {
        successRedirect: '/jobs',

        failureRedirect: '/'
    }

    ));


    function isLoggedIn(req, res, next) {

        if (req.isAuthenticated())

            return next();

        res.redirect('/jobs');

    }

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