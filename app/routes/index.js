var auth = require('../lib/auth/auth_check')
var moment = require('moment')
var page_data = require('../lib/page_links')

module.exports = function (app, passport, express) {
  // index route for the whole application
  app.get('/', auth.basic, function (req, res) {
    let link_data = page_data()
    res.render('pages/index', { user: req.user, slug: 'home', moment: moment, link_data: link_data })
  })
  // Import all Auth routes
  var authRoute = require('./auth.js')(app, passport)
  // Import all PS routes
  var psRoutes = require('./ps/index')(app, passport, express)
  // Import all Admin routes
  var adminRoute = require('./admin.js')(app, passport)
  // Import all API routes
  var apiRoute = require('./api.js')(app,passport)
  // Import all Webhook routes
  var webhooks = require('./lp_webhooks.js')(app, passport)
}
// app.use('/ps', psRoutes )