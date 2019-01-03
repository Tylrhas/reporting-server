module.exports = {
  basic,
  isAdmin
}
function basic (req, res, next) {
  if (req.isAuthenticated()) {
      // if user is looged in, req.isAuthenticated() will return true
      next()
  } else {
      res.redirect('/g5_auth/users/auth/g5')
  }
}

function isAdmin (req, res, next) {
  if (req.isAuthenticated() && req.user.user_group == 'admin') {

      return next();

  }
  else {
      res.redirect('/');
  }
}