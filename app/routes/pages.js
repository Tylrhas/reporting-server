module.exports = function (app, passport) {
    app.get('/reports/pmweightedprojects', function (req, res) {
        res.render('pages/pmweight', { user: req.user });
    });
}