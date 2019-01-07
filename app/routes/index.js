const auth = require('../controllers/auth.controller')
const site_data = require('../controllers/site_data.controller')

module.exports = function (app, passport) {

  app.get('/', auth.basic, function (req, res) {
    res.render('pages/index', { user: req.user, slug: 'home', site_data: site_data.all() })
  })
  // Import all Auth routes
  require('./auth.js')(app, passport)
  // Import all PS routes
  // require('./ps/index')(app, passport)
  // // Import all Admin routes
  require('./admin.js')(app, passport)
  // // Import all API routes
  require('./api.js')(app,passport)
  // // Import all Webhook routes
  // require('./lp_webhooks.js')(app, passport)
}