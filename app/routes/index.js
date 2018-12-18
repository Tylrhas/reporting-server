var auth = require('../lib/auth/auth_check')
var moment = require('moment')
var page_data = require('../lib/page_links')

module.exports = function (app, passport) {
  // index route for the whole application
  app.get('/', auth.basic, function (req, res) {
    let link_data = page_data()
    res.render('pages/index', { user: req.user, slug: 'home', moment: moment, link_data: link_data })
  })
  // Import all Auth routes
  require('./auth.js')(app, passport)
  // Import all PS routes
  // require('./ps/index')(app, passport)
  // // Import all Admin routes
  // require('./admin.js')(app, passport)
  // // Import all API routes
  // require('./api.js')(app,passport)
  // // Import all Webhook routes
  // require('./lp_webhooks.js')(app, passport)
}