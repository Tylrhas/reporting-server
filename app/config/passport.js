module.exports = function (passport, user) {
    var User = user
    var OAuth2Strategy = require('passport-oauth2')
    var request = require('request')
  
    passport.serializeUser(function (user, done) {
      // placeholder for custom user serialization
      // null is for errors
      done(null, user)
    })
  
    passport.deserializeUser(function (user, done) {
      // placeholder for custom user deserialization.
      // maybe you are going to get the user from mongo by id?
      // null is for errors
      done(null, user)
    })
  
    // oauth 2 configuration for the passport strategy
    passport.use(new OAuth2Strategy({
      authorizationURL: process.env.G5_AUTH_ENDPOINT,
      tokenURL: process.env.G5_TOKEN_ENDPOINT,
      clientID: process.env.G5_AUTH_CLIENT_ID,
      clientSecret: process.env.G5_AUTH_CLIENT_SECRET,
      callbackURL: process.env.G5_AUTH_REDIRECT_URI
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(accessToken)
      console.log(cb)
      // use access token for bearer token to me endpoint to get the users info then create the user in the database
      request
        .get(process.env.G5_AUTH_ME_ENDPOINT, {
          'auth': {
            'bearer': accessToken
          }
        }, (error, response, body) => {
          body = JSON.parse(body)
          if (response.statusCode === 200) {
            // the token is valid
            User.findOrCreate({ where: { email: body.email }, defaults: { token: accessToken, first_name: body.first_name, last_name: body.last_name, title: body.title, role: body.roles[0].name } })
              .spread((user, created, err) => {
                console.log(user.get({
                  plain: true
                }))
                console.log(created)
                // the token is invalid
                return cb(err, user)
              })
          } else {
            // the token is invalid
            return cb(error, user)
          }
        })
    }
    ))
  }