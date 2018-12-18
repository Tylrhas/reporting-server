const express = require('express')
const app = express()
const session = require('express-session')
const bodyParser = require('body-parser')
const passport = require('passport')
var path = require('path')
var favicon = require('serve-favicon')
app.set('views', './app/views');
app.set('view engine', 'ejs');

app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 100000 }))

// For Passport
app.use(session({
 secret: process.env.session_secret,
 resave: true,
 saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.use(favicon(path.join(__dirname, '../../public', 'favicon.png')))
app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/../../public'))
module.exports = {
 app,
 passport
}